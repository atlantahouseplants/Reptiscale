param(
  [string]$ProjectName = "reptiscale-demo",
  [switch]$Production
)

$ErrorActionPreference = "Stop"

Write-Host "Linking Vercel project: $ProjectName"
vercel link --yes --project $ProjectName

if ($Production) {
  Write-Host "Deploying production build for: $ProjectName"
  vercel deploy --prod
} else {
  Write-Host "Deploying preview build for: $ProjectName"
  vercel deploy
}
