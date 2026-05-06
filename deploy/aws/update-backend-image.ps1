# Reconstruye la imagen, hace push a ECR y fuerza un nuevo despliegue en ECS.
# El stack debe existir (ejecutar deploy-backend.ps1 antes).
# Uso: .\deploy\aws\update-backend-image.ps1

$ErrorActionPreference = "Stop"

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

$Account = aws sts get-caller-identity --query Account --output text
$EcrUri = "$Account.dkr.ecr.$Region.amazonaws.com/$RepoName"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$Account.dkr.ecr.$Region.amazonaws.com"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Push-Location $RepoRoot
try {
  docker build -t "${EcrUri}:latest" -f backend/Dockerfile backend
} finally { Pop-Location }

docker push "${EcrUri}:latest"

$Cluster = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text
$Service = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='ServiceName'].OutputValue" --output text

aws ecs update-service --cluster $Cluster --service $Service --force-new-deployment --region $Region
Write-Host "Despliegue forzado. Estado: aws ecs describe-services --cluster $Cluster --services $Service --region $Region" -ForegroundColor Green
