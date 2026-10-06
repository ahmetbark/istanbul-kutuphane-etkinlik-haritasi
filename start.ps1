param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$siteRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$sitePort = 8765
while ($sitePort -lt 8785) {
    try {
        $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $sitePort)
        $listener.Start()
        break
    } catch { $sitePort++ }
}
if ($sitePort -ge 8785) { throw 'Yerel site baslatilamadi.' }
$siteUrl = "http://localhost:$sitePort/"
Write-Host "Harita: $siteUrl"
Write-Host 'Haritayi kullanirken bu pencereyi acik tutun. Kapatmak icin Ctrl+C.'
if (-not $NoBrowser) { Start-Process $siteUrl }
$mimeTypes = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.csv'='text/csv; charset=utf-8';'.png'='image/png'}
try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 3000
            $stream = $client.GetStream()
            $reader = New-Object IO.StreamReader($stream)
            $firstLine = $reader.ReadLine()
            if (-not $firstLine) { continue }
            do { $headerLine = $reader.ReadLine() } while ($headerLine)
            $requestParts = $firstLine.Split(' ')
            $relative = [Uri]::UnescapeDataString(($requestParts[1] -split '\?')[0]).TrimStart('/')
            if (-not $relative) { $relative = 'index.html' }
            $filePath = [IO.Path]::GetFullPath((Join-Path $siteRoot $relative))
            $status = '404 Not Found'
            $body = [Text.Encoding]::UTF8.GetBytes('Not found')
            $mime = 'text/plain'
            if ($requestParts[0] -in @('GET','HEAD') -and $filePath.StartsWith($siteRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -and [IO.File]::Exists($filePath)) {
                $status = '200 OK'
                $body = [IO.File]::ReadAllBytes($filePath)
                $mime = $mimeTypes[[IO.Path]::GetExtension($filePath)]
                if (-not $mime) { $mime = 'application/octet-stream' }
            }
            $responseHeaders = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nReferrer-Policy: strict-origin-when-cross-origin`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($responseHeaders)
            $stream.Write($headerBytes,0,$headerBytes.Length)
            if ($requestParts[0] -ne 'HEAD') { $stream.Write($body,0,$body.Length) }
        } catch { Write-Verbose $_ } finally { $client.Close() }
    }
} finally { $listener.Stop() }
