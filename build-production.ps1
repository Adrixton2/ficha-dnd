param(
    [int]$Port = 0
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestScript = Join-Path $root 'scripts\update-build-manifest.ps1'
$spellIconRegistryScript = Join-Path $root 'scripts\update-spell-icon-registry.mjs'
$monsterIconRegistryScript = Join-Path $root 'scripts\update-monster-icon-registry.mjs'
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (-not (Test-Path -LiteralPath $chromePath)) {
    throw "No se encontró Chrome en $chromePath."
}

& node $spellIconRegistryScript
if ($LASTEXITCODE -ne 0) { throw 'No se pudo actualizar el registro de iconos de conjuros.' }
& node $monsterIconRegistryScript
if ($LASTEXITCODE -ne 0) { throw 'No se pudo actualizar el registro de iconos de criaturas.' }

if ($Port -le 0) {
    $Port = Get-Random -Minimum 9200 -Maximum 9900
}

$profile = Join-Path ([IO.Path]::GetTempPath()) ("dnd-babel-check-" + [guid]::NewGuid().ToString('N'))
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
new Promise((resolve, reject) => {
  const startedAt = Date.now();
  const waitForBabel = () => {
    if (window.Babel) return resolve();
    if (Date.now() - startedAt > 15000) return reject(new Error('Babel no se cargó a tiempo.'));
    setTimeout(waitForBabel, 100);
  };
  waitForBabel();
}).then(() => Promise.all([
  fetch('./dice-components.jsx').then(response => response.text()),
  fetch('./online-table-components.jsx').then(response => response.text()),
  fetch('./character-builder-components.jsx').then(response => response.text()),
  fetch('./bestiary-components.jsx').then(response => response.text()),
  fetch('./local-modal-components.jsx').then(response => response.text()),
  fetch('./spellbook-components.jsx').then(response => response.text()),
  fetch('./app.jsx').then(response => response.text())
])).then(([diceComponents, components, characterBuilder, bestiaryComponents, localModals, spellbookComponents, app]) => {
  const options = { presets: [['react', { runtime: 'classic' }]] };
  window.__dndCompiled = {
    diceComponents: Babel.transform(`(() => {\n${diceComponents}\n})();`, options).code,
    components: Babel.transform(`(() => {\n${components}\n})();`, options).code,
    characterBuilder: Babel.transform(`(() => {\n${characterBuilder}\n})();`, options).code,
    bestiaryComponents: Babel.transform(`(() => {\n${bestiaryComponents}\n})();`, options).code,
    localModals: Babel.transform(`(() => {\n${localModals}\n})();`, options).code,
    spellbookComponents: Babel.transform(`(() => {\n${spellbookComponents}\n})();`, options).code,
    app: Babel.transform(app, options).code
  };
  return {
    diceComponentsLength: window.__dndCompiled.diceComponents.length,
    componentsLength: window.__dndCompiled.components.length,
    characterBuilderLength: window.__dndCompiled.characterBuilder.length,
    bestiaryComponentsLength: window.__dndCompiled.bestiaryComponents.length,
    localModalsLength: window.__dndCompiled.localModals.length,
    spellbookComponentsLength: window.__dndCompiled.spellbookComponents.length,
    appLength: window.__dndCompiled.app.length
  };
})
'@

    $compiled = Invoke-Cdp 'Runtime.evaluate' @{ expression = $compileExpression; awaitPromise = $true; returnByValue = $true }
    if ($compiled.result.exceptionDetails) { throw $compiled.result.exceptionDetails.text }

    $lengths = $compiled.result.result.value
    foreach ($entry in @(
        @{ Name = 'diceComponents'; Length = [int]$lengths.diceComponentsLength; Output = 'dice-components.compiled.js' },
        @{ Name = 'components'; Length = [int]$lengths.componentsLength; Output = 'online-table-components.compiled.js' },
        @{ Name = 'characterBuilder'; Length = [int]$lengths.characterBuilderLength; Output = 'character-builder-components.compiled.js' },
        @{ Name = 'bestiaryComponents'; Length = [int]$lengths.bestiaryComponentsLength; Output = 'bestiary-components.compiled.js' },
        @{ Name = 'localModals'; Length = [int]$lengths.localModalsLength; Output = 'local-modal-components.compiled.js' },
        @{ Name = 'spellbookComponents'; Length = [int]$lengths.spellbookComponentsLength; Output = 'spellbook-components.compiled.js' },
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
    & $manifestScript
    Write-Output "Compilación completada: app.compiled.js ($($lengths.appLength) caracteres)."
} finally {
    if ($chrome -and -not $chrome.HasExited) { Stop-Process -Id $chrome.Id -Force }
}
