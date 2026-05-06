#!/usr/bin/env bash
# Push nueva imagen y fuerza despliegue ECS.
set -euo pipefail
REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-coldchain-backend}"
REPO_NAME="${ECR_REPO_NAME:-coldchain-backend}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
ECR_URI="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO_NAME}"

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
docker build -t "${ECR_URI}:latest" -f "$ROOT/backend/Dockerfile" "$ROOT/backend"
docker push "${ECR_URI}:latest"

CLUSTER="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)"
SERVICE="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ServiceName'].OutputValue" --output text)"

aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --force-new-deployment --region "$REGION"
echo "OK: aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
