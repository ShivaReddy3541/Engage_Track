import urllib.request, json, sys

u = 'rajesh.kumar@ssvuniversity.in'
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=json.dumps({'email': u, 'password': '123456'}).encode(), headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req).read().decode())['access_token']

req2 = urllib.request.Request('http://127.0.0.1:8000/api/academic/meets/MEET-TEST-FACULTY-1/join-check', headers={'Authorization': f'Bearer {token}'})
res = json.loads(urllib.request.urlopen(req2).read().decode())
output = f"Faculty Check Status: {res.get('status')} | Message: {res.get('message')}\n"
sys.stdout.buffer.write(output.encode('utf-8', errors='replace'))
