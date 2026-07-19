$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$files = @('app.jsx', 'online-table-components.jsx', 'app.compiled.js', 'online-table-components.compiled.js')

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
$manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $output -Encoding utf8
Write-Output "Manifiesto de compilacion actualizado."
