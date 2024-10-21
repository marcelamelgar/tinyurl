# Tiny URL
# Proyecto Desacoplado con Docker (Fase 1)

Este proyecto es una aplicación de "Tiny URL" que permite acortar URLs, almacenarlas y gestionarlas a través de una interfaz web. La aplicación está desarrollada con una arquitectura desacoplada, utilizando:
- **Frontend**: React
- **Backend**: Node.js y Express
- **Base de Datos**: MongoDB

Cada componente se ejecuta en su propio contenedor Docker y se orquesta utilizando Docker Compose.

## Requisitos Previos
- **Docker** y **Docker Compose** deben estar instalados en tu máquina:
  - [Instalar Docker](https://docs.docker.com/get-docker/)
  - [Instalar Docker Compose](https://docs.docker.com/compose/install/)

## Configuración del Proyecto

### 1. Clonar el Repositorio
Clona el repositorio en tu máquina local:

\`\`\`bash
git clone https://github.com/tu-usuario/tiny-url.git
cd tiny-url
\`\`\`

### 2. Estructura del Proyecto
Asegúrate de que la estructura del proyecto sea similar a la siguiente:

\`\`\`
/tiny-url
│
├── docker-compose.yml
├── tiny-url-app/        # Carpeta del frontend
│   ├── Dockerfile
│   ├── .env
│   └── ...              # Archivos de React
├── tiny-url-backend/    # Carpeta del backend
│   ├── Dockerfile
│   ├── server.js
│   └── ...              # Archivos del Backend
└── ...
\`\`\`

### 3. Configurar Variables de Entorno en el Frontend
El archivo \`.env\` en el directorio \`tiny-url-app\` ya debe estar configurado con la URL del backend:

\`\`\`env
# tiny-url-app/.env
REACT_APP_BACKEND_URL=http://backend:4000
\`\`\`

### 4. Crear el \`docker-compose.yml\`
El archivo \`docker-compose.yml\` ya debería estar en la raíz del proyecto. Asegúrate de que su contenido sea el siguiente:

\`\`\`yaml
version: '3'
services:
  mongodb:
    image: mongo
    container_name: mongo-container
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./tiny-url-backend
    container_name: tiny-url-backend
    ports:
      - '4000:4000'
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017/tinyurl

  frontend:
    build: ./tiny-url-app
    container_name: tiny-url-frontend
    ports:
      - '3000:3000'
    depends_on:
      - backend

volumes:
  mongo-data:
\`\`\`

### 5. Construir y Levantar los Contenedores
Desde la raíz del proyecto (donde se encuentra \`docker-compose.yml\`), ejecuta el siguiente comando para construir y levantar todos los contenedores (frontend, backend y base de datos):

\`\`\`bash
docker-compose up --build
\`\`\`

Este comando realizará lo siguiente:
- Construirá las imágenes Docker para el frontend y el backend utilizando los \`Dockerfile\` dentro de sus respectivos directorios (\`tiny-url-app\` y \`tiny-url-backend\`).
- Creará y ejecutará los contenedores para MongoDB, el backend y el frontend.
- El frontend se servirá en \`http://localhost:3000\`.
- El backend estará accesible en \`http://localhost:4000\`.

### 6. Acceder a la Aplicación
Una vez que los contenedores estén ejecutándose:
- Abre tu navegador y visita \`http://localhost:3000\` para acceder a la aplicación "Tiny URL".
- Puedes utilizar la interfaz para ingresar una URL, acortarla, editarla y eliminarla. Los cambios se reflejarán en la base de datos MongoDB en el contenedor correspondiente.

### 7. Detener los Contenedores
Para detener los contenedores sin eliminarlos, usa el siguiente comando:

\`\`\`bash
docker-compose stop
\`\`\`

### 8. Detener y Eliminar los Contenedores
Para detener y eliminar todos los contenedores, redes y volúmenes creados por Docker Compose, utiliza:

\`\`\`bash
docker-compose down
\`\`\`

### 9. Ver los Logs
Para ver los registros de todos los contenedores, ejecuta:

\`\`\`bash
docker-compose logs
\`\`\`

Para ver los registros de un contenedor específico (por ejemplo, el backend):

\`\`\`bash
docker-compose logs backend
\`\`\`

## Problemas Comunes
- **Error de Conexión a MongoDB**: Si el backend no puede conectarse a MongoDB, asegúrate de que esté utilizando la URL \`mongodb://mongodb:27017/tinyurl\`. Esto se maneja mediante la variable de entorno \`MONGO_URL\` en \`docker-compose.yml\`.
- **Frontend no se Comunica con el Backend**: Verifica que la URL del backend esté configurada correctamente en el archivo \`.env\` del frontend (\`REACT_APP_BACKEND_URL\`).
- **Cambios no Reflejados**: Si realizas cambios en el código del frontend o backend, ejecuta \`docker-compose up --build\` para reconstruir las imágenes Docker.

## Notas Adicionales
- Puedes modificar los puertos en \`docker-compose.yml\` si es necesario.
- Asegúrate de que Docker esté en ejecución antes de levantar los contenedores.
- Para acceder directamente a la base de datos, puedes usar un cliente de MongoDB en \`localhost:27017\`.

## Estructura de Archivos
- **Frontend (\`tiny-url-app/\`)**: Contiene el código de React para la interfaz web. Incluye un \`Dockerfile\` y un archivo \`.env\` para la URL del backend.
- **Backend (\`tiny-url-backend/\`)**: Contiene el código del servidor Node.js con Express, las rutas API y la conexión a MongoDB. Incluye un \`Dockerfile\`.

¡Ahora tu aplicación desacoplada debería estar lista para funcionar en un entorno Dockerizado! Sigue estos pasos para levantar, detener y administrar los contenedores de la aplicación.


# Tiny URL - Componentes desplegado en AWS (Fase 2)

Aqui se documenta los pasos realizados para la elaboración del proyecto Tiny URL durante la **fase 2**. El proyecto consta de un backend en Node.js con DynamoDB como base de datos, desplegado en EC2, y un frontend con React hospedado en S3.

---

## **Pasos realizados para la elaboración del proyecto**

### **1. Configuración de la infraestructura en AWS**

1. **Creación de una instancia EC2**:
   - Usamos Amazon Linux 2 como SO.
   - Se configuró el grupo de seguridad para permitir tráfico en los puertos **22** (SSH) y **4000** (backend).

2. **Creación de una tabla en DynamoDB**:
   - **Nombre de la tabla**: `TinyURLTable`.
   - **Partition Key**: `shortURL` (String).
   - **Sort Key**: `originalURL` (String).

3. **Creación de un bucket en S3**:
   - El bucket es público y se utiliza para servir el frontend.
   - Se habilitó la opción de **Hosting estático** para el frontend.

---

### **2. Configuración del Backend**

1. **Clonación del repositorio** y configuración del entorno:
   ```bash
   git clone <repositorio_url>
   cd tiny-url-backend
   npm install


