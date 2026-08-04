import urllib.request, urllib.error, json
req = urllib.request.Request('http://127.0.0.1:8000/api/chat', data=json.dumps({'message':'Hello'}).encode('utf-8'), headers={'Content-Type':'application/json'}, method='POST')
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())
