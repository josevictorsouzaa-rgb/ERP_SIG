import os
import json
import shutil
import urllib.parse

from pathlib import Path

appdata = os.environ.get("APPDATA")
history_dir = os.path.join(appdata, "Code", "User", "History")
output_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\RESTORE_V79"

os.makedirs(output_dir, exist_ok=True)

recovered_count = 0

for root, dirs, files in os.walk(history_dir):
    if "entries.json" in files:
        entries_path = os.path.join(root, "entries.json")
        try:
            with open(entries_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # The resource URL file:///c%3A/Users/...
            resource = data.get("resource", "")
            if "ERP_SIG" in urllib.parse.unquote(resource):
                # We found a file that belonged to ERP_SIG
                # Decode the path to figure out its original filename
                clean_path = urllib.parse.unquote(resource).replace("file:///", "").replace("/", "\\")
                
                # Get the latest entry
                entries = data.get("entries", [])
                if entries:
                    entries.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
                    latest_entry = entries[0]
                    latest_id = latest_entry.get("id")
                    source_file = os.path.join(root, latest_id)
                    
                    if os.path.exists(source_file):
                        # Construct a flat or semi-flat filename so it's easy to read
                        # e.g. frontend_paginas_entradas_entradas.html
                        relative_path = clean_path.split("ERP_SIG\\")[-1]
                        
                        # Let's recreate the folder structure inside RESTORE_V79!
                        dest_path = os.path.join(output_dir, relative_path)
                        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                        
                        shutil.copy2(source_file, dest_path)
                        print(f"Restored: {relative_path}")
                        recovered_count += 1
                        
        except Exception as e:
            pass

print(f"\nTotal files completely resurrected from VSCode Local History: {recovered_count}")
