import os
import json
import shutil
import urllib.parse
from datetime import datetime

appdata = os.environ.get("APPDATA")
history_dir = os.path.join(appdata, "Code", "User", "History")
output_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\RESTORE_V79"
os.makedirs(output_dir, exist_ok=True)

recovered_count = 0
found_files = []

for root, dirs, files in os.walk(history_dir):
    if "entries.json" in files:
        entries_path = os.path.join(root, "entries.json")
        try:
            with open(entries_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            resource = data.get("resource", "")
            resource_decoded = urllib.parse.unquote(resource).lower()
            
            if "erp_sig" in resource_decoded:
                clean_path = urllib.parse.unquote(resource).replace("file:///", "").replace("/", "\\")
                entries = data.get("entries", [])
                
                if entries:
                    entries.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
                    latest_entry = entries[0]
                    # also look for previous entries if we need history
                    
                    latest_id = latest_entry.get("id")
                    source_file = os.path.join(root, latest_id)
                    
                    if os.path.exists(source_file):
                        relative_path = clean_path.split("ERP_SIG", 1)[-1].lstrip("\\/")
                        if not relative_path:
                            # uppercase fallback
                            relative_path = clean_path.split("erp_sig", 1)[-1].lstrip("\\/")
                            
                        dest_path = os.path.join(output_dir, "LATEST_" + relative_path.replace("\\", "_").replace("/", "_"))
                        
                        shutil.copy2(source_file, dest_path)
                        found_files.append(relative_path)
                        recovered_count += 1
                        
        except Exception as e:
            pass

print(f"Total files found: {recovered_count}")
for f in found_files:
    print(f)
