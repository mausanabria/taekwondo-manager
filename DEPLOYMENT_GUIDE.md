# Guía de Deployment - Taekwondo Manager

Esta guía te ayudará a desplegar tu aplicación en Vercel con Neon (PostgreSQL) sin tener que modificar archivos entre local y producción.

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless)
- Repositorio en GitHub
- Node.js 18+ instalado localmente

## 🔧 Configuración Local

### 1. Variables de Entorno Locales

Crea un archivo `.env.local` en la raíz del proyecto (NO subir a Git):

```env
# Database Local
DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_db?schema=public"

# NextAuth Local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-con-openssl-rand-base64-32"

# Environment
NODE_ENV="development"
```

### 2. Generar Secret Seguro

```bash
# En terminal (Linux/Mac)
openssl rand -base64 32

# En PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Inicializar Base de Datos Local

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Seed inicial
npx prisma db seed
```

### 4. Ejecutar Localmente

```bash
npm run dev
```

Visita: `http://localhost:3000`

## 🚀 Deployment en Vercel + Neon

### Paso 1: Configurar Base de Datos en Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Crea un nuevo proyecto
3. Copia la **Connection String** (debe incluir `?sslmode=require`)
4. Ejemplo: `postgresql://user:pass@ep-xxx.neon.tech/taekwondo_db?sslmode=require`

### Paso 2: Preparar Repositorio GitHub

```bash
# Asegúrate de que .env.local NO esté en Git
git status

# Si aparece .env.local, agrégalo a .gitignore
echo ".env.local" >> .gitignore

# Commit y push
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Paso 3: Configurar Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. **NO hagas deploy todavía**, primero configura las variables de entorno

### Paso 4: Configurar Variables de Entorno en Vercel

En la configuración del proyecto en Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

#### DATABASE_URL
```
postgresql://user:pass@ep-xxx.neon.tech/taekwondo_db?sslmode=require
```
- Scope: **Production, Preview, Development**

#### NEXTAUTH_URL
```
https://tu-app.vercel.app
```
- Scope: **Production**
- Nota: Vercel te dará esta URL después del primer deploy

#### NEXTAUTH_SECRET
```
[genera-un-secret-DIFERENTE-al-local]
```
- Scope: **Production, Preview, Development**
- ⚠️ **IMPORTANTE**: Usa un secret DIFERENTE al de local

#### NODE_ENV
```
production
```
- Scope: **Production**

### Paso 5: Ejecutar Migraciones en Neon

Antes del primer deploy, ejecuta las migraciones en la base de datos de producción:

```bash
# Temporal: usa la URL de Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/taekwondo_db?sslmode=require" npx prisma migrate deploy

# Genera el cliente Prisma
npx prisma generate
```

### Paso 6: Deploy

1. En Vercel, click en **"Deploy"**
2. Espera a que termine el build
3. Una vez desplegado, copia la URL de producción
4. Actualiza la variable `NEXTAUTH_URL` en Vercel con la URL real
5. Redeploy (Settings → Deployments → Redeploy)

## ✅ Verificación Post-Deploy

### 1. Verificar Variables de Entorno

En Vercel Dashboard:
- Settings → Environment Variables
- Verifica que todas estén configuradas correctamente

### 2. Verificar Logs

En Vercel Dashboard:
- Deployments → [tu deployment] → View Function Logs
- Busca errores de autenticación o base de datos

### 3. Probar Login

1. Ve a `https://tu-app.vercel.app/login`
2. Intenta iniciar sesión
3. Verifica que redirija correctamente al dashboard

### 4. Verificar Base de Datos

```bash
# Conecta a Neon y verifica las tablas
DATABASE_URL="tu-url-de-neon" npx prisma studio
```

## 🔄 Workflow de Desarrollo

### Desarrollo Local

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev

# 3. Commit y push
git add .
git commit -m "Feature: descripción"
git push origin main

# 4. Vercel despliega automáticamente
```

### Migraciones de Base de Datos

```bash
# Local: Crear migración
npx prisma migrate dev --name nombre_migracion

# Producción: Aplicar migración
DATABASE_URL="url-de-neon" npx prisma migrate deploy
```

## 🐛 Troubleshooting

### Error: "Invalid credentials" en producción

**Solución:**
1. Verifica que `NEXTAUTH_SECRET` esté configurado en Vercel
2. Verifica que `NEXTAUTH_URL` sea la URL correcta de producción
3. Redeploy después de cambiar variables

### Error: "Database connection failed"

**Solución:**
1. Verifica que `DATABASE_URL` incluya `?sslmode=require`
2. Verifica que la base de datos Neon esté activa
3. Verifica que las migraciones se hayan ejecutado

### Error: "Session not found" después de login

**Solución:**
1. Limpia cookies del navegador
2. Verifica que `NEXTAUTH_URL` coincida con la URL real
3. Verifica que las cookies estén habilitadas

### Login funciona en local pero no en producción

**Solución:**
1. Verifica los logs en Vercel
2. Asegúrate de que `export const dynamic = 'force-dynamic'` esté en `route.ts`
3. Verifica que `window.location.href` esté en `LoginForm.tsx`

## 📝 Checklist de Deployment

- [ ] `.env.local` creado y NO en Git
- [ ] `.gitignore` incluye `.env.local`
- [ ] Base de datos Neon creada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones ejecutadas en Neon
- [ ] Primer deploy exitoso
- [ ] `NEXTAUTH_URL` actualizado con URL real
- [ ] Redeploy después de actualizar `NEXTAUTH_URL`
- [ ] Login probado y funcionando
- [ ] Dashboard accesible después de login

## 🔐 Seguridad

### Secrets

- ✅ Usa secrets diferentes para local y producción
- ✅ Nunca subas `.env.local` a Git
- ✅ Rota secrets periódicamente
- ✅ Usa `openssl rand -base64 32` para generar secrets seguros

### Base de Datos

- ✅ Usa conexión SSL en producción (`?sslmode=require`)
- ✅ Limita acceso a IPs conocidas en Neon (opcional)
- ✅ Haz backups regulares de la base de datos

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Neon](https://neon.tech/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Consulta esta guía
4. Revisa la documentación oficial

---

**¡Listo!** Tu aplicación ahora funciona tanto en local como en producción sin modificar archivos. 🎉