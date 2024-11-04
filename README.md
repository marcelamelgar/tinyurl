# TinyURL Project - Deployment Guide

## Descripción del Proyecto

Este proyecto es una aplicación de acortador de URLs (TinyURL) que consiste en un frontend en React y un backend en Node.js con DynamoDB como base de datos. El frontend está alojado en un bucket de S3 configurado para alojamiento estático, mientras que el backend está desplegado en AWS ECS con Fargate.

## Requisitos Previos

1. **Cuenta de AWS** con acceso a los servicios S3, ECS, ECR, IAM, DynamoDB, y VPC.
2. **AWS CLI** configurado localmente.
3. **Docker** instalado en la máquina local.
4. **Node.js** y **npm/yarn** para construir el frontend.

## Pasos para Desplegar el Proyecto

### 1. Configuración del Backend

#### 1.1 Crear un Repositorio en Amazon ECR
   1. Ve a **Amazon ECR** en la consola de AWS.
   2. Selecciona **Create repository**.
   3. Asigna el nombre `tinyurl-backend`.
   4. Configura **Image tag mutability** en **Mutable** y usa la encriptación predeterminada con una clave administrada por AWS.
   5. Haz clic en **Create repository** y guarda el URI del repositorio (te servirá más adelante).

#### 1.2 Crear el Dockerfile para el Backend
   - En la carpeta del backend, crea un archivo llamado `Dockerfile` con el siguiente contenido:
     ```Dockerfile
     FROM node:16

     WORKDIR /app

     COPY package*.json ./
     RUN npm install

     COPY . .

     EXPOSE 4000
     CMD ["node", "server.js"]
     ```

#### 1.3 Construir y Subir la Imagen a ECR
   - Autentícate en ECR:
     ```bash
     aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
     ```
   - Construye y etiqueta la imagen:
     ```bash
     docker build -t tinyurl-backend .
     docker tag tinyurl-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/tinyurl-backend:latest
     ```
   - Sube la imagen a ECR:
     ```bash
     docker push <account-id>.dkr.ecr.<region>.amazonaws.com/tinyurl-backend:latest
     ```

#### 1.4 Crear una Tabla en DynamoDB
   - Ve a **DynamoDB** en la consola de AWS.
   - Haz clic en **Create table**.
   - **Table name**: Ingresa `TinyURLTable`.
   - **Partition key**: Ingresa `shortURL` como la clave de partición y selecciona **String** como tipo de dato.
   - **Agregar Atributos Adicionales**:
     - Después de crear la tabla, los atributos `originalURL` y `createdAt` se agregarán automáticamente cuando se inserten datos en la tabla.
   - **Configuraciones Adicionales**: Deja las configuraciones predeterminadas y selecciona **Create table** para finalizar.

#### 1.5 Configurar IAM para el Backend
   - En **IAM**, crea un rol de IAM llamado `TinyURLBackendRole`.
   - Agrega el permiso **AmazonDynamoDBFullAccess** al rol.
   - En la pestaña **Trust relationships**, asegúrate de que el rol permita el servicio `ecs-tasks.amazonaws.com` para que ECS pueda usarlo:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Service": "ecs-tasks.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
         }
       ]
     }
     ```

### 2. Desplegar el Backend en ECS con Fargate

#### 2.1 Crear una VPC Pública en AWS

1. **Crear la VPC**:
   - Ve a **VPC** en la consola de AWS.
   - Selecciona **Your VPCs** y haz clic en **Create VPC**.
   - Asigna el nombre `TinyURL-VPC`.
   - Configura el **IPv4 CIDR block** como `10.0.0.0/16`.
   - Haz clic en **Create VPC**.

2. **Crear una Subnet Pública**:
   - En el menú de la VPC, selecciona **Subnets** y haz clic en **Create subnet**.
   - **VPC**: Selecciona `TinyURL-VPC`.
   - **Subnet name**: Asigna el nombre `TinyURL-Subnet`.
   - **Availability Zone**: Selecciona cualquier zona disponible.
   - **IPv4 CIDR block**: Ingresa `10.0.1.0/24`.
   - Haz clic en **Create subnet**.
   - Después de crear la subnet, selecciona la opción **Actions** > **Modify auto-assign IP settings** y habilita **Auto-assign public IPv4 address**.

3. **Crear un Internet Gateway**:
   - En el menú de la VPC, selecciona **Internet Gateways**.
   - Haz clic en **Create internet gateway** y nómbralo `TinyURL-IGW`.
   - Después de crear el gateway, selecciónalo y haz clic en **Attach to VPC**.
   - Selecciona `TinyURL-VPC` y confirma.

4. **Actualizar la Tabla de Rutas**:
   - En **Route Tables**, selecciona la tabla de rutas asociada a `TinyURL-VPC`.
   - Ve a **Routes** y haz clic en **Edit routes**.
   - Agrega la siguiente ruta:
     - **Destination**: `0.0.0.0/0` (permitiendo acceso a internet).
     - **Target**: Selecciona `TinyURL-IGW`.
   - Guarda los cambios y asegúrate de que esta tabla de rutas esté asociada a la subnet `TinyURL-Subnet`.

#### 2.2 Crear un Cluster en ECS

1. En **ECS**, selecciona **Clusters** y haz clic en **Create Cluster**.
2. Selecciona **Networking only (Fargate)** y nombra el cluster `tinyurlCluster`.
3. Haz clic en **Create** para finalizar.

#### 2.3 Crear la Task Definition

1. En **ECS**, ve a **Task Definitions** y selecciona **Create new Task Definition**.
2. Selecciona **Fargate** y configura los detalles:
   - **Task Role**: Selecciona `TinyURLBackendRole`.
   - **Network Mode**: Deja `awsvpc`.
3. **Container Definitions**:
   - Nombre del contenedor: `tinyurl-backend`.
   - **Image**: Usa la URI del repositorio en ECR.
   - **Memory Limits**: Selecciona `0.5 GB`.
   - **Port Mappings**: Configura el puerto 4000.
4. **Task Size**:
   - **CPU**: Selecciona `0.25 vCPU`.
   - **Memory**: Selecciona `0.5 GB`.
5. Haz clic en **Create** para guardar la Task Definition.

#### 2.4 Crear un Servicio en ECS

1. Ve al cluster `tinyurlCluster` y selecciona **Create Service**.
2. Configura los siguientes detalles:
   - **Launch type**: Selecciona **Fargate**.
   - **Task Definition**: Selecciona la Task Definition `tinyurl-backend-task`.
   - **Number of tasks**: Pon `1`.
3. **Network configuration**:
   - **VPC**: Selecciona `TinyURL-VPC`.
   - **Subnets**: Selecciona `TinyURL-Subnet`.
   - **Security Groups**: Crea un grupo de seguridad que permita tráfico HTTP en el puerto 4000.
   - **Auto-assign public IP**: Asegúrate de que esté activado.

### 3. Configuración del Frontend en S3

#### 3.1 Configurar el Frontend
   - Modifica el archivo de configuración del frontend para usar la URL pública del backend:
     ```javascript
     const API_BASE_URL = "http://<public-ip>:4000";
     ```

#### 3.2 Build del Frontend
   ```bash
   npm install
   npm run build
  ```

#### 3.3 Crear un Bucket en S3 y Subir Archivos

1. Ve a **S3** y selecciona **Create bucket**.
2. Ingresa un nombre único (por ejemplo, `tinyurl-frontend`) y desactiva **Block all public access**.
3. Crea el bucket y, en **Properties**, habilita **Static website hosting** con `index.html`.
4. Sube los archivos de la carpeta `build` generada en el paso de build.

#### 3.4 Configurar Política de Acceso Público
   - En la pestaña **Permissions**, agrega la siguiente política:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::<bucket-name>/*"
         }
       ]
     }
     ```
   - Reemplaza `<bucket-name>` con el nombre de tu bucket.
   - Guarda la política.

### 4. Probar la Aplicación

1. **Probar el Backend**:
   - Usa `http://<public-ip>:4000/api/urls` para verificar que el backend responde.

2. **Probar el Frontend**:
   - Accede a la URL del sitio web en S3 (disponible en **Static website hosting** en el bucket).
   - Asegúrate de que las funcionalidades de acortar URLs y mostrar URLs acortadas funcionen correctamente.
