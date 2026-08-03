param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\.tmp-srd51-es.txt'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\magic-item-compendium-srd51-es.js')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SourcePath)) {
    throw "No se encontro la fuente SRD: $SourcePath"
}

$lines = Get-Content -LiteralPath $SourcePath -Encoding utf8
$items = [System.Collections.Generic.List[object]]::new()
$usedIds = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

function Convert-ToCatalogId([string]$value) {
    $normalized = $value.Normalize([Text.NormalizationForm]::FormD)
    $ascii = -join ($normalized.ToCharArray() | Where-Object {
        [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark
    })
    $id = ($ascii.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    if (-not $id) { $id = 'objeto-magico' }
    return "magic-$id"
}

function Get-MagicCategory([string]$kind) {
    if ($kind -match '^Poci|^Pergamino') { return "Consumible m$([char]0x00E1)gico" }
    if ($kind -match '^Anillo') { return "Anillo m$([char]0x00E1)gico" }
    if ($kind -match '^Arma') { return "Arma m$([char]0x00E1)gica" }
    if ($kind -match '^Armadura') { return "Armadura m$([char]0x00E1)gica" }
    if ($kind -match '^Bast|^Cetro|^Varita') { return "Foco m$([char]0x00E1)gico" }
    return 'Objeto maravilloso'
}

function Get-ShortSummary([string[]]$SourceLines, [int]$TitleIndex) {
    $parts = [System.Collections.Generic.List[string]]::new()
    $started = $false

    for ($offset = $TitleIndex + 2; $offset -lt [Math]::Min($TitleIndex + 20, $SourceLines.Count); $offset += 1) {
        $line = $SourceLines[$offset].Trim()
        if (-not $line -or $line -match '^Documento de referencia|^Prohibida la reventa|^o fotocopiar|^\d+$') { continue }

        if (-not $started) {
            if (-not [char]::IsUpper($line[0])) { continue }
            $started = $true
        }

        $parts.Add($line)
        $candidate = (($parts -join ' ') -replace '\s+', ' ' -replace '- ', '')
        if ($candidate -match '[.!?]') { break }
    }

    $text = (($parts -join ' ') -replace '\s+', ' ' -replace '- ', '').Trim()
    if (-not $text) { return 'Objeto magico con propiedades especiales.' }

    $sentence = [regex]::Match($text, '^.{24,240}?[.!?](?=\s|$)').Value
    if (-not $sentence) { $sentence = $text }
    if ($sentence.Length -gt 220) {
        $sentence = $sentence.Substring(0, 217).TrimEnd() + '...'
    }
    return $sentence
}

function Test-MagicHeading([string]$Name, [string]$Metadata) {
    if (-not $Name -or -not [char]::IsUpper($Name[0]) -or $Name.Length -gt 90) { return $false }
    return $Metadata -match '^(Objeto maravilloso|Poci|Anillo|Arma|Armadura|Bast.n|Cetro|Varita|Pergamino)[^,]*,\s*(com.n|infrecuente|rar.|muy rar.|legendari.|rareza)'
}

function Get-ObjectDetails([string[]]$SourceLines, [int]$TitleIndex) {
    $paragraphs = [System.Collections.Generic.List[string]]::new()
    $current = [System.Collections.Generic.List[string]]::new()
    $started = $false

    for ($offset = $TitleIndex + 2; $offset -lt [Math]::Min($TitleIndex + 500, $SourceLines.Count - 1); $offset += 1) {
        $line = $SourceLines[$offset].Trim()
        $nextLine = $SourceLines[$offset + 1].Trim()

        if ($offset -gt $TitleIndex + 3 -and (Test-MagicHeading $line $nextLine)) { break }
        if ($line -match '^Documento de referencia|^Prohibida la reventa|^o fotocopiar|^\d+$') { continue }

        if (-not $line) {
            if ($current.Count) {
                $paragraphs.Add((($current -join ' ') -replace '\s+', ' ' -replace '- ', '').Trim())
                $current.Clear()
            }
            continue
        }

        if (-not $started) {
            if (-not [char]::IsUpper($line[0])) { continue }
            $started = $true
        }
        $current.Add($line)
    }

    if ($current.Count) {
        $paragraphs.Add((($current -join ' ') -replace '\s+', ' ' -replace '- ', '').Trim())
    }
    return ($paragraphs -join "`n`n")
}

for ($index = 21038; $index -lt [Math]::Min(26000, $lines.Count - 3); $index += 1) {
    $name = $lines[$index].Trim()
    $metadata = $lines[$index + 1].Trim()
    $metadataContext = (($lines[($index + 1)..($index + 3)] | ForEach-Object { $_.Trim() }) -join ' ')

    if (-not [char]::IsUpper($name[0]) -or $name.Length -gt 90) { continue }
    if ($metadata -notmatch '^(?<kind>Objeto maravilloso|Poci|Anillo|Arma|Armadura|Bast.n|Cetro|Varita|Pergamino)[^,]*,\s*(?<rarity>com.n|infrecuente|rar.|muy rar.|legendari.|rareza)') { continue }

    $kind = $Matches.kind
    $rarity = $Matches.rarity
    if ($metadata -match 'rareza variable|\(\+1\)') { $rarity = 'rareza variable' }
    elseif ($rarity -match '^rar' -and $rarity -notmatch '^rareza') { $rarity = 'raro' }
    elseif ($rarity -match '^muy') { $rarity = 'muy raro' }
    elseif ($rarity -match '^legend') { $rarity = 'legendario' }
    elseif ($rarity -match '^com') { $rarity = "com$([char]0x00FA)n" }
    elseif ($rarity -match '^rareza') { $rarity = 'rareza variable' }

    if ($name -eq "Poci$([char]0x00F3)n de curaci$([char]0x00F3)n") {
        $name = "Poci$([char]0x00F3)n de curaci$([char]0x00F3)n (variantes)"
    }
    $id = Convert-ToCatalogId $name
    $suffix = 2
    while (-not $usedIds.Add($id)) {
        $id = "$(Convert-ToCatalogId $name)-$suffix"
        $suffix += 1
    }

    $items.Add([ordered]@{
        id = $id
        name = $name
        type = 'item'
        category = Get-MagicCategory $kind
        price = "Sin precio est$([char]0x00E1)ndar"
        rarity = $rarity
        attunement = [bool]($metadataContext -match 'sintoniz')
        data = [ordered]@{
            qty = 1
            desc = Get-ShortSummary $lines $index
            details = Get-ObjectDetails $lines $index
        }
    })
}

$json = $items | ConvertTo-Json -Depth 5
$content = @"
/* Catalogo resumido de objetos magicos abiertos del SRD 5.1 en espanol. */
window.DndSrdMagicItemCompendium = {
    format: 'dnd-srd-magic-item-compendium',
    schemaVersion: 1,
    items: $json
};
"@

[IO.File]::WriteAllText($OutputPath, $content, [Text.UTF8Encoding]::new($false))
Write-Output "Catalogo magico generado: $($items.Count) objetos."
