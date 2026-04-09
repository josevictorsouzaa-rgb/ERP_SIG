import os, re
chunk_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\extracted_from_exe\specific\cadastro_form_fragmento_chunk.html'
dest_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\cadastro_form_fragmento.html'

with open(chunk_path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

start_idx = text.find('<!-- BLOCO')
if start_idx == -1:
    start_idx = text.find('<!--')
if start_idx != -1:
    snippet = text[start_idx:start_idx+80000]
    
    # We want to find the end of the form fragment HTML
    # The form ends with </form> usually, let's find the last one within a reasonable size
    # In V79, this fragment is included inside another div. Let's find </form>
    end_form = snippet.rfind('</form>')
    if end_form != -1:
        snippet = snippet[:end_form + 7]
    else:
        # maybe it's just a huge chunk of HTML, let's keep it tight
        snippet = snippet[:45000]
            
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(snippet)
    print('Fragment_form_saved.')
else:
    print('Failed to find start_idx')
