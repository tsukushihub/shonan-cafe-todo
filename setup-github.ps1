# === GitHub Deployment Setup ===
Write-Host "=== GitHub Deployment Setup ===" -ForegroundColor Cyan
$username = Read-Host "Enter your GitHub Username"
$token = Read-Host -AsSecureString "Enter your GitHub Token (PAT)"
$pat = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

$repoName = "shonan-cafe-todo"

$headers = @{
    Authorization = "token $pat"
    Accept = "application/vnd.github.v3+json"
}
$body = @{
    name = $repoName
    private = $false
} | ConvertTo-Json

Write-Host "Creating [$repoName] repository on GitHub..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body | Out-Null
    Write-Host "SUCCESS: Repository created." -ForegroundColor Green
} catch {
    Write-Host "WARNING: API Error (Repository might already exist): $_" -ForegroundColor Red
}

Write-Host "Initializing Git and committing..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial commit - Shonan Cafe Todo App"
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
$remoteUrlAuth = "https://${pat}@github.com/${username}/${repoName}.git"

# リモートが既にある場合は削除
git remote remove origin 2>$null
git remote add origin $remoteUrlAuth

git push -u origin main

# トークンを含まない安全なURLに設定
$remoteUrlSafe = "https://github.com/${username}/${repoName}.git"
git remote set-url origin $remoteUrlSafe

# 変数のクリア
$pat = $null
$token = $null

Write-Host "DONE! Your App is published to GitHub." -ForegroundColor Green
Write-Host "Your Repository URL: $remoteUrlSafe" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
