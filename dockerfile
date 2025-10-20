# --- Etapa 1: Compilación (Build) ---
# Usamos una imagen de Go 1.22 "alpine" (ligera) para compilar
FROM golang:1.22-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /app

# (Asegúrate de tener un 'go.mod'. Si no lo tienes, corre: go mod init tu-proyecto)
# Copiamos los archivos de dependencias
COPY go.mod go.sum ./
# Descargamos las dependencias
RUN go mod download

# Copiamos todo el código fuente
COPY . .

# Compilamos la aplicación para Linux, de forma estática.
# Esto crea un archivo ejecutable llamado 'server'
RUN CGO_ENABLED=0 GOOS=linux go build -o /server .

# --- Etapa 2: Ejecución (Final) ---
# Usamos una imagen base mínima 'alpine' para correr la app.
# Es mucho más ligera y segura que la imagen de Go completa.
FROM alpine:latest

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el archivo 'server' que compilamos en la Etapa 1
COPY --from=builder /server .

# ¡Importante! Copiamos tus assets estáticos y plantillas
COPY templates/ ./templates/
COPY static/ ./static/

# Exponemos el puerto 8080 (el que usa tu main.go)
EXPOSE 8080

# El comando para iniciar tu servidor
CMD [ "./server" ]