#!/usr/bin/env bash
# Despliega solo el backend (ECR + Docker + CloudFormation).
# Requisitos: AWS CLI, Docker, jq (para elegir 2 subnets en AZ distintas).
# Uso (desde la raíz del repo):  bash deploy/aws/deploy-backend.sh

set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-coldchain-backend}"
REPO_NAME="${ECR_REPO_NAME:-coldchain-backend}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$ROOT/deploy/aws/cloudformation/backend-stack.yaml"

if ! command -v jq &>/dev/null; then
  echo "Instala jq (https://jqlang.org/) o usa deploy-backend.ps1 en Windows."
  exit 1
fi

echo "Region: $REGION | Stack: $STACK_NAME"

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
VPC="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text --region "$REGION")"
if [[ -z "$VPC" || "$VPC" == "None" ]]; then
  echo "No hay VPC por defecto."
  exit 1
fi

SUBNET_CSV="$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC" --output json --region "$REGION" \
  | jq -r '[.Subnets | group_by(.AvailabilityZone) | .[] | .[0].SubnetId] | .[0:2] | join(",")')"

if [[ "$(echo "$SUBNET_CSV" | awk -F',' '{print NF}')" -lt 2 ]]; then
  echo "Se necesitan al menos 2 subnets en AZ distintas. VPC=$VPC"
  exit 1
fi

ECR_URI="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO_NAME}"

aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" &>/dev/null \
  || aws ecr create-repository --repository-name "$REPO_NAME" --region "$REGION"

echo "Login ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"

echo "Build..."
docker build -t "${ECR_URI}:latest" -f "$ROOT/backend/Dockerfile" "$ROOT/backend"

echo "Push..."
docker push "${ECR_URI}:latest"

DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
JWT_SECRET="$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)"

echo "CloudFormation (RDS puede tardar 10–15 min)..."
aws cloudformation deploy \
  --template-file "$TEMPLATE" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --region "$REGION" \
  --parameter-overrides \
    "VpcId=$VPC" \
    "PublicSubnetIds=$SUBNET_CSV" \
    "ContainerImage=${ECR_URI}:latest" \
    "DatabasePassword=$DB_PASS" \
    "JwtSecret=$JWT_SECRET" \
  --no-fail-on-empty-changeset

API_URL="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)"

echo ""
echo "=== Listo ==="
echo "API base URL: $API_URL"
echo ""
echo "Guarda estas credenciales:"
echo "  DB password (coldchain): $DB_PASS"
echo "  JWT secret: $JWT_SECRET"
echo ""
echo "Frontend local: en environment.ts usa apiBaseUrl: '$API_URL'"
