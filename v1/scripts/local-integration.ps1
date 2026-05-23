param(
  [switch]$SkipDocker
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not $SkipDocker) {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI is not available. Install Docker Desktop or run with -SkipDocker if your services are already up.'
  }

  docker compose up -d
}

$env:DATABASE_URL = 'postgresql://techmart:techmart@localhost:5432/techmart_dev'

Write-Host 'Pushing Prisma schema...'
npx prisma db push --accept-data-loss

Write-Host 'Seeding database...'
npm run seed

Write-Host ''
Write-Host 'Integration stack is ready.'
Write-Host 'If needed, start the app in another terminal with: npm run dev'
Write-Host 'For real-time testing, the compose stack already includes Redis, Postgres, socket-server, and worker.'
