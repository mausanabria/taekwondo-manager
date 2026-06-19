# Guía de Sincronización de Base de Datos Local

Esta guía te ayudará a sincronizar tu base de datos local con el esquema de producción, resolviendo errores relacionados con tablas faltantes como `belt_history`.

## 🔍 Problema

Si ves estos errores en tu entorno local:
- ❌ "Failed to fetch payment statuses"
- ❌ "Error al cargar los datos de exámenes"
- ❌ Errores relacionados con la tabla `belt_history`

**Causa**: Tu base de datos local no tiene las mismas tablas que producción porque faltan migraciones por aplicar.

## ✅ Solución Rápida

### Opción 1: Script Automático (Recomendado)

Ejecuta el script de sincronización:

```bash
node scripts/sync-local-database.js
```

Este script:
1. ✅ Verifica que estés usando una base de datos local (no producción)
2. ✅ Regenera el cliente de Prisma
3. ✅ Aplica todas las migraciones pendientes
4. ✅ Verifica que el esquema esté correcto

### Opción 2: Comandos Manuales

Si prefieres ejecutar los comandos manualmente:

```bash
# 1. Regenerar el cliente de Prisma
npx prisma generate

# 2. Aplicar todas las migraciones pendientes
npx prisma migrate deploy

# 3. Verificar el esquema (opcional)
npx prisma db pull --force
```

## 📋 Requisitos Previos

Antes de ejecutar la sincronización, asegúrate de:

1. **PostgreSQL está corriendo localmente**
   ```bash
   # Windows (PowerShell)
   Get-Service postgresql*
   
   # Si no está corriendo, inícialo desde Services o:
   # net start postgresql-x64-[version]
   ```

2. **Tu archivo `.env` tiene la URL correcta de base de datos LOCAL**
   ```env
   # ✅ CORRECTO - Base de datos local
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db"
   
   # ❌ INCORRECTO - Base de datos de producción
   DATABASE_URL="postgresql://...@neon.tech/..."
   ```

3. **La base de datos existe**
   ```bash
   # Crear la base de datos si no existe
   psql -U postgres -c "CREATE DATABASE taekwondo_db;"
   ```

## 🔧 Solución de Problemas

### Error: "DATABASE_URL not found"

**Solución**: Crea o actualiza tu archivo `.env` con la URL de tu base de datos local.

```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env y actualiza DATABASE_URL
```

### Error: "Connection refused"

**Solución**: PostgreSQL no está corriendo.

```bash
# Windows
net start postgresql-x64-[version]

# O inicia el servicio desde Services (services.msc)
```

### Error: "Database does not exist"

**Solución**: Crea la base de datos primero.

```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE taekwondo_db;

# Sal de psql
\q
```

### Error: "Migration failed"

**Solución**: Resetea la base de datos y vuelve a aplicar las migraciones.

```bash
# ⚠️ ADVERTENCIA: Esto borrará todos los datos locales
npx prisma migrate reset

# Luego ejecuta el script de sincronización
node scripts/sync-local-database.js
```

## 📊 Verificar que Todo Funciona

Después de sincronizar, verifica que los APIs funcionen:

1. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Prueba los endpoints problemáticos**
   - Visita: http://localhost:3000/exams
   - Visita: http://localhost:3000/payments
   - Verifica que no haya errores en la consola

3. **Verifica las tablas en la base de datos**
   ```bash
   npx prisma studio
   ```
   
   Deberías ver todas las tablas incluyendo:
   - ✅ `belt_history`
   - ✅ `frequency_history`
   - ✅ `students`
   - ✅ `payments`
   - etc.

## 🔄 Mantener Sincronizado

Cada vez que se agreguen nuevas migraciones en producción:

1. Haz `git pull` para obtener las nuevas migraciones
2. Ejecuta el script de sincronización:
   ```bash
   node scripts/sync-local-database.js
   ```

## 📝 Notas Importantes

- ⚠️ **NUNCA** ejecutes estos comandos contra la base de datos de producción
- ✅ El script verifica automáticamente que estés usando una base de datos local
- 💾 Considera hacer backups de tu base de datos local antes de sincronizar
- 🔒 Asegúrate de que tu `.env` esté en `.gitignore` (ya debería estarlo)

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. Revisa los logs de error completos
2. Verifica que PostgreSQL esté corriendo
3. Confirma que la URL de la base de datos sea correcta
4. Intenta resetear la base de datos local con `npx prisma migrate reset`

## 📚 Recursos Adicionales

- [Documentación de Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Guía de Instalación](./INSTALLATION.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)