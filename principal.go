package main

import (
	"embed"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

// Embutir TUDO da pasta frontend no .EXE
//
//go:embed all:frontend
var assets embed.FS

func main() {
	exePath, _ := os.Executable()
	exeName := strings.ToLower(filepath.Base(exePath))

	modulo := ""
	if strings.Contains(exeName, "parametros") {
		modulo = "parametros"
	} else if strings.Contains(exeName, "enderecamento") {
		modulo = "enderecamento"
	} else if strings.Contains(exeName, "hub") {
		modulo = "hub"
	}

	// O módulo também pode vir por parâmetro em fallback
	for i := 0; i < len(os.Args); i++ {
		if os.Args[i] == "-module" && i+1 < len(os.Args) {
			modulo = os.Args[i+1]
		}
	}

	// 1. Criar o App (A Lógica Go)
	app := NovoApp(modulo)

	title := "SIG - LOGIN | TERMINAL ACESSO"
	startState := options.Normal
	width, height := 820, 560

	disableResize := true
	isFrameless := true

	if modulo != "" {
		title = "SIG | " + strings.ToUpper(modulo)
		width, height = 1280, 800
		disableResize = false
		startState = options.Maximised
		isFrameless = false
	}

	// 2. Rodar a Janela Nativa
	err := wails.Run(&options.App{
		Title:            title,
		Width:            width,
		Height:           height,
		DisableResize:    disableResize,
		Frameless:        isFrameless,
		WindowStartState: startState,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app, // Liga o Visual com o Go
		},
	})

	if err != nil {
		println("ERRO AO ABRIR O SISTEMA:", err.Error())
	}
}
