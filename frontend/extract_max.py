import json
log_path = r'C:\Users\eguno\.gemini\antigravity\brain\0b15d50f-a63c-4c26-8137-819666e15fae\.system_generated\logs\transcript_full.jsonl'
max_len = 0
best_content = ''

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            for tc in data.get('tool_calls', []):
                if tc['name'] == 'write_to_file':
                    args = tc.get('args', {})
                    if 'StudentDashboard.jsx' in args.get('TargetFile', ''):
                        content = args.get('CodeContent', '')
                        if len(content) > max_len:
                            max_len = len(content)
                            best_content = content
        elif data.get('type') == 'VIEW_FILE':
            pass # We don't check view_file right now, let's just check if I ever wrote the whole file

if best_content:
    with open(r'C:\Users\eguno\OneDrive\Desktop\EngageAI\frontend\StudentDashboard_max.jsx', 'w', encoding='utf-8') as out:
        out.write(best_content)
    print(f'Found write_to_file with {max_len} chars')
else:
    print('No write_to_file found for StudentDashboard.jsx')
