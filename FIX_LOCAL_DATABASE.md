# 🔧 Solución: Errores en Base de Datos Local

## 📋 Resumen del Problema

Tu base de datos local no tiene la tabla `belt_history` que existe en producción, causando estos errores:

- ❌ **Página de Exámenes**: "Error al cargar los datos de exámenes"
- ❌ **Página de Pagos**: "Failed to fetch payment statuses"
- ❌ **Datos desactualizados**: La base de datos local está desincronizada

## ✅ Solución en 3 Pasos

### Paso 1: Verificar Requisitos

Antes de comenzar, asegúrate de:

1. **PostgreSQL está corriendo**
   ```powershell
   # Verificar servicio
   Get-Service postgresql*
   
   # Si no está corriendo, iniciarlo
   net start postgresql-x64-[version]
   ```

2. **Tu archivo `.env` tiene la URL de base de datos LOCAL**
   ```env
   # ✅ CORRECTO - Base de datos local
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db"
   
   # ❌ INCORRECTO - NO uses la URL de producción aquí
   # DATABASE_URL="postgresql://...@neon.tech/..."
   ```

3. **La base de datos existe**
   ```bash
   # Si no existe, créala
   psql -U postgres -c "CREATE DATABASE taekwondo_db;"
   ```

### Paso 2: Ejecutar Script de Sincronización

Ejecuta el script automático que aplica todas las migraciones:

```bash
node scripts/sync-local-database.js
```

**¿Qué hace este script?**
- ✅ Verifica que estés usando una base de datos local (no producción)
- ✅ Regenera el cliente de Prisma
- ✅ Aplica todas las migraciones pendientes (incluyendo `belt_history`)
- ✅ Verifica que el esquema esté correcto

**Salida esperada:**
```
🔄 Starting local database synchronization...
✅ Found DATABASE_URL in .env file
✅ Confirmed local database

📦 Step 1: Generating Prisma Client...
✅ Prisma Client generated

🔄 Step 2: Applying pending migrations...
✅ Migrations applied successfully

🔍 Step 3: Verifying database schema...
✅ Schema verified

✨ Local database synchronized successfully!
```

### Paso 3: Verificar que Todo Funciona

1. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Prueba las páginas que tenían errores**
   - Visita: http://localhost:3000/exams
   - Visita: http://localhost:3000/payments
   - Verifica que no haya errores en la consola del navegador

3. **Verifica las tablas (opcional)**
   ```bash
   npx prisma studio
   ```
   Deberías ver la tabla `belt_history` en la lista.

## 🎯 Comandos Alternativos (Manual)

Si prefieres ejecutar los comandos manualmente en lugar del script:

```bash
# 1. Regenerar cliente de Prisma
npx prisma generate

# 2. Aplicar migraciones
npx prisma migrate deploy

# 3. Verificar esquema (opcional)
npx prisma db pull --force
```

## 🔄 Mantener Sincronizado en el Futuro

Cada vez que hagas `git pull` y haya nuevas migraciones:

```bash
node scripts/sync-local-database.js
```

## 🆘 Solución de Problemas

### Error: "DATABASE_URL not found"

**Causa**: No existe el archivo `.env` o no tiene `DATABASE_URL`

**Solución**:
```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env y configura DATABASE_URL con tu base de datos local
```

### Error: "Connection refused" o "ECONNREFUSED"

**Causa**: PostgreSQL no está corriendo

**Solución**:
```powershell
# Inicia el servicio
net start postgresql-x64-[version]

# O desde Services (Win + R, escribe: services.msc)
# Busca "postgresql" e inícialo
```

### Error: "Database does not exist"

**Causa**: La base de datos no ha sido creada

**Solución**:
```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE taekwondo_db;

# Sal
\q

# Ejecuta el script de nuevo
node scripts/sync-local-database.js
```

### Error: "Migration failed" o errores de migración

**Causa**: Estado inconsistente de la base de datos

**Solución** (⚠️ esto borrará todos los datos locales):
```bash
# Resetea la base de datos
npx prisma migrate reset

# Ejecuta el script de sincronización
node scripts/sync-local-database.js
```

### Error: "appears to be a production database"

**Causa**: Tu `.env` tiene la URL de producción

**Solución**: Cambia `DATABASE_URL` en `.env` a tu base de datos local:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db"
```

## 📚 Documentación Adicional

- **Guía completa**: [docs/LOCAL_DATABASE_SYNC.md](docs/LOCAL_DATABASE_SYNC.md)
- **Scripts disponibles**: [scripts/README_SYNC.md](scripts/README_SYNC.md)
- **Instalación**: [docs/INSTALLATION.md](docs/INSTALLATION.md)
- **Desarrollo**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## ✅ Verificación Final

Después de completar estos pasos, deberías tener:

- ✅ Base de datos local sincronizada con producción
- ✅ Tabla `belt_history` creada
- ✅ Todas las migraciones aplicadas
- ✅ Cliente de Prisma actualizado
- ✅ Páginas de exámenes y pagos funcionando sin errores

## 🎉 ¡Listo!

Tu entorno local ahora está sincronizado con producción. Puedes continuar desarrollando sin problemas.

---

**💡 Consejo**: Guarda este archivo para referencia futura. Cada vez que hagas `git pull` y haya nuevas migraciones, simplemente ejecuta:

```bash
node scripts/sync-local-database.js