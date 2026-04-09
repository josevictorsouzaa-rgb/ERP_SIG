import os
import re
import json

brain_dir = r"C:\Users\DELL G15\.gemini\antigravity\brain"
output_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\RESTORE_BRAIN"
os.makedirs(output_dir, exist_ok=True)

targets = ["cadastro_produto.html", "modal_produto.js", "fiscal.html", "matriz.html"]
latest_code = {t: {"time": "", "code": ""} for t in targets}

for root, dirs, files in os.walk(brain_dir):
    if "overview.txt" in files:
        path = os.path.join(root, "overview.txt")
        # Try to parse the file using simple string matching or regex
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
            # Find all write_to_file calls
            # The structure is usually JSON embedded in the text
            # We will use string searching to find "TargetFile": "..."
            
            pattern = re.compile(r'"name":\s*"default_api:write_to_file",\s*"args":\s*(\{.*?\})\s*\}', re.DOTALL)
            matches = pattern.findall(content)
            
            for m in matches:
                try:
                    args = json.loads(m)
                    target_file = args.get("TargetFile", "")
                    code_content = args.get("CodeContent", "")
                    
                    for t in targets:
                        if target_file.endswith(t):
                            # We don't have exact timestamps per call easily in overview.txt, 
                            # but we can rely on folder modification time as a proxy, 
                            # or just append them sequentially (the last one found in chronological order)
                            folder_time = os.path.getmtime(path)
                            if not latest_code[t]["time"] or folder_time > latest_code[t]["time"]:
                                latest_code[t]["time"] = folder_time
                                latest_code[t]["code"] = code_content
                except:
                    pass

for t, data in latest_code.items():
    if data["code"]:
        out_path = os.path.join(output_dir, t)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(data["code"])
        print(f"Restored {t} from brain logs.")
