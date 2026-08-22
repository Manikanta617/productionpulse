"""Helper script to install requirements ensuring IPv4 fallback for Windows environments."""
import socket
import sys

# Patch socket.getaddrinfo to force IPv4 (AF_INET) resolution on Windows systems where IPv6 connectivity fails
_orig_gai = socket.getaddrinfo

def _ipv4_gai(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_gai(host, port, socket.AF_INET, type, proto, flags)

socket.getaddrinfo = _ipv4_gai

if __name__ == "__main__":
    from pip._internal.cli.main import main
    req_file = sys.argv[1] if len(sys.argv) > 1 else "backend/requirements.txt"
    sys.exit(main(["install", "-r", req_file]))
