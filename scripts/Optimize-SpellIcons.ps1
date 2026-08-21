param(
    [ValidateRange(256, 1024)]
    [int]$Size = 512,

    [ValidateRange(70, 100)]
    [int]$Quality = 88,

    [switch]$RemoveSource
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$iconDirectory = (Resolve-Path -LiteralPath (Join-Path $projectRoot 'assets\spell-icons')).Path

if (-not $iconDirectory.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'La carpeta de iconos resuelta queda fuera del proyecto.'
}

Add-Type -AssemblyName System.Drawing
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } |
    Select-Object -First 1
$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    $qualityEncoder,
    [long]$Quality
)

$converted = 0
$beforeBytes = 0L
$afterBytes = 0L

Get-ChildItem -LiteralPath $iconDirectory -Filter '*.png' -File | ForEach-Object {
    $sourceFile = $_
    $destinationPath = [System.IO.Path]::ChangeExtension($sourceFile.FullName, '.jpg')
    $temporaryPath = "$destinationPath.tmp"
    $beforeBytes += $sourceFile.Length

    $sourceImage = [System.Drawing.Image]::FromFile($sourceFile.FullName)
    try {
        $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.Clear([System.Drawing.Color]::FromArgb(2, 6, 23))
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.DrawImage($sourceImage, 0, 0, $Size, $Size)
            $bitmap.Save($temporaryPath, $jpegCodec, $encoderParameters)
        }
        finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    }
    finally {
        $sourceImage.Dispose()
    }

    Move-Item -LiteralPath $temporaryPath -Destination $destinationPath -Force
    $optimizedFile = Get-Item -LiteralPath $destinationPath
    $afterBytes += $optimizedFile.Length
    $converted++

    if ($RemoveSource) {
        Remove-Item -LiteralPath $sourceFile.FullName
    }
}

$encoderParameters.Dispose()

$savedPercent = if ($beforeBytes -gt 0) {
    [math]::Round((1 - ($afterBytes / $beforeBytes)) * 100, 1)
}
else {
    0
}

Write-Output "Iconos optimizados: $converted. Peso PNG: $([math]::Round($beforeBytes / 1MB, 1)) MiB. Peso JPEG: $([math]::Round($afterBytes / 1MB, 1)) MiB. Reduccion: $savedPercent %."
