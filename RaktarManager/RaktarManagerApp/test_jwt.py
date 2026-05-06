from authlib.jose import jwt
import os

# Simulating the backend environment
path = os.path.abspath(os.path.dirname(__file__))
key_path = os.path.join(path, ".ssh", "private_key.pem")
with open(key_path, 'r') as f:
    key = f.read()

payload = {"user_id": 1, "roles": ["Admin"], "exp": 2000000000}
header = {"alg": "RS256"}

try:
    token = jwt.encode(header, payload, key)
    print("Token encoded successfully.")
    
    # Now try to decode with the SAME key (private key)
    # For RS256, this SHOULD fail or require the public key
    decoded = jwt.decode(token, key)
    print("Token decoded successfully with private key!")
    print(decoded)
except Exception as e:
    print(f"Error: {e}")
