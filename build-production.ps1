param(
    [int]$Port = 9240
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (-not (Test-Path -LiteralPath $chromePath)) {
    throw "No se encontró Chrome en $chromePath."
}

$profile = Join-Path ([IO.Path]::GetTempPath()) 'dnd-babel-check-bestiary'
$sourceUri = 'file:///' + (($root -replace '\\', '/') + '/index.dev.html')
$chrome = Start-Process -FilePath $chromePath -PassThru -WindowStyle Hidden -ArgumentList "--headless=new --disable-gpu --allow-file-access-from-files --remote-debugging-port=$Port --user-data-dir=$profile $sourceUri"

try {
    $pages = $null
    for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
        try {
            $pages = (Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/json").Content | ConvertFrom-Json
            if ($pages) { break }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $pages) { throw 'Chrome no abrió el depurador para compilar.' }

    $page = $pages | Where-Object { $_.url -like '*index.dev.html' } | Select-Object -First 1
    if (-not $page) { throw 'No se encontró index.dev.html en Chrome.' }

    $socket = [System.Net.WebSockets.ClientWebSocket]::new()
    [void]$socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $nextId = 0

    function Invoke-Cdp {
        param([string]$Method, [hashtable]$Params = @{})
        $script:nextId += 1
        $requestId = $script:nextId
        $payload = @{ id = $requestId; method = $Method; params = $Params } | ConvertTo-Json -Compress -Depth 20
        $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
        [void]$socket.SendAsync([ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

        do {
            $buffer = New-Object byte[] 65536
            $stream = [IO.MemoryStream]::new()
            do {
                $response = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
                $stream.Write($buffer, 0, $response.Count)
            } while (-not $response.EndOfMessage)
            $message = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
        } while ($message.id -ne $requestId)
        return $message
    }

    $compileExpression = @'
Promise.all([
  fetch('./online-table-components.jsx').then(response => response.text()),
  fetch('./app.jsx').then(response => response.text())
]).then(([components, app]) => {
  const options = { presets: [['react', { runtime: 'classic' }]] };
  window.__dndCompiled = {
    components: Babel.transform(`(() => {\n${components}\n})();`, options).code,
    app: Babel.transform(app, options).code
  };
  return {
    componentsLength: window.__dndCompiled.components.length,
    appLength: window.__dndCompiled.app.length
  };
})
'@

    $compiled = Invoke-Cdp 'Runtime.evaluate' @{ expression = $compileExpression; awaitPromise = $true; returnByValue = $true }
    if ($compiled.result.exceptionDetails) { throw $compiled.result.exceptionDetails.text }

    $lengths = $compiled.result.result.value
    foreach ($entry in @(
        @{ Name = 'components'; Length = [int]$lengths.componentsLength; Output = 'online-table-components.compiled.js' },
        @{ Name = 'app'; Length = [int]$lengths.appLength; Output = 'app.compiled.js' }
    )) {
        $outputPath = Join-Path $root $entry.Output
        [IO.File]::WriteAllText($outputPath, '', [Text.UTF8Encoding]::new($false))

        for ($offset = 0; $offset -lt $entry.Length; $offset += 12000) {
            $end = [Math]::Min($offset + 12000, $entry.Length)
            $slice = Invoke-Cdp 'Runtime.evaluate' @{ expression = "window.__dndCompiled.$($entry.Name).slice($offset, $end)"; returnByValue = $true }
            if ($slice.result.exceptionDetails) { throw $slice.result.exceptionDetails.text }
            [IO.File]::AppendAllText($outputPath, [string]$slice.result.result.value, [Text.UTF8Encoding]::new($false))
        }
    }

    Invoke-Cdp 'Runtime.evaluate' @{ expression = 'window.__dndCompiled = null'; returnByValue = $true } | Out-Null
    $socket.Dispose()
    Write-Output "Compilación completada: app.compiled.js ($($lengths.appLength) caracteres)."
} finally {
    if ($chrome -and -not $chrome.HasExited) { Stop-Process -Id $chrome.Id -Force }
}
