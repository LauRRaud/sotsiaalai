$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tmpDir = Join-Path $repoRoot "tmp\pdfs"
$renderDir = Join-Path $tmpDir "render"
$pdfPath = Join-Path $repoRoot "output\pdf\sotsiaalai-app-summary.pdf"
New-Item -ItemType Directory -Force -Path $tmpDir, $renderDir | Out-Null

$xpdfZip = Join-Path $tmpDir "xpdf-tools-win-4.06.zip"
$xpdfExtractDir = Join-Path $tmpDir "xpdf-tools-win-4.06"
if (-not (Test-Path $xpdfExtractDir)) {
  if (-not (Test-Path $xpdfZip)) {
    Invoke-WebRequest -Uri "https://dl.xpdfreader.com/xpdf-tools-win-4.06.zip" -OutFile $xpdfZip
  }
  Expand-Archive -Path $xpdfZip -DestinationPath $tmpDir -Force
}

$prefixPath = Join-Path $renderDir "sotsiaalai-app-summary-page1"
$pdftopng = Get-ChildItem -Path $xpdfExtractDir -Recurse -Filter "pdftopng.exe" | Select-Object -First 1
if ($pdftopng) {
  & $pdftopng.FullName -f 1 -l 1 $pdfPath $prefixPath | Out-Null
  $pngPath = "${prefixPath}-000001.png"
  if (-not (Test-Path $pngPath)) {
    throw "Expected PNG not generated at $pngPath"
  }
  Write-Output $pngPath
  exit 0
}

$pdftoppm = Get-ChildItem -Path $xpdfExtractDir -Recurse -Filter "pdftoppm.exe" | Select-Object -First 1
if ($pdftoppm) {
  & $pdftoppm.FullName -f 1 -l 1 $pdfPath $prefixPath | Out-Null
  $ppmPath = "${prefixPath}-000001.ppm"
  if (-not (Test-Path $ppmPath)) {
    throw "Expected PPM not generated at $ppmPath"
  }
  Write-Output $ppmPath
  exit 0
}

throw "No pdftopng.exe or pdftoppm.exe found in xpdf tools."
