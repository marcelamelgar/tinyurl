# Dockerfile para el frontend
FROM node:16

WORKDIR /app

# Copiar solo package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar los archivos de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar y usar 'serve' para servir la aplicación
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]

