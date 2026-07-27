import urllib.request, json

users = ['admin@ssvuniversity.in', 'rajesh.kumar@ssvuniversity.in', '26cs001@ssvuniversity.in']
for u in users:
    try:
        req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=json.dumps({'email': u, 'password': '123456'}).encode(), headers={'Content-Type': 'application/json'})
        token = json.loads(urllib.request.urlopen(req).read().decode())['access_token']
        
        req2 = urllib.request.Request('http://127.0.0.1:8000/api/academic/meets/ENGAGE-MEET-066DFA99/join-check', headers={'Authorization': f'Bearer {token}'})
        res = json.loads(urllib.request.urlopen(req2).read().decode())
        print(f"[{u}] Status: {res.get('status')} | Message: {res.get('message')}")
    except urllib.error.HTTPError as e:
        print(f"[{u}] HTTP {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"[{u}] Error: {e}")
