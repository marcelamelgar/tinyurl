# Dockerfile para el backend
FROM node:16

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 4000
EXPOSE 4000

# Iniciar la aplicación
CMD ["node", "server.js"]
