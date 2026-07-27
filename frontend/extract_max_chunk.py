import json
log_path = r'C:\Users\eguno\.gemini\antigravity\brain\0b15d50f-a63c-4c26-8137-819666e15fae\.system_generated\logs\transcript_full.jsonl'
max_len = 0
best_content = ''
best_tc = None

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            for tc in data.get('tool_calls', []):
                if tc['name'] in ['multi_replace_file_content', 'replace_file_content']:
                    args = tc.get('args', {})
                    if 'StudentDashboard.jsx' in args.get('TargetFile', ''):
                        chunks = args.get('ReplacementChunks', [])
                        if not chunks and 'ReplacementContent' in args:
                            chunks = [{'ReplacementContent': args['ReplacementContent']}]
                        for c in chunks:
                            rc = c.get('ReplacementContent', '')
                            if len(rc) > max_len:
                                max_len = len(rc)
                                best_content = rc
                                best_tc = tc

if best_content:
    with open(r'C:\Users\eguno\OneDrive\Desktop\EngageAI\frontend\StudentDashboard_max_chunk.jsx', 'w', encoding='utf-8') as out:
        out.write(best_content)
    print(f'Found chunk with {max_len} chars')
else:
    print('No chunks found')
