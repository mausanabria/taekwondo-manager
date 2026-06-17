# 🚀 Guía de Despliegue - Taekwondo Manager

Guía completa para desplegar Taekwondo Manager en producción.

---

## 📋 Tabla de Contenidos

- [Preparación para Producción](#-preparación-para-producción)
- [Opción 1: Vercel (Recomendado)](#-opción-1-vercel-recomendado)
- [Opción 2: Railway](#-opción-2-railway)
- [Opción 3: Render](#-opción-3-render)
- [Opción 4: VPS Tradicional](#-opción-4-vps-tradicional)
- [Base de Datos en Producción](#-base-de-datos-en-producción)
- [Variables de Entorno](#-variables-de-entorno)
- [Migraciones en Producción](#-migraciones-en-producción)
- [Monitoreo y Logs](#-monitoreo-y-logs)
- [Backup y Recuperación](#-backup-y-recuperación)
- [Optimizaciones](#-optimizaciones)

---

## 🎯 Preparación para Producción

### Checklist Pre-Despliegue

- [ ] Código testeado localmente
- [ ] Variables de entorno configuradas
- [ ] Base de datos de producción lista
- [ ] Migraciones probadas
- [ ] Build exitoso (`npm run build`)
- [ ] Dominio configurado (opcional)
- [ ] SSL/HTTPS configurado
- [ ] Backup de datos importante

### Build Local

Antes de desplegar, verifica que el build funcione:

```bash
# Construir la aplicación
npm run build

# Probar el build localmente
npm start

# Verificar en http://localhost:3000
```

Si el build falla, corrige los errores antes de desplegar.

---

## 🌐 Opción 1: Vercel (Recomendado)

**Ventajas**:
- ✅ Optimizado para Next.js
- ✅ Despliegue automático desde Git
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Fácil configuración
- ✅ Plan gratuito generoso

**Desventajas**:
- ❌ Necesitas base de datos externa
- ❌ Límites en plan gratuito

### Paso 1: Preparar el Repositorio

```bash
# Inicializar Git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit"

# Subir a GitHub/GitLab/Bitbucket
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### Paso 2: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub/GitLab/Bitbucket
3. Autoriza el acceso a tus repositorios

### Paso 3: Importar Proyecto

1. Click en **"New Project"**
2. Selecciona tu repositorio `taekwondo-manager`
3. Vercel detectará automáticamente que es Next.js

### Paso 4: Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-generado
NODE_ENV=production
```

> 💡 **Tip**: Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! Tu app está en línea

### Paso 6: Ejecutar Migraciones

```bash
# Desde tu terminal local, con DATABASE_URL de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Configurar Dominio Personalizado

1. En Vercel Dashboard → Settings → Domains
2. Agrega tu dominio
3. Configura DNS según instrucciones
4. Actualiza `NEXTAUTH_URL` con tu dominio

### Despliegues Automáticos

Cada push a `main` desplegará automáticamente:

```bash
git add .
git commit -m "Update feature"
git push
# Vercel despliega automáticamente
```

---

## 🚂 Opción 2: Railway

**Ventajas**:
- ✅ PostgreSQL incluido
- ✅ Fácil configuración
- ✅ Plan gratuito con $5/mes de crédito
- ✅ Despliegue desde Git

### Paso 1: Crear Cuenta

1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub

### Paso 2: Crear Nuevo Proyecto

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio

### Paso 3: Agregar PostgreSQL

1. Click en **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará la base de datos automáticamente

### Paso 4: Configurar Variables

Railway detecta automáticamente `DATABASE_URL`. Agrega las demás:

```env
NEXTAUTH_URL=${{RAILWAY_STATIC_URL}}
NEXTAUTH_SECRET=tu-secret-generado
NODE_ENV=production
```

### Paso 5: Configurar Build

Crea `railway.json` en la raíz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Paso 6: Desplegar

Railway despliega automáticamente. Monitorea en el dashboard.

---

## 🎨 Opción 3: Render

**Ventajas**:
- ✅ PostgreSQL incluido
- ✅ SSL gratuito
- ✅ Plan gratuito disponible

### Paso 1: Crear Cuenta

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub

### Paso 2: Crear PostgreSQL

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Nombre: `taekwondo-db`
3. Plan: Free
4. Copia la **Internal Database URL**

### Paso 3: Crear Web Service

1. **"New +"** → **"Web Service"**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: taekwondo-manager
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### Paso 4: Variables de Entorno

```env
DATABASE_URL=<internal-database-url>
NEXTAUTH_URL=https://taekwondo-manager.onrender.com
NEXTAUTH_SECRET=tu-secret-generado
NODE_ENV=production
```

### Paso 5: Desplegar

Render despliega automáticamente. Primera vez toma ~10 minutos.

---

## 🖥️ Opción 4: VPS Tradicional

Para DigitalOcean, AWS, Linode, etc.

### Requisitos

- Ubuntu 20.04+ o similar
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2

### Paso 1: Configurar Servidor

```bash
# Conectar por SSH
ssh root@tu-servidor-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Instalar Nginx
apt install -y nginx

# Instalar PM2
npm install -g pm2
```

### Paso 2: Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE taekwondo_db;
CREATE USER taekwondo_user WITH ENCRYPTED PASSWORD 'tu-password-segura';
GRANT ALL PRIVILEGES ON DATABASE taekwondo_db TO taekwondo_user;
\q
```

### Paso 3: Clonar y Configurar Proyecto

```bash
# Crear usuario para la app
adduser taekwondo
su - taekwondo

# Clonar repositorio
git clone <tu-repo-url> taekwondo-manager
cd taekwondo-manager

# Instalar dependencias
npm install

# Crear .env
nano .env
```

Contenido de `.env`:

```env
DATABASE_URL="postgresql://taekwondo_user:tu-password@localhost:5432/taekwondo_db"
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="tu-secret-generado"
NODE_ENV="production"
```

### Paso 4: Ejecutar Migraciones y Build

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Build de producción
npm run build
```

### Paso 5: Configurar PM2

```bash
# Iniciar con PM2
pm2 start npm --name "taekwondo-manager" -- start

# Configurar inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs taekwondo-manager
```

### Paso 6: Configurar Nginx

```bash
# Crear configuración
sudo nano /etc/nginx/sites-available/taekwondo-manager
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/taekwondo-manager /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 7: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática ya está configurada
```

---

## 🗄️ Base de Datos en Producción

### Opciones de Hosting PostgreSQL

#### 1. Neon (Recomendado para Vercel)

- **URL**: [neon.tech](https://neon.tech)
- **Plan Gratuito**: 0.5 GB
- **Ventajas**: Serverless, rápido, fácil

**Configuración**:
1. Crear cuenta en Neon
2. Crear nuevo proyecto
3. Copiar connection string
4. Usar en `DATABASE_URL`

#### 2. Supabase

- **URL**: [supabase.com](https://supabase.com)
- **Plan Gratuito**: 500 MB
- **Ventajas**: Incluye auth, storage, realtime

#### 3. Railway/Render

- Incluido en el servicio
- Configuración automática

#### 4. AWS RDS

- Para producción enterprise
- Alta disponibilidad
- Backups automáticos

### Configuración de Conexión

```env
# Formato general
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Con SSL (recomendado en producción)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require"

# Con connection pooling (para serverless)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=5&pool_timeout=10"
```

---

## 🔐 Variables de Entorno

### Variables Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="clave-secreta-32-caracteres"

# Entorno
NODE_ENV="production"
```

### Generar NEXTAUTH_SECRET

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Seguridad

- ❌ **NUNCA** commitear `.env` a Git
- ✅ Usar variables de entorno del hosting
- ✅ Rotar secretos periódicamente
- ✅ Usar diferentes secretos por entorno

---

## 🔄 Migraciones en Producción

### Ejecutar Migraciones

```bash
# Opción 1: Desde local (recomendado)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Opción 2: En el servidor
ssh usuario@servidor
cd taekwondo-manager
npx prisma migrate deploy
```

### Rollback de Migraciones

Si algo sale mal:

```bash
# Ver historial
npx prisma migrate status

# Resetear a migración específica (¡cuidado!)
npx prisma migrate resolve --rolled-back "20240101000000_migration_name"
```

### Mejores Prácticas

1. **Siempre hacer backup** antes de migrar
2. **Probar en staging** primero
3. **Ejecutar en horario de bajo tráfico**
4. **Tener plan de rollback**
5. **Monitorear después de migrar**

---

## 📊 Monitoreo y Logs

### Vercel

```bash
# Ver logs en tiempo real
vercel logs <deployment-url>

# Ver logs de producción
vercel logs --prod
```

### Railway/Render

- Logs disponibles en el dashboard
- Streaming en tiempo real

### VPS con PM2

```bash
# Ver logs
pm2 logs taekwondo-manager

# Logs de errores
pm2 logs taekwondo-manager --err

# Limpiar logs
pm2 flush
```

### Herramientas de Monitoreo

#### Sentry (Tracking de Errores)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### Vercel Analytics

Incluido automáticamente en Vercel.

---

## 💾 Backup y Recuperación

### Backup de PostgreSQL

#### Backup Manual

```bash
# Backup completo
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql

# Backup comprimido
pg_dump -h host -U user -d database | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * pg_dump -h localhost -U taekwondo_user -d taekwondo_db | gzip > /backups/taekwondo_$(date +\%Y\%m\%d).sql.gz
```

### Restaurar Backup

```bash
# Desde archivo SQL
psql -h host -U user -d database < backup.sql

# Desde archivo comprimido
gunzip -c backup.sql.gz | psql -h host -U user -d database
```

### Backup en la Nube

#### AWS S3

```bash
# Instalar AWS CLI
apt install awscli

# Configurar
aws configure

# Backup a S3
pg_dump database | gzip | aws s3 cp - s3://bucket/backup_$(date +%Y%m%d).sql.gz
```

---

## ⚡ Optimizaciones

### Next.js

```javascript
// next.config.js
module.exports = {
  // Comprimir imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Comprimir respuestas
  compress: true,
  
  // Optimizar producción
  productionBrowserSourceMaps: false,
  
  // Configurar headers de caché
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### PostgreSQL

```sql
-- Crear índices para queries frecuentes
CREATE INDEX idx_students_school_active ON students(school_id, is_active);
CREATE INDEX idx_attendance_date ON attendances(date);
CREATE INDEX idx_payments_student_month ON payments(student_id, month, year);

-- Analizar tablas
ANALYZE students;
ANALYZE attendances;
ANALYZE payments;
```

### CDN

- Vercel incluye CDN automáticamente
- Para VPS: usar Cloudflare

---

## 🔍 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -h host -U user -d database

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Error: "Build failed"

```bash
# Limpiar caché
rm -rf .next node_modules
npm install
npm run build
```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

---

## ✅ Checklist Post-Despliegue

- [ ] Aplicación accesible en URL de producción
- [ ] Login funciona correctamente
- [ ] Base de datos conectada
- [ ] Migraciones aplicadas
- [ ] SSL/HTTPS activo
- [ ] Variables de entorno configuradas
- [ ] Backup configurado
- [ ] Monitoreo activo
- [ ] Logs accesibles
- [ ] Performance aceptable

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-despliegue---taekwondo-manager)**

¿Problemas? Consulta el [FAQ](FAQ.md) o la [Documentación Técnica](TECHNICAL.md)

Made with 🥋 for Production

</div>