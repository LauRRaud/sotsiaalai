param(
    [string]$Message = "SotsiaalAI"
)

Write-Host "Git commit ja push (kohalik)..."
git add .
git commit -m $Message
git push origin main

Write-Host "Deploy serverisse..."
ssh ubuntu@uvn-72-147.tll01.zonevs.eu 'cd /home/ubuntu/apps/sotsiaalai; git pull; npm run build; sudo systemctl restart sotsiaalai-frontend.service; sudo systemctl status sotsiaalai-frontend.service --no-pager'

Write-Host "Valmis."
