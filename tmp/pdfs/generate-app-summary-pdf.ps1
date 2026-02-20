$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tmpDir = Join-Path $repoRoot "tmp\pdfs"
$outDir = Join-Path $repoRoot "output\pdf"
New-Item -ItemType Directory -Force -Path $tmpDir, $outDir | Out-Null

$nugetPath = Join-Path $tmpDir "itextsharp.5.5.13.3.nupkg"
$zipPath = Join-Path $tmpDir "itextsharp.5.5.13.3.zip"
$extractDir = Join-Path $tmpDir "itextsharp_pkg"
$bcNugetPath = Join-Path $tmpDir "bouncycastle.1.8.9.nupkg"
$bcZipPath = Join-Path $tmpDir "bouncycastle.1.8.9.zip"
$bcExtractDir = Join-Path $tmpDir "bouncycastle_pkg"
$dllPath = $null

if (-not (Test-Path $extractDir)) {
  if (-not (Test-Path $nugetPath)) {
    Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/iTextSharp/5.5.13.3" -OutFile $nugetPath
  }
  Copy-Item $nugetPath $zipPath -Force
  if (Test-Path $extractDir) {
    Remove-Item $extractDir -Recurse -Force
  }
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
}

$bcDllPath = $null
if (-not (Test-Path $bcExtractDir)) {
  if (-not (Test-Path $bcNugetPath)) {
    Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/BouncyCastle/1.8.9" -OutFile $bcNugetPath
  }
  Copy-Item $bcNugetPath $bcZipPath -Force
  if (Test-Path $bcExtractDir) {
    Remove-Item $bcExtractDir -Recurse -Force
  }
  Expand-Archive -Path $bcZipPath -DestinationPath $bcExtractDir -Force
}

$bcDllCandidate = Get-ChildItem -Path $bcExtractDir -Filter "*.dll" -Recurse |
  Where-Object { $_.Name -like "*BouncyCastle*" } |
  Select-Object -First 1
if (-not $bcDllCandidate) {
  throw "Could not locate BouncyCastle DLL in $bcExtractDir"
}
$bcDllPath = $bcDllCandidate.FullName

$dllCandidate = Get-ChildItem -Path $extractDir -Filter "itextsharp.dll" -Recurse | Select-Object -First 1
if (-not $dllCandidate) {
  throw "Could not locate itextsharp.dll in $extractDir"
}
$dllPath = $dllCandidate.FullName

Add-Type -Path $bcDllPath
Add-Type -Path $dllPath

$outPdf = Join-Path $outDir "sotsiaalai-app-summary.pdf"
$stream = New-Object System.IO.FileStream(
  $outPdf,
  [System.IO.FileMode]::Create,
  [System.IO.FileAccess]::Write,
  [System.IO.FileShare]::None
)
$doc = New-Object iTextSharp.text.Document([iTextSharp.text.PageSize]::A4, 34, 34, 30, 30)
$writer = [iTextSharp.text.pdf.PdfWriter]::GetInstance($doc, $stream)
$writer.SetFullCompression()
$doc.Open()

$titleFont = [iTextSharp.text.FontFactory]::GetFont(
  "Helvetica-Bold",
  16,
  [iTextSharp.text.BaseColor]::BLACK
)
$sectionFont = [iTextSharp.text.FontFactory]::GetFont(
  "Helvetica-Bold",
  11,
  [iTextSharp.text.BaseColor]::BLACK
)
$bodyFont = [iTextSharp.text.FontFactory]::GetFont(
  "Helvetica",
  9,
  [iTextSharp.text.BaseColor]::BLACK
)

function Add-SectionHeader {
  param([string]$Text)
  $p = New-Object iTextSharp.text.Paragraph($Text, $sectionFont)
  $p.SpacingBefore = 6
  $p.SpacingAfter = 2
  $p.Leading = 13
  $doc.Add($p)
}

function Add-BodyParagraph {
  param([string]$Text)
  $p = New-Object iTextSharp.text.Paragraph($Text, $bodyFont)
  $p.SpacingAfter = 2
  $p.Leading = 11.5
  $doc.Add($p)
}

function Add-Bullets {
  param([string[]]$Items)
  $list = New-Object iTextSharp.text.List($false, $false, 8.0)
  $list.SetListSymbol((New-Object iTextSharp.text.Chunk("- ", $bodyFont)))
  foreach ($line in $Items) {
    $item = New-Object iTextSharp.text.ListItem($line, $bodyFont)
    $item.Leading = 11.2
    $item.SpacingAfter = 0.5
    $list.Add($item) | Out-Null
  }
  $doc.Add($list)
}

$title = New-Object iTextSharp.text.Paragraph("SotsiaalAI - One Page App Summary", $titleFont)
$title.SpacingAfter = 4
$title.Leading = 18
$doc.Add($title)

Add-SectionHeader "What it is"
Add-BodyParagraph "SotsiaalAI is a Next.js web app that provides role-based AI support for social-sector use through personal and room chat. It combines AI responses, voice tooling, and document-grounded assistance with account and subscription controls."

Add-SectionHeader "Who it is for"
Add-Bullets @(
  "Primary personas are social work professionals and people seeking help (CLIENT role), with admin users for analytics and RAG content operations."
)

Add-SectionHeader "What it does"
Add-Bullets @(
  "Runs personal AI chat with streamed responses and persisted conversation history.",
  "Supports room chat with live message sync over SSE and polling fallback.",
  "Provides voice features: dictation (STT) and reply playback (TTS) with provider fallback chains.",
  "Supports document analysis in chat using file upload, chunking, and relevance-based context injection.",
  "Manages invite-based room membership with self-paid vs sponsored billing logic.",
  "Includes registration/login, profile/subscription flows, and admin analytics plus RAG admin routes."
)

Add-SectionHeader "How it works (repo-backed architecture)"
Add-Bullets @(
  "Frontend: Next.js App Router pages and React components, centered around chat orchestration hooks and route-level pages.",
  "Backend: Next.js API routes under app/api for chat, rooms, invites, profile, subscription, STT/TTS, and RAG proxying.",
  "AI services: /api/chat uses OpenAI; a separate rag-service (FastAPI + Chroma) is called over HTTP for retrieval/analysis.",
  "Data layer: Prisma models on PostgreSQL store users, subscriptions, conversations, room messages, invites, and RAG docs.",
  "Realtime flow: SSE streams for assistant output and room updates, with optional Redis fanout support for room events.",
  "Not found in repo: explicit production topology diagram or infrastructure map beyond local Docker/Postgres and PM2 start script."
)

Add-SectionHeader "How to run (minimal)"
Add-Bullets @(
  "Install dependencies: npm install",
  "Start local Postgres: docker compose up -d postgres",
  "Create/update local tables: npm run db:push:local",
  "Start app: npm run dev",
  "Open http://localhost:3000 ; for full RAG features, start rag-service using docs/RAG_SETUP.md steps."
)

$evidence = New-Object iTextSharp.text.Paragraph(
  "Evidence files: package.json, docs/LOCAL_DEV.md, docs/chat-page-system-map.md, docs/RAG_SETUP.md, docs/routes.txt, prisma/schema.prisma, app/api/*",
  $bodyFont
)
$evidence.SpacingBefore = 5
$evidence.Leading = 10.5
$doc.Add($evidence)

$doc.Close()
$stream.Close()

$reader = New-Object iTextSharp.text.pdf.PdfReader($outPdf)
$pageCount = $reader.NumberOfPages
$reader.Close()
if ($pageCount -ne 1) {
  throw "Generated PDF has $pageCount pages; expected exactly 1 page."
}

Write-Output $outPdf
