import os

with open("ponte_principal.go", "r", encoding="utf-8") as f:
    go_code = f.read()

# Make sure we add "github.com/wailsapp/wails/v2/pkg/runtime" if it's not present
if "github.com/wailsapp/wails/v2/pkg/runtime" not in go_code:
    # Actually wails runtime package must be present because it's a wails app.
    # Wails provides runtime.MessageDialog in "github.com/wailsapp/wails/v2/pkg/runtime"
    pass

mostrar_confirmacao = """
// MostrarConfirmacao displays a native OS prompt for YES/NO
func (a *App) MostrarConfirmacao(titulo string, mensagem string) bool {
	dialog := runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Title:         titulo,
		Message:       mensagem,
		DefaultButton: "Não",
		CancelButton:  "Não",
	}
	result, _ := runtime.MessageDialog(a.ctx, dialog)
	return result == "Yes" || result == "Sim"
}
"""

if "func (a *App) MostrarConfirmacao" not in go_code:
    # Append at the end of the file
    go_code += "\n" + mostrar_confirmacao
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(go_code)
