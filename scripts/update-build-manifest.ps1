$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$files = @(
    'src/App.jsx',
    'src/app/CharacterSheetApp.jsx',
    'src/features/character/CharacterBuilder.jsx',
    'src/features/character/CharacterHeader.jsx',
    'src/features/character/CharacterSheet.jsx',
    'src/features/character/CharacterFooter.jsx',
    'src/features/combat/CombatDashboard.jsx',
    'src/features/combat/SessionMode.jsx',
    'src/features/companions/CompanionManager.jsx',
    'src/features/inventory/InventoryView.jsx',
    'src/features/online-table/OnlineTable.jsx',
    'src/features/online-table/OnlineTableComponents.jsx',
    'src/features/online-table/useOnlineRoom.jsx',
    'src/features/dice/DiceRoller.jsx',
    'src/features/bestiary/Bestiary.jsx',
    'src/features/spellbook/Spellbook.jsx',
    'src/shared/components/CharacterPrimitives.jsx',
    'src/shared/components/LocalModals.jsx',
    'src/shared/components/dialogs/CompendiumDialogs.jsx',
    'src/shared/components/dialogs/ActionDialogs.jsx',
    'src/shared/components/dialogs/EditorDialogs.jsx',
    'dist/App.js',
    'dist/app/CharacterSheetApp.js',
    'dist/features/character/CharacterBuilder.js',
    'dist/features/character/CharacterHeader.js',
    'dist/features/character/CharacterSheet.js',
    'dist/features/character/CharacterFooter.js',
    'dist/features/combat/CombatDashboard.js',
    'dist/features/combat/SessionMode.js',
    'dist/features/companions/CompanionManager.js',
    'dist/features/inventory/InventoryView.js',
    'dist/features/online-table/OnlineTable.js',
    'dist/features/online-table/OnlineTableComponents.js',
    'dist/features/online-table/useOnlineRoom.js',
    'dist/features/dice/DiceRoller.js',
    'dist/features/bestiary/Bestiary.js',
    'dist/features/spellbook/Spellbook.js',
    'dist/shared/components/CharacterPrimitives.js',
    'dist/shared/components/LocalModals.js',
    'dist/shared/components/dialogs/CompendiumDialogs.js',
    'dist/shared/components/dialogs/ActionDialogs.js',
    'dist/shared/components/dialogs/EditorDialogs.js',
    'src/data/spell-icon-registry.js',
    'src/data/monster-icon-registry.js',
    'src/data/equipment-compendium-srd51-es.js',
    'src/data/magic-item-compendium-srd51-es.js',
    'service-worker.js'
)

function Get-NormalizedSha256([string]$Path) {
    $content = [IO.File]::ReadAllText($Path, [Text.UTF8Encoding]::new($false)) -replace "`r`n", "`n"
    $bytes = [Text.Encoding]::UTF8.GetBytes($content)
    $hash = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return -join ($hash | ForEach-Object { $_.ToString('x2') })
}

$hashes = @{}
foreach ($file in $files) {
    $path = Join-Path $root $file
    if (-not (Test-Path -LiteralPath $path)) { throw "Falta $file para generar el manifiesto." }
    $hashes[$file] = Get-NormalizedSha256 $path
}

$manifest = [ordered]@{
    schemaVersion = 1
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    files = $hashes
}

$output = Join-Path $root '.build-manifest.json'
[IO.File]::WriteAllText($output, ($manifest | ConvertTo-Json -Depth 3), [Text.UTF8Encoding]::new($false))
Write-Output "Manifiesto de compilacion actualizado."
