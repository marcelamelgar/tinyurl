# Dockerfile para el Frontend
FROM node:16

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar un servidor estático para servir el frontend
RUN npm install -g serve

# Exponer el puerto 3000
EXPOSE 3000

# Iniciar la aplicación
CMD ["serve", "-s", "build"]
