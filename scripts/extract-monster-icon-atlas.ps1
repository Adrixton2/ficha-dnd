param(
    [Parameter(Mandatory = $true)][string]$Atlas,
    [Parameter(Mandatory = $true)][string]$SlugList,
    [string]$OutputDirectory = ''
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $projectRoot 'assets\monster-icons' }
$Slugs = $SlugList.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
if ($Slugs.Count -ne 16) { throw 'La lamina debe contener exactamente 16 iconos.' }
$resolvedAtlas = (Resolve-Path -LiteralPath $Atlas).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::new($resolvedAtlas)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$jpegParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$jpegParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]86)
try {
    for ($index = 0; $index -lt 16; $index += 1) {
        $column = $index % 4
        $row = [Math]::Floor($index / 4)
        $left = [Math]::Round($column * $source.Width / 4)
        $top = [Math]::Round($row * $source.Height / 4)
        $right = [Math]::Round(($column + 1) * $source.Width / 4)
        $bottom = [Math]::Round(($row + 1) * $source.Height / 4)
        $icon = $source.Clone([System.Drawing.Rectangle]::new($left, $top, $right - $left, $bottom - $top), $source.PixelFormat)
        try { $icon.Save((Join-Path $OutputDirectory ($Slugs[$index] + '.jpg')), $jpegCodec, $jpegParameters) }
        finally { $icon.Dispose() }
    }
}
finally { $source.Dispose(); $jpegParameters.Dispose() }
Write-Host "Iconos extraidos: $($Slugs.Count)."
