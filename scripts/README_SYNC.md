# 🔄 Script de Sincronización de Base de Datos Local

## Uso Rápido

```bash
node scripts/sync-local-database.js
```

## ¿Qué hace este script?

Este script sincroniza tu base de datos local con el esquema de producción aplicando todas las migraciones pendientes.

### Pasos que ejecuta:

1. ✅ **Verifica seguridad**: Confirma que NO estás usando una base de datos de producción
2. 📦 **Regenera Prisma Client**: Ejecuta `npx prisma generate`
3. 🔄 **Aplica migraciones**: Ejecuta `npx prisma migrate deploy`
4. 🔍 **Verifica esquema**: Ejecuta `npx prisma db pull --force`

## ¿Cuándo usar este script?

Usa este script cuando:

- ❌ Veas errores como "Failed to fetch payment statuses"
- ❌ Veas errores como "Error al cargar los datos de exámenes"
- ❌ Falten tablas en tu base de datos local (como `belt_history`)
- 🔄 Después de hacer `git pull` y haya nuevas migraciones
- 🆕 Al configurar el proyecto por primera vez en tu máquina

## Requisitos Previos

Antes de ejecutar el script:

1. **PostgreSQL debe estar corriendo**
   ```bash
   # Verificar en Windows
   Get-Service postgresql*
   ```

2. **Archivo `.env` configurado con base de datos LOCAL**
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db"
   ```

3. **La base de datos debe existir**
   ```bash
   psql -U postgres -c "CREATE DATABASE taekwondo_db;"
   ```

## Protecciones de Seguridad

El script incluye protecciones para evitar accidentes:

- 🛡️ Verifica que el archivo `.env` exista
- 🛡️ Verifica que `DATABASE_URL` esté configurado
- 🛡️ **Rechaza URLs de producción** (Neon, Supabase, Railway, etc.)
- 🛡️ Solo funciona con bases de datos locales

## Solución de Problemas

### Error: "DATABASE_URL not found"
```bash
# Crea el archivo .env
copy .env.example .env
# Edita .env y configura DATABASE_URL
```

### Error: "Connection refused"
```bash
# Inicia PostgreSQL
net start postgresql-x64-[version]
```

### Error: "Database does not exist"
```bash
# Crea la base de datos
psql -U postgres -c "CREATE DATABASE taekwondo_db;"
```

### Error: "Migration failed"
```bash
# Resetea y vuelve a aplicar (⚠️ borra datos locales)
npx prisma migrate reset
node scripts/sync-local-database.js
```

## Documentación Completa

Para más detalles, consulta: [docs/LOCAL_DATABASE_SYNC.md](../docs/LOCAL_DATABASE_SYNC.md)

## Otros Scripts Útiles

- `backup-database.sh` - Respaldar base de datos
- `restore-database.sh` - Restaurar base de datos
- `setup-env.js` - Configurar variables de entorno
- `generate-secret.js` - Generar secretos seguros

---

**💡 Tip**: Ejecuta este script cada vez que hagas `git pull` para mantener tu base de datos local sincronizada.