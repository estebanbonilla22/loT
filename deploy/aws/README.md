# Despliegue backend en AWS (solo API)

El frontend sigue en local; el navegador llama al ALB en HTTP. CORS ya incluye `http://localhost:4200` y `http://localhost:4201`.

## Requisitos

- Cuenta AWS, usuario con permisos para EC2/VPC, ECR, ECS, IAM, RDS, CloudFormation, ELB, Logs.
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configurado (`aws configure`).
- Docker (build y push de la imagen).

## Primera vez

Desde la raíz del repositorio **IoT**:

**Windows (PowerShell):**

```powershell
.\deploy\aws\deploy-backend.ps1
```

**Linux / macOS / Git Bash:**

```bash
chmod +x deploy/aws/deploy-backend.sh
bash deploy/aws/deploy-backend.sh
```

El script usa la **VPC por defecto** y dos subnets en **zonas distintas**. Genera contraseña de RDS y `JWT secret`, despliega la plantilla y muestra la **URL base del API** (ALB en el puerto 80).

Configura el frontend local, por ejemplo en `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  apiBaseUrl: 'http://TU-ALB-DNS-REGION.elb.amazonaws.com'
};
```

## Actualizar solo la imagen del API

```powershell
.\deploy\aws\update-backend-image.ps1
```

```bash
bash deploy/aws/update-backend-image.sh
```

## Variables de entorno útiles

| Variable        | Ejemplo        | Uso                          |
|----------------|----------------|------------------------------|
| `AWS_REGION`   | `eu-west-1`    | Región del despliegue        |
| `STACK_NAME`   | `coldchain-api`| Nombre del stack CloudFormation |
| `ECR_REPO_NAME`| `coldchain-backend` | Repositorio ECR        |

## Roles (JWT)

- **Viewer** (`ROLE_USER`): registro en `/register` — solo lectura: listar envíos, ver detalle y lecturas, ver estado **OK/ALERT**.
- **Administrator** (`ROLE_ADMIN`): usuario inicial **`coldchain_admin`** (contraseña por defecto **`ChangeMeAdmin1`**, configurable con `APP_BOOTSTRAP_ADMIN_USERNAME` / `APP_BOOTSTRAP_ADMIN_PASSWORD` en el task de ECS). Puede crear y borrar envíos y lecturas.

Tras desplegar código nuevo, vuelve a publicar la imagen (`update-backend-image.ps1`) para aplicar cambios.

## Borrar todo

```bash
aws cloudformation delete-stack --stack-name coldchain-backend --region REGION
```

Espera a que el stack quede en `DELETE_COMPLETE`. RDS puede tardar varios minutos.

## Coste

RDS `db.t3.micro`, Fargate 1 vCPU / 2 GB, ALB y tráfico generan coste mensual. Apaga borrando el stack si es solo una prueba.
