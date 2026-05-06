# Despliega solo el backend (ECR + imagen Docker + CloudFormation: ALB + ECS Fargate + RDS).
# Requisitos: AWS CLI v2 configurado (`aws configure`), Docker Desktop.
# Uso (desde la raíz del repo):
#   .\deploy\aws\deploy-backend.ps1
# Opcional: $env:AWS_REGION = "eu-west-1"; $env:STACK_NAME = "coldchain-api"

$ErrorActionPreference = "Stop"

# AWS CLI a veces no esta en PATH (terminal integrada / CI); usar instalacion tipica de Windows.
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
  $awsDir = Join-Path $env:ProgramFiles "Amazon\AWSCLIV2"
  if (Test-Path (Join-Path $awsDir "aws.exe")) {
    $env:PATH = "$awsDir;$env:PATH"
  }
}
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
  throw "No se encuentra 'aws'. Instala AWS CLI v2 o agrega Amazon\AWSCLIV2 al PATH."
}

$Region = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$StackName = if ($env:STACK_NAME) { $env:STACK_NAME } else { "coldchain-backend" }
$RepoName = if ($env:ECR_REPO_NAME) { $env:ECR_REPO_NAME } else { "coldchain-backend" }

function New-RandomSecret([int]$Length) {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

Write-Host "Region: $Region | Stack: $StackName"

$Account = aws sts get-caller-identity --query Account --output text
if (-not $Account) { throw "AWS CLI no devolvió cuenta. Ejecuta aws configure." }

$VpcId = aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query "Vpcs[0].VpcId" --output text --region $Region
if (-not $VpcId -or $VpcId -eq "None") { throw "No se encontró VPC por defecto. Crea una o pasa una VPC y subnets manualmente con CloudFormation." }

$subs = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VpcId" --region $Region --output json | ConvertFrom-Json
$byAz = @{}
foreach ($s in $subs.Subnets) {
  $az = $s.AvailabilityZone
  if (-not $byAz.ContainsKey($az)) { $byAz[$az] = $s.SubnetId }
}
$SubnetIds = @($byAz.Values) | Select-Object -First 2
if ($SubnetIds.Count -lt 2) {
  throw "Se necesitan subnets en al menos 2 zonas de disponibilidad para el ALB. VPC: $VpcId"
}
$SubnetCsv = $SubnetIds -join ","

$EcrUri = "$Account.dkr.ecr.$Region.amazonaws.com/$RepoName"

# PowerShell 5 trata stderr de 'aws' como error si $ErrorActionPreference es Stop.
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
try {
  $null = aws ecr describe-repositories --repository-names $RepoName --region $Region 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Creando repositorio ECR $RepoName..."
    $null = aws ecr create-repository --repository-name $RepoName --region $Region 2>&1
    if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el repositorio ECR (revisa permisos IAM)." }
  }
} finally {
  $ErrorActionPreference = $prevEap
}

Write-Host "Login ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$Account.dkr.ecr.$Region.amazonaws.com"

Write-Host "Build imagen (backend/Dockerfile)..."
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Push-Location $RepoRoot
try {
  docker build -t "${EcrUri}:latest" -f backend/Dockerfile backend
  if ($LASTEXITCODE -ne 0) { throw "docker build falló" }
} finally {
  Pop-Location
}

Write-Host "Push $EcrUri:latest ..."
docker push "${EcrUri}:latest"
if ($LASTEXITCODE -ne 0) { throw "docker push falló" }

$DbPass = New-RandomSecret 24
$JwtSecret = New-RandomSecret 48

Write-Host "Desplegando CloudFormation (RDS puede tardar 10-15 min la primera vez)..."
$Template = Join-Path $PSScriptRoot "cloudformation\backend-stack.yaml"
aws cloudformation deploy `
  --template-file $Template `
  --stack-name $StackName `
  --capabilities CAPABILITY_IAM `
  --region $Region `
  --parameter-overrides `
    "VpcId=$VpcId" `
    "PublicSubnetIds=$SubnetCsv" `
    "ContainerImage=${EcrUri}:latest" `
    "DatabasePassword=$DbPass" `
    "JwtSecret=$JwtSecret" `
  --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) { throw "cloudformation deploy falló" }

$ApiUrl = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text

Write-Host ""
Write-Host "=== Listo ===" -ForegroundColor Green
Write-Host "API base URL: $ApiUrl"
Write-Host ""
Write-Host "Guarda estas credenciales (no se vuelven a mostrar):" -ForegroundColor Yellow
Write-Host "  DB password (usuario coldchain): $DbPass"
Write-Host "  JWT secret: $JwtSecret"
Write-Host ""
Write-Host ('Frontend local: en frontend/src/environments/environment.ts pon apiBaseUrl: ' + $ApiUrl) -ForegroundColor Cyan
