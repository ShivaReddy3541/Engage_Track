import json
log_path = r'C:\Users\eguno\.gemini\antigravity\brain\0b15d50f-a63c-4c26-8137-819666e15fae\.system_generated\logs\transcript_full.jsonl'
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            for tc in data.get('tool_calls', []):
                if tc['name'] == 'multi_replace_file_content':
                    args = tc.get('args', {})
                    if 'StudentDashboard.jsx' in args.get('TargetFile', ''):
                        print('StudentDashboard multi_replace:')
                        for c in args.get('ReplacementChunks', []):
                            print(f"StartLine: {c.get('StartLine')}, EndLine: {c.get('EndLine')}")
                elif tc['name'] == 'replace_file_content':
                    args = tc.get('args', {})
                    if 'StudentDashboard.jsx' in args.get('TargetFile', ''):
                        print('StudentDashboard replace:')
                        print(f"StartLine: {args.get('StartLine')}, EndLine: {args.get('EndLine')}")
