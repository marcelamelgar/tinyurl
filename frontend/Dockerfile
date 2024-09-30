# Dockerfile para el frontend
FROM node:16

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]
