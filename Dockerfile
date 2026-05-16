# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código y construir
COPY . .
RUN npm run build -- --configuration production

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa anterior
# Ajusta la ruta si el nombre del proyecto en angular.json es diferente
COPY --from=builder /app/dist/omnicore-crm/browser /usr/share/nginx/html

# Copiar configuración de Nginx para manejar rutas de Angular (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
