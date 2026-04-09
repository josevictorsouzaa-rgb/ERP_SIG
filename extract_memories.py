import os
import re

brain_dir = r"C:\Users\DELL G15\.gemini\antigravity\brain"
output_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\RECUPERADO_V70"

os.makedirs(output_dir, exist_ok=True)

# List of the target conversation IDs contributing to V70
conv_ids = [
    "f190d44c-4e92-4287-b128-43428df2ac0e",
    "2402fbb9-95c3-45ef-9feb-642b4b56cfff",
    "67b7ea98-2f02-447e-9770-7fc65c1e19cc",
    "d2ad7abe-25ce-47d7-b44c-706b5ca23491",
    "d90b09e4-1d0d-484c-b084-0d17ba41b932",
    "9190dc67-822e-46ee-991d-203c4c9e23e8",
    "84d2625f-bfdb-43d3-a7f6-46b5a1ac9756",
    "25cc30dc-a54a-4de9-ab16-e7bb335f37fa"
]

code_blocks_found = 0

for cid in conv_ids:
    log_path = os.path.join(brain_dir, cid, ".system_generated", "logs", "overview.txt")
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Regex to find all code blocks ```lang ... ```
        blocks = re.findall(r'```(html|javascript|js|go|python)\n(.*?)\n```', content, flags=re.DOTALL)
        if blocks:
            for i, (lang, code) in enumerate(blocks):
                # Ignore very small blocks like bash or simple config
                if len(code) < 300: continue
                
                # Try to guess a filename from the code content (class name, function, or HTML title)
                # Just save it as sequentially
                filename = f"{cid}_{i}.{lang.replace('javascript', 'js')}"
                code_blocks_found += 1
                
                with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as out:
                    out.write(code)

print(f"Extracted {code_blocks_found} code blocks into {output_dir}")
