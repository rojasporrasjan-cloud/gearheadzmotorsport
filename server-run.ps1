$port = 3001
$baseDir = "c:\Users\rojas\Desktop\Clientes\headmotorz"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()
Write-Host "SERVIDOR OK - http://localhost:$port" -ForegroundColor Green
Write-Host "TELEFONO    - http://192.168.100.130:$port" -ForegroundColor Yellow

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq "/") { $urlPath = "/index.html" }
    $urlPath = [System.Uri]::UnescapeDataString($urlPath)
    $filePath = Join-Path $baseDir $urlPath.TrimStart("/")
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $ct = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".jpeg" { "image/jpeg" }
            ".webm" { "video/webm" }
            ".mp4"  { "video/mp4" }
            ".svg"  { "image/svg+xml" }
            ".ico"  { "image/x-icon" }
            default { "application/octet-stream" }
        }
        $res.ContentType = $contentType = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host "200 $urlPath"
    } else {
        $res.StatusCode = 404
        $b = [System.Text.Encoding]::UTF8.GetBytes("404")
        $res.OutputStream.Write($b, 0, $b.Length)
        Write-Host "404 $urlPath" -ForegroundColor Red
    }
    $res.OutputStream.Close()
}
