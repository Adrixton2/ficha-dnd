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
  fetch('./src/features/dice/DiceRoller.jsx').then(response => response.text()),
  fetch('./src/features/online-table/OnlineTableComponents.jsx').then(response => response.text()),
  fetch('./src/features/character/CharacterBuilder.jsx').then(response => response.text()),
  fetch('./src/features/bestiary/Bestiary.jsx').then(response => response.text()),
  fetch('./src/shared/components/LocalModals.jsx').then(response => response.text()),
  fetch('./src/features/spellbook/Spellbook.jsx').then(response => response.text()),
  fetch('./src/shared/components/CharacterPrimitives.jsx').then(response => response.text()),
  fetch('./src/features/companions/CompanionManager.jsx').then(response => response.text()),
  fetch('./src/features/combat/SessionMode.jsx').then(response => response.text()),
  fetch('./src/features/inventory/InventoryView.jsx').then(response => response.text()),
  fetch('./src/features/character/CharacterFooter.jsx').then(response => response.text()),
  fetch('./src/features/online-table/OnlineTable.jsx').then(response => response.text()),
  fetch('./src/features/combat/CombatDashboard.jsx').then(response => response.text()),
  fetch('./src/features/character/CharacterHeader.jsx').then(response => response.text()),
  fetch('./src/features/character/CharacterSheet.jsx').then(response => response.text()),
  fetch('./src/features/online-table/useOnlineRoom.jsx').then(response => response.text()),
  fetch('./src/shared/components/dialogs/CompendiumDialogs.jsx').then(response => response.text()),
  fetch('./src/shared/components/dialogs/ActionDialogs.jsx').then(response => response.text()),
  fetch('./src/shared/components/dialogs/EditorDialogs.jsx').then(response => response.text()),
  fetch('./src/app/CharacterSheetApp.jsx').then(response => response.text()),
  fetch('./src/App.jsx').then(response => response.text())
])).then(([diceComponents, components, characterBuilder, bestiaryComponents, localModals, spellbookComponents, characterSheetComponents, companionComponents, sessionModeComponents, inventoryViewComponents, characterFooterComponents, onlineTableShellComponents, combatDashboardComponents, characterHeaderComponents, characterWorkspaceComponents, onlineTableController, compendiumDialogComponents, actionDialogComponents, editorDialogComponents, characterSheetApp, app]) => {
  const options = { presets: [['react', { runtime: 'classic' }]] };
  window.__dndCompiled = {
    diceComponents: Babel.transform(`(() => {\n${diceComponents}\n})();`, options).code,
    components: Babel.transform(`(() => {\n${components}\n})();`, options).code,
    characterBuilder: Babel.transform(`(() => {\n${characterBuilder}\n})();`, options).code,
    bestiaryComponents: Babel.transform(`(() => {\n${bestiaryComponents}\n})();`, options).code,
    localModals: Babel.transform(`(() => {\n${localModals}\n})();`, options).code,
    spellbookComponents: Babel.transform(`(() => {\n${spellbookComponents}\n})();`, options).code,
    characterSheetComponents: Babel.transform(`(() => {\n${characterSheetComponents}\n})();`, options).code,
    companionComponents: Babel.transform(`(() => {\n${companionComponents}\n})();`, options).code,
    sessionModeComponents: Babel.transform(`(() => {\n${sessionModeComponents}\n})();`, options).code,
    inventoryViewComponents: Babel.transform(`(() => {\n${inventoryViewComponents}\n})();`, options).code,
    characterFooterComponents: Babel.transform(`(() => {\n${characterFooterComponents}\n})();`, options).code,
    onlineTableShellComponents: Babel.transform(`(() => {\n${onlineTableShellComponents}\n})();`, options).code,
    combatDashboardComponents: Babel.transform(`(() => {\n${combatDashboardComponents}\n})();`, options).code,
    characterHeaderComponents: Babel.transform(`(() => {\n${characterHeaderComponents}\n})();`, options).code,
    characterWorkspaceComponents: Babel.transform(`(() => {\n${characterWorkspaceComponents}\n})();`, options).code,
    onlineTableController: Babel.transform(`(() => {\n${onlineTableController}\n})();`, options).code,
    compendiumDialogComponents: Babel.transform(`(() => {\n${compendiumDialogComponents}\n})();`, options).code,
    actionDialogComponents: Babel.transform(`(() => {\n${actionDialogComponents}\n})();`, options).code,
    editorDialogComponents: Babel.transform(`(() => {\n${editorDialogComponents}\n})();`, options).code,
    characterSheetApp: Babel.transform(`(() => {\n${characterSheetApp}\n})();`, options).code,
    app: Babel.transform(app, options).code
  };
  return {
    diceComponentsLength: window.__dndCompiled.diceComponents.length,
    componentsLength: window.__dndCompiled.components.length,
    characterBuilderLength: window.__dndCompiled.characterBuilder.length,
    bestiaryComponentsLength: window.__dndCompiled.bestiaryComponents.length,
    localModalsLength: window.__dndCompiled.localModals.length,
    spellbookComponentsLength: window.__dndCompiled.spellbookComponents.length,
    characterSheetComponentsLength: window.__dndCompiled.characterSheetComponents.length,
    companionComponentsLength: window.__dndCompiled.companionComponents.length,
    sessionModeComponentsLength: window.__dndCompiled.sessionModeComponents.length,
    inventoryViewComponentsLength: window.__dndCompiled.inventoryViewComponents.length,
    characterFooterComponentsLength: window.__dndCompiled.characterFooterComponents.length,
    onlineTableShellComponentsLength: window.__dndCompiled.onlineTableShellComponents.length,
    combatDashboardComponentsLength: window.__dndCompiled.combatDashboardComponents.length,
    characterHeaderComponentsLength: window.__dndCompiled.characterHeaderComponents.length,
    characterWorkspaceComponentsLength: window.__dndCompiled.characterWorkspaceComponents.length,
    onlineTableControllerLength: window.__dndCompiled.onlineTableController.length,
    compendiumDialogComponentsLength: window.__dndCompiled.compendiumDialogComponents.length,
    actionDialogComponentsLength: window.__dndCompiled.actionDialogComponents.length,
    editorDialogComponentsLength: window.__dndCompiled.editorDialogComponents.length,
    characterSheetAppLength: window.__dndCompiled.characterSheetApp.length,
    appLength: window.__dndCompiled.app.length
  };
})
'@

    $compiled = Invoke-Cdp 'Runtime.evaluate' @{ expression = $compileExpression; awaitPromise = $true; returnByValue = $true }
    if ($compiled.result.exceptionDetails) { throw $compiled.result.exceptionDetails.text }

    $lengths = $compiled.result.result.value
    foreach ($entry in @(
        @{ Name = 'diceComponents'; Length = [int]$lengths.diceComponentsLength; Output = 'dist/features/dice/DiceRoller.js' },
        @{ Name = 'components'; Length = [int]$lengths.componentsLength; Output = 'dist/features/online-table/OnlineTableComponents.js' },
        @{ Name = 'characterBuilder'; Length = [int]$lengths.characterBuilderLength; Output = 'dist/features/character/CharacterBuilder.js' },
        @{ Name = 'bestiaryComponents'; Length = [int]$lengths.bestiaryComponentsLength; Output = 'dist/features/bestiary/Bestiary.js' },
        @{ Name = 'localModals'; Length = [int]$lengths.localModalsLength; Output = 'dist/shared/components/LocalModals.js' },
        @{ Name = 'spellbookComponents'; Length = [int]$lengths.spellbookComponentsLength; Output = 'dist/features/spellbook/Spellbook.js' },
        @{ Name = 'characterSheetComponents'; Length = [int]$lengths.characterSheetComponentsLength; Output = 'dist/shared/components/CharacterPrimitives.js' },
        @{ Name = 'companionComponents'; Length = [int]$lengths.companionComponentsLength; Output = 'dist/features/companions/CompanionManager.js' },
        @{ Name = 'sessionModeComponents'; Length = [int]$lengths.sessionModeComponentsLength; Output = 'dist/features/combat/SessionMode.js' },
        @{ Name = 'inventoryViewComponents'; Length = [int]$lengths.inventoryViewComponentsLength; Output = 'dist/features/inventory/InventoryView.js' },
        @{ Name = 'characterFooterComponents'; Length = [int]$lengths.characterFooterComponentsLength; Output = 'dist/features/character/CharacterFooter.js' },
        @{ Name = 'onlineTableShellComponents'; Length = [int]$lengths.onlineTableShellComponentsLength; Output = 'dist/features/online-table/OnlineTable.js' },
        @{ Name = 'combatDashboardComponents'; Length = [int]$lengths.combatDashboardComponentsLength; Output = 'dist/features/combat/CombatDashboard.js' },
        @{ Name = 'characterHeaderComponents'; Length = [int]$lengths.characterHeaderComponentsLength; Output = 'dist/features/character/CharacterHeader.js' },
        @{ Name = 'characterWorkspaceComponents'; Length = [int]$lengths.characterWorkspaceComponentsLength; Output = 'dist/features/character/CharacterSheet.js' },
        @{ Name = 'onlineTableController'; Length = [int]$lengths.onlineTableControllerLength; Output = 'dist/features/online-table/useOnlineRoom.js' },
        @{ Name = 'compendiumDialogComponents'; Length = [int]$lengths.compendiumDialogComponentsLength; Output = 'dist/shared/components/dialogs/CompendiumDialogs.js' },
        @{ Name = 'actionDialogComponents'; Length = [int]$lengths.actionDialogComponentsLength; Output = 'dist/shared/components/dialogs/ActionDialogs.js' },
        @{ Name = 'editorDialogComponents'; Length = [int]$lengths.editorDialogComponentsLength; Output = 'dist/shared/components/dialogs/EditorDialogs.js' },
        @{ Name = 'characterSheetApp'; Length = [int]$lengths.characterSheetAppLength; Output = 'dist/app/CharacterSheetApp.js' },
        @{ Name = 'app'; Length = [int]$lengths.appLength; Output = 'dist/App.js' }
    )) {
        $outputPath = Join-Path $root $entry.Output
        [IO.Directory]::CreateDirectory((Split-Path -Parent $outputPath)) | Out-Null
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
    Write-Output "Compilación completada: dist/App.js ($($lengths.appLength) caracteres)."
} finally {
    if ($chrome -and -not $chrome.HasExited) { Stop-Process -Id $chrome.Id -Force }
}
