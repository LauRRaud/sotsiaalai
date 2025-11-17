param(
    [string]$Message = "SotsiaalAI"
)

Write-Host "📦 Git commit & push (kohalik)..." -ForegroundColor Cyan
git add .

git commit -m $Message

Write-Host "🚀 Deploy serverisse..." -ForegroundColor Cyan
ssh ubuntu@uvn-72-147.tll01.zonevs.eu "cd /home/ubuntu/apps/sotsiaalai && git pull && npm run build && sudo systemctl restart sotsiaalai-frontend.service && sudo systemctl status sotsiaalai-frontend.service --no-pager"

Write-Host "✨ Valmis." -ForegroundColor Green
function AI {
    & "C:\Users\rauds\Desktop\SotsiaalAI\deploy.ps1" @args
}
Set-Alias AI "C:\Users\rauds\Desktop\SotsiaalAI\deploy.ps1"
