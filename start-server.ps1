# Servidor Web Local Ligero en PowerShell para Gearheadz Motorsports (headmotorz)
# Accesible desde el PC (localhost) Y desde el telefono en la misma red WiFi.

$port = 3001
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")   # '+' = todas las interfaces (WiFi incluida)

# Obtener la IP de WiFi para mostrarla al usuario
$lanIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"
} | Select-Object -First 1).IPAddress

# Determinar el directorio base del script
$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  GEARHEADZ MOTORSPORTS --- Servidor local" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  PC (localhost):  http://localhost:$port" -ForegroundColor Cyan
    if ($lanIP) {
        Write-Host "  TELEFONO (WiFi): http://${lanIP}:$port" -ForegroundColor Yellow
        Write-Host "  -> Conecta tu telefono al mismo WiFi" -ForegroundColor DarkYellow
    }
    Write-Host "  Ctrl+C para detener" -ForegroundColor DarkGray
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Start-Process "http://localhost:$port"

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            # Obtener la ruta del archivo solicitado
            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/") { $urlPath = "/index.html" }
            
            # Decodificar caracteres especiales de la URL (espacios, acentos, etc.)
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)
            
            # Quitar el '/' del inicio para buscar el archivo en la carpeta local
            $relPath = $urlPath.TrimStart('/')
            $filePath = Join-Path $baseDir $relPath

            Write-Host "Solicitud: $urlPath" -NoNewline

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Mapear las extensiones de archivos a sus tipos MIME correctos
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif"  { "image/gif" }
                    ".svg"  { "image/svg+xml" }
                    ".mp4"  { "video/mp4" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host " -> 200 OK ($contentType)" -ForegroundColor Green
            } else {
                # Si el archivo no existe, responder 404
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                Write-Host " -> 404 Not Found (Ruta física: $filePath)" -ForegroundColor Red
            }
            $response.OutputStream.Close()
        } catch {
            Write-Host " -> Error al procesar: $_" -ForegroundColor DarkRed
            if ($response) {
                try { $response.Close() } catch {}
            }
        }
    }
} catch {
    Write-Error $_
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
