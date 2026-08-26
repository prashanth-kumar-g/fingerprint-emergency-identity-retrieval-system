import socket
import struct
import sys

regions = [
    "us-east-1", "us-west-1", "us-east-2", "us-west-2",
    "ap-south-1", "ap-southeast-1", "ap-northeast-1", "ap-northeast-2",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-south-1",
    "sa-east-1", "ca-central-1", "ap-southeast-2"
]
user = "postgres.tnxaefuxgxtuadxxvjhw"

for r in regions:
    host = f"aws-0-{r}.pooler.supabase.com"
    port = 6543
    try:
        s = socket.create_connection((host, port), timeout=3)
        # PostgreSQL StartupMessage
        # Length (4 bytes), Protocol version (4 bytes), params (key\0val\0...\0)
        params = f"user\0{user}\0database\0postgres\0\0"
        msg = struct.pack("!II", 8 + len(params), 196608) + params.encode('utf-8')
        s.sendall(msg)
        
        # Read response
        resp_type = s.recv(1).decode('utf-8')
        if not resp_type: continue
        
        # E = ErrorResponse, R = AuthenticationRequest
        if resp_type == 'R':
            print(f"FOUND CORRECT REGION: {r} (Auth requested!)")
        elif resp_type == 'E':
            # Parse error message
            length = struct.unpack("!I", s.recv(4))[0]
            err_data = s.recv(length - 4).decode('utf-8', errors='ignore')
            if "tenant/user" in err_data:
                print(f"{r} -> Tenant not found")
            else:
                print(f"FOUND CORRECT REGION: {r} (Error: {err_data})")
        else:
            print(f"{r} -> Unexpected response: {resp_type}")
            
        s.close()
    except Exception as e:
        print(f"{r} -> Failed: {e}")
