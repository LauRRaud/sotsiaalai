param(
    [string]$Message = "SotsiaalAI",
    [string]$SshTarget = "sotsiaalai"
)

Write-Host "Git commit ja push (kohalik)..."
git add .
git commit -m $Message
git push origin main

Write-Host "Deploy serverisse..."
ssh $SshTarget 'cd /home/ubuntu/apps/sotsiaalai; git pull; npm run build; sudo systemctl restart sotsiaalai-frontend.service; sudo systemctl status sotsiaalai-frontend.service --no-pager'

Write-Host "Valmis."
