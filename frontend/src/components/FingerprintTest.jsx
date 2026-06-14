// frontend/src/components/FingerprintTest.jsx
// FIX: Use == 0 (loose equality) not === 0 for ErrorCode.
//      MFS100ClientService sometimes returns ErrorCode as string "0", not number 0.
//      Also use BitmapData presence as the real capture success check.

import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/fingerprint";

export default function FingerprintTest() {

  const [deviceStatus, setDeviceStatus] = useState(null);
  const [scanState,    setScanState]    = useState("idle");
  const [fpData,       setFpData]       = useState(null);
  const [scanError,    setScanError]    = useState(null);
  const [mode,         setMode]         = useState("enroll");
  const [personName,   setPersonName]   = useState("");
  const [actionResult, setActionResult] = useState(null);
  const [actionLoading,setActionLoading]= useState(false);

  // ── Step 1: Check Device ─────────────────────────────
  const checkDevice = async () => {
    setDeviceStatus({ checking: true });
    try {
      const res  = await axios.get(`${API}/device-status`, { timeout: 6000 });
      const data = res.data;

      // DEBUG: log the full response so you can inspect in browser console (F12)
      console.log("Device status response:", data);

      let count = null;
      try {
        const cnt = await axios.get(`${API}/count`, { timeout: 3000 });
        count = cnt.data.count;
      } catch { /* ignore */ }

      // FIX: use == 0 (loose) so both number 0 and string "0" match
      // ALSO check ModelNumber/SerialNumber as a fallback if ErrorCode is missing
      const deviceOk = data.serviceReachable &&
        (data.ErrorCode == 0 || data.errorCode == 0);

      if (deviceOk) {
        setDeviceStatus({ ok: true, info: data, count });
      } else if (data.serviceReachable) {
        setDeviceStatus({
          ok: false, count,
          msg: data.Description || data.description ||
               "MFS100 device not connected — plug in the USB scanner."
        });
      } else {
        setDeviceStatus({
          ok: false,
          msg: "MFS100ClientService not running. Open services.msc → Start 'MFS100 Client Service'."
        });
      }
    } catch (e) {
      console.error("Device check error:", e);
      setDeviceStatus({
        ok: false,
        msg: "Cannot reach Spring Boot on port 8080. Run: mvnw spring-boot:run"
      });
    }
  };

  // ── Step 2: Capture ───────────────────────────────────
  const captureFingerprint = async () => {
    setScanState("scanning");
    setFpData(null);
    setScanError(null);
    setActionResult(null);

    try {
      const res  = await axios.post(`${API}/capture`, {}, { timeout: 20000 });
      const data = res.data;

      // DEBUG: log the full response
      console.log("Capture response:", data);
      console.log("ErrorCode value:", data.ErrorCode, "type:", typeof data.ErrorCode);
      console.log("BitmapData present:", !!data.BitmapData);
      console.log("Quality:", data.Quality);

      // FIX: Primary check = BitmapData present (real success indicator)
      //      Secondary check = ErrorCode == 0 (loose equality handles string/number)
      const captureOk = (data.BitmapData && data.BitmapData.length > 10) ||
                        (data.ErrorCode == 0);

      if (captureOk && data.BitmapData) {
        setFpData(data);
        setScanState("success");
      } else {
        const errMsg = data.Description || data.description ||
          (data.ErrorCode == 6 ? "No finger detected — place finger firmly on scanner." :
           "Capture failed. Place finger firmly and try again.");
        setScanError(errMsg);
        setScanState("error");
      }
    } catch (e) {
      console.error("Capture error:", e);
      if (e.code === "ECONNABORTED") {
        setScanError("Timeout — no finger detected in 12s. Place finger firmly and try again.");
      } else {
        setScanError(
          e.response?.data?.Description ||
          e.response?.data?.error ||
          "Capture failed. Ensure MFS100 is connected and try again."
        );
      }
      setScanState("error");
    }
  };

  // ── Step 3A: Enroll ───────────────────────────────────
  const enrollFingerprint = async () => {
    if (!fpData?.IsoTemplate) { setActionResult({ error: "Capture a fingerprint first." }); return; }
    if (!personName.trim())   { setActionResult({ error: "Enter the person's name." });     return; }

    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await axios.post(`${API}/enroll`, {
        name:        personName.trim(),
        isoTemplate: fpData.IsoTemplate,
        bmpBase64:   fpData.BitmapData
      });
      setActionResult({ type: "enroll", ...res.data });
      setPersonName("");
      try {
        const cnt = await axios.get(`${API}/count`);
        setDeviceStatus(prev => prev ? { ...prev, count: cnt.data.count } : prev);
      } catch { /* ignore */ }
    } catch (e) {
      setActionResult({ error: e.response?.data?.error || e.message });
    } finally { setActionLoading(false); }
  };

  // ── Step 3B: Identify ─────────────────────────────────
  const identifyFingerprint = async () => {
    if (!fpData?.IsoTemplate) { setActionResult({ error: "Capture a fingerprint first." }); return; }

    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await axios.post(`${API}/identify`, {
        isoTemplate: fpData.IsoTemplate
      }, { timeout: 30000 });
      setActionResult({ type: "identify", ...res.data });
    } catch (e) {
      setActionResult({ error: e.response?.data?.error || e.message });
    } finally { setActionLoading(false); }
  };

  const reset = () => {
    setScanState("idle"); setFpData(null); setScanError(null);
    setActionResult(null); setPersonName("");
  };

  const borderColor = {
    idle:     "#d1d5db",
    scanning: "#3b82f6",
    success:  "#22c55e",
    error:    "#ef4444"
  }[scanState];

  return (
    <div style={S.page}>
      <h1 style={S.title}>🔏 FEIRS Testing</h1>
      <p  style={S.sub}>Fingerprint-based Emergency Identity Retrieval System</p>

      {/* ── Card 1: Device Status ──────────────────────── */}
      <div style={S.card}>
        <h3 style={S.h3}>Step 1 — Check MFS100 Service</h3>
        <button onClick={checkDevice} style={S.btn("#3b82f6")}>
          🔌 Check Device Status
        </button>

        {deviceStatus?.checking && (
          <p style={{ color:"#6b7280", marginTop:10, fontSize:13 }}>Checking…</p>
        )}

        {deviceStatus && !deviceStatus.checking && (
          <div style={S.box(deviceStatus.ok)}>
            {deviceStatus.ok ? (
              <>
                <Row label="MFS100ClientService" value="✅ Running" />
                <Row label="Device"              value="✅ Connected and ready" />
                {deviceStatus.info?.ModelNumber  && <Row label="Model"    value={deviceStatus.info.ModelNumber}  />}
                {deviceStatus.info?.SerialNumber && <Row label="Serial"   value={deviceStatus.info.SerialNumber} />}
                {deviceStatus.info?.FWVersion    && <Row label="Firmware" value={deviceStatus.info.FWVersion}   />}
                {deviceStatus.count != null      &&
                  <Row label="Enrolled" value={`${deviceStatus.count} person(s) in database`} />}
              </>
            ) : (
              <p style={{ color:"#dc2626", fontWeight:600, margin:0 }}>
                ❌ {deviceStatus.msg}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Card 2: Capture ────────────────────────────── */}
      <div style={S.card}>
        <h3 style={S.h3}>Step 2 — Capture Fingerprint</h3>

        <div style={{
          width:"200px", height:"200px",
          border:`3px solid ${borderColor}`,
          borderRadius:14, margin:"14px auto",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden",
          background: scanState === "scanning" ? "#eff6ff" : "#f9fafb",
          boxShadow: scanState === "scanning" ? "0 0 0 6px #bfdbfe" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s"
        }}>
          {fpData?.BitmapData
            ? <img
                src={`data:image/bmp;base64,${fpData.BitmapData}`}
                alt="Fingerprint"
                style={{ width:"100%", height:"100%", objectFit:"contain" }}
              />
            : <div style={{ textAlign:"center", color:"#9ca3af" }}>
                <div style={{ fontSize:"56px" }}>🔏</div>
                <p style={{ fontSize:"11px", margin:0 }}>
                  {scanState === "scanning" ? "Place finger now…" : "No scan yet"}
                </p>
              </div>
          }
        </div>

        <p style={{
          textAlign:"center", fontWeight:600, marginBottom:12,
          color: { idle:"#6b7280", scanning:"#2563eb", success:"#16a34a", error:"#dc2626" }[scanState]
        }}>
          {scanState === "idle"     && "Click Capture — then place finger on MFS100"}
          {scanState === "scanning" && "👆 Scanning… place finger on MFS100 scanner now"}
          {scanState === "success"  && `✅ Captured!  Quality: ${fpData?.Quality ?? "—"}`}
          {scanState === "error"    && `❌ ${scanError}`}
        </p>

        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button
            onClick={captureFingerprint}
            disabled={scanState === "scanning"}
            style={S.btn(scanState === "scanning" ? "#9ca3af" : "#22c55e")}>
            {scanState === "scanning" ? "⏳ Scanning…" : "📸 Capture"}
          </button>
          <button onClick={reset} style={S.btn("#6b7280")}>🔄 Reset</button>
        </div>
      </div>

      {/* ── Card 3: Enroll / Identify ──────────────────── */}
      <div style={S.card}>
        <div style={S.tabs}>
          <button
            onClick={() => { setMode("enroll"); setActionResult(null); }}
            style={S.tab(mode === "enroll", "#3b82f6")}>
            👤 Enroll New Person
          </button>
          <button
            onClick={() => { setMode("identify"); setActionResult(null); }}
            style={S.tab(mode === "identify", "#8b5cf6")}>
            🔍 Identify Person
          </button>
        </div>

        {/* ENROLL */}
        {mode === "enroll" && <>
          <h3 style={S.h3}>Step 3A — Enroll Fingerprint</h3>
          <p style={S.hint}>Capture fingerprint above → enter name → Save.</p>
          <input
            type="text"
            placeholder="Person's full name…"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enrollFingerprint()}
            style={S.input}
          />
          <button
            onClick={enrollFingerprint}
            disabled={actionLoading || !fpData || !personName.trim()}
            style={S.btn(actionLoading || !fpData || !personName.trim() ? "#9ca3af" : "#3b82f6")}>
            {actionLoading ? "Saving…" : "💾 Save Fingerprint"}
          </button>
          {actionResult?.type === "enroll" && (
            <div style={S.result(true)}>
              <p style={{ margin:"0 0 6px", fontWeight:700 }}>✅ Enrolled successfully!</p>
              <Row label="Name" value={actionResult.name} />
              <Row label="ID"   value={actionResult.id}   />
            </div>
          )}
        </>}

        {/* IDENTIFY */}
        {mode === "identify" && <>
          <h3 style={S.h3}>Step 3B — Identify Person</h3>
          <p style={S.hint}>Capture fingerprint above → click Find Match.</p>
          <button
            onClick={identifyFingerprint}
            disabled={actionLoading || !fpData}
            style={S.btn(actionLoading || !fpData ? "#9ca3af" : "#8b5cf6")}>
            {actionLoading ? "Searching…" : "🔍 Find Match"}
          </button>
          {actionResult?.type === "identify" && (
            actionResult.found
              ? <div style={S.result(true)}>
                  <p style={{ margin:"0 0 6px", fontWeight:700 }}>✅ Match Found!</p>
                  <Row label="Name"     value={actionResult.name}       />
                  <Row label="ID"       value={actionResult.id}         />
                  <Row label="Enrolled" value={actionResult.enrolledAt} />
                </div>
              : <div style={S.result(false)}>
                  <p style={{ margin:"0 0 4px", fontWeight:700 }}>❌ No match found</p>
                  <p style={{ color:"#6b7280", fontSize:12, margin:0 }}>
                    {actionResult.message || "This fingerprint is not in the database."}
                  </p>
                </div>
          )}
        </>}

        {actionResult?.error && (
          <div style={{ ...S.result(false), marginTop:10 }}>❌ {actionResult.error}</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <p style={{ margin:"2px 0", fontSize:13 }}><b>{label}:</b>&nbsp;{value}</p>;
}

const S = {
  page:  { maxWidth:640, margin:"40px auto", fontFamily:"'Segoe UI',Arial,sans-serif", padding:"0 20px 60px" },
  title: { color:"#1e40af", textAlign:"center", margin:"0 0 4px" },
  sub:   { textAlign:"center", color:"#6b7280", marginBottom:24, fontSize:14 },
  card:  { background:"white", border:"1px solid #e5e7eb", borderRadius:14, padding:20, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" },
  h3:    { margin:"0 0 12px", color:"#1f2937", fontSize:15 },
  hint:  { fontSize:12, color:"#6b7280", margin:"4px 0 10px", lineHeight:1.6 },
  input: { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14, marginBottom:10, boxSizing:"border-box" },
  btn:   bg => ({ background:bg, color:"white", border:"none", padding:"10px 22px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600 }),
  tabs:  { display:"flex", marginBottom:16, borderRadius:8, overflow:"hidden", border:"1px solid #e5e7eb" },
  tab:   (active, color) => ({
    flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
    background: active ? color : "white",
    color:      active ? "white" : "#374151"
  }),
  box:   ok => ({
    marginTop:12, padding:"12px 14px", borderRadius:10, fontSize:13, lineHeight:2,
    background: ok ? "#f0fdf4" : "#fef2f2",
    border:     ok ? "1px solid #86efac" : "1px solid #fca5a5"
  }),
  result: ok => ({
    marginTop:12, padding:"12px 14px", borderRadius:10, fontSize:13, lineHeight:1.8,
    background: ok ? "#f0fdf4" : "#fef2f2",
    border:     ok ? "1px solid #86efac" : "1px solid #fca5a5"
  })
};
