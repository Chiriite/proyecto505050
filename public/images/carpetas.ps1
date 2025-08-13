# --- Script para crear carpetas numeradas del 1 al 44 ---

Write-Host "Iniciando la creación de carpetas..." -ForegroundColor Green

# Bucle 'for' que cuenta desde 1 hasta 44.
for ($i=1; $i -le 44; $i++) {
    # Crea una carpeta con el número actual del bucle como nombre.
    New-Item -ItemType Directory -Name $i
    Write-Host "Creada carpeta: $i" -ForegroundColor Cyan
}

Write-Host "¡Proceso completado! Se han creado 44 carpetas." -ForegroundColor Green
Read-Host "Presiona Enter para finalizar."