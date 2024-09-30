# Dockerfile para el backend
FROM node:16

WORKDIR /app

# Copiar solo package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar los archivos de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 4000

# Ejecutar el servidor
CMD ["node", "server.js"]
