# --- Script para convertir JPG a WebP y borrar originales ---

# Define la ruta de la carpeta principal que contiene las subcarpetas con imágenes.
# El script asume que se ejecuta desde la propia carpeta 'images'.
$rutaPrincipal = Get-Location

# Define la ruta al ejecutable cwebp.exe.
# Asumimos que cwebp.exe está en la misma carpeta 'images'.
$cwebpPath = Join-Path $rutaPrincipal "cwebp.exe"

# Comprobar si cwebp.exe existe antes de continuar.
if (-not (Test-Path $cwebpPath)) {
    Write-Host "Error: No se encontró 'cwebp.exe' en la ruta '$rutaPrincipal'." -ForegroundColor Red
    Write-Host "Por favor, descarga la herramienta y colócala en la misma carpeta que este script." -ForegroundColor Yellow
    # Pausa para que el usuario pueda leer el mensaje y sale.
    Read-Host "Presiona Enter para salir"
    exit
}

Write-Host "Iniciando la conversión de imágenes JPG a WebP..." -ForegroundColor Green

# Buscar recursivamente todos los archivos .jpg en todas las subcarpetas.
Get-ChildItem -Path $rutaPrincipal -Recurse -Filter *.jpg | ForEach-Object {
    $jpgFile = $_
    $webpFile = [System.IO.Path]::ChangeExtension($jpgFile.FullName, ".webp")

    # Muestra en pantalla el archivo que se está procesando.
    Write-Host "Convirtiendo: $($jpgFile.FullName)"

    # Ejecuta el comando de conversión de cwebp.
    # El argumento '&' es necesario para ejecutar comandos externos en PowerShell.
    & $cwebpPath -q 80 $jpgFile.FullName -o $webpFile

    # Comprueba si el archivo .webp se creó correctamente.
    if ($?) { # $? contiene el estado de la última operación (true si fue exitosa)
        Write-Host " -> Creado: $($webpFile)" -ForegroundColor Cyan
        # Si la conversión fue exitosa, elimina el archivo .jpg original.
        Remove-Item $jpgFile.FullName
        Write-Host " -> Borrado: $($jpgFile.FullName)" -ForegroundColor Magenta
    } else {
        # Si hubo un error en la conversión, informa y no borra el original.
        Write-Host "Error al convertir $($jpgFile.FullName). No se borrará el archivo original." -ForegroundColor Red
    }
}

Write-Host "¡Proceso completado!" -ForegroundColor Green
Read-Host "Presiona Enter para finalizar el script"