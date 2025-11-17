param(
    [string]$Message = ""
)

if (-not $Message -or $Message -eq "") {
    $Message = "SotsiaalAI full deploy " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}

Write-Host "Git commit ja push (kohalik)..." 
git add .

try {
    git commit -m $Message
} catch {
    Write-Host "Ei olnud midagi committida, jätkan deployga..."
}

git push origin main

Write-Host "Täis deploy serverisse (backend + frontend + Prisma)..." 

ssh ubuntu@uvn-72-147.tll01.zonevs.eu 'cd /home/ubuntu/apps/sotsiaalai; git pull; npm ci; npx prisma migrate deploy; npx prisma generate; npm run build; sudo systemctl restart sotsiaalai-rag.service; sudo systemctl status sotsiaalai-rag.service --no-pager; sudo systemctl restart sotsiaalai-frontend.service; sudo systemctl status sotsiaalai-frontend.service --no-pager'

Write-Host "Valmis."
