param(
  [string]$Distro = "Ubuntu",
  [string]$ProjectPath = "/home/hermes/projects/cultivation-simulator",
  [string]$WslUser = "hermes",
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$wslCommand = @"
export PATH="/home/$WslUser/.n/bin:/home/$WslUser/.npm-global/bin:/usr/bin:/bin"
export PORT=$Port
cd '$ProjectPath' && bash scripts/dev.sh
"@

Write-Host "启动修仙模拟器开发环境 (WSL/$Distro)..." -ForegroundColor Cyan
Write-Host "Web: http://127.0.0.1:$Port/" -ForegroundColor Green

wsl -d $Distro -- env "HOME=/home/$WslUser" bash --noprofile --norc -c $wslCommand
