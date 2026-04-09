# auto_build.ps1
# Script para facilitar o ciclo de desenvolvimento: Build, API Catalogo e API DPK

$exeName = "core-erp"
$fullPath = ".\build\bin\$exeName.exe"

Write-Host "--- SIG: INICIANDO CICLO FULL STACK (ERP + CAT + DPK) ---" -ForegroundColor Cyan

# 1. Fecha o app e todos os processos Node (para limpar portas 9000 e 9010)
Write-Host "Limpando processos antigos..."
Stop-Process -Name $exeName -ErrorAction SilentlyContinue
Stop-Process -Name "node" -ErrorAction SilentlyContinue 
Start-Sleep -Seconds 2

# 2. Inicia o Servidor de Integração (9000)
Write-Host "Abrindo API de Integracao (Porta 9000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node api_catalogo/src/server.js"

# 3. Inicia o Servidor Provedor DPK (Porta 9010)
Write-Host "Abrindo API DPK Local (Porta 9010)..." -ForegroundColor Yellow
$dpkFolder = 'C:\Users\DELL G15\Downloads\dpk_api_local_ready'
if (Test-Path $dpkFolder) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js" -WorkingDirectory $dpkFolder
} else {
    Write-Host "AVISO: Pasta DPK nao encontrada em $dpkFolder" -ForegroundColor Red
}

# 4. Executa o build do Wails
Write-Host "Compilando arquivos do ERP (Wails Build)..." -ForegroundColor Yellow
wails build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
    
    # 5. Abre o executável automaticamente
    Write-Host "Iniciando o aplicativo..." -ForegroundColor Magenta
    Start-Process $fullPath
    
    Write-Host "--- TUDO PRONTO! ---" -ForegroundColor Green
    Write-Host "Verifique se apareceram duas novas janelas de comando (servidores)."
} else {
    Write-Host "Ocorreu um erro durante o build." -ForegroundColor Red
}
