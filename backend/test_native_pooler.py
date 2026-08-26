import socket
import struct

host = "db.tnxaefuxgxtuadxxvjhw.supabase.co"
port = 6543
user = "postgres"

try:
    s = socket.create_connection((host, port), timeout=3)
    params = f"user\0{user}\0database\0postgres\0\0"
    msg = struct.pack("!II", 8 + len(params), 196608) + params.encode('utf-8')
    s.sendall(msg)
    
    resp_type = s.recv(1).decode('utf-8')
    if resp_type == 'R':
        print("SUCCESS! Pooler accepted standard username!")
    elif resp_type == 'E':
        length = struct.unpack("!I", s.recv(4))[0]
        err_data = s.recv(length - 4).decode('utf-8', errors='ignore')
        print(f"Error: {err_data}")
    s.close()
except Exception as e:
    print(f"Failed: {e}")
