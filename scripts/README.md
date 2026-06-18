# 🔧 Scripts de Utilidad

Scripts para mantenimiento y administración de Taekwondo Manager.

---

## 📦 Backup de Base de Datos

### `backup-database.sh`

Script para crear backups automáticos de la base de datos PostgreSQL.

#### Uso Básico

```bash
# Dar permisos de ejecución (primera vez)
chmod +x scripts/backup-database.sh

# Ejecutar backup
DATABASE_URL="postgresql://user:pass@host:5432/db" \
  ./scripts/backup-database.sh
```

#### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | **Requerido** |
| `BACKUP_DIR` | Directorio donde guardar backups | `./backups` |
| `RETENTION_DAYS` | Días de retención de backups | `30` |

#### Ejemplo con Variables

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" \
BACKUP_DIR="/var/backups/taekwondo" \
RETENTION_DAYS="60" \
  ./scripts/backup-database.sh
```

#### Salida

```
[2024-01-15 10:30:00] Iniciando backup de base de datos...
[2024-01-15 10:30:00] Directorio de backup: ./backups
[2024-01-15 10:30:00] Archivo: taekwondo_backup_20240115_103000.sql.gz
[2024-01-15 10:30:00] Base de datos: taekwondo_db
[2024-01-15 10:30:00] Host: localhost:5432
[2024-01-15 10:30:05] ✅ Backup completado exitosamente
[2024-01-15 10:30:05] Tamaño del backup: 2.5M
[2024-01-15 10:30:05] Limpiando backups antiguos (más de 30 días)...
[2024-01-15 10:30:05] Backups actuales: 15
[2024-01-15 10:30:05] 🎉 Proceso de backup completado
```

---

## 🔄 Restauración de Base de Datos

### `restore-database.sh`

Script para restaurar la base de datos desde un backup.

#### Uso Básico

```bash
# Dar permisos de ejecución (primera vez)
chmod +x scripts/restore-database.sh

# Restaurar desde backup
DATABASE_URL="postgresql://user:pass@host:5432/db" \
  ./scripts/restore-database.sh backups/taekwondo_backup_20240115_103000.sql.gz
```

#### ⚠️ Advertencia

Este script **sobrescribirá** la base de datos actual. Asegúrate de:
1. Tener un backup reciente antes de restaurar
2. Confirmar que quieres proceder (el script pedirá confirmación)
3. Verificar que la aplicación funcione después de restaurar

#### Ejemplo de Uso

```bash
$ DATABASE_URL="postgresql://..." ./scripts/restore-database.sh backups/backup.sql.gz

[2024-01-15 10:35:00] Iniciando restauración de base de datos...
[2024-01-15 10:35:00] Archivo de backup: backups/taekwondo_backup_20240115_103000.sql.gz
[2024-01-15 10:35:00] Base de datos: taekwondo_db
[2024-01-15 10:35:00] Host: localhost:5432
⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual
⚠️  Asegúrate de tener un backup reciente antes de continuar

¿Deseas continuar? (escribe 'SI' para confirmar): SI
[2024-01-15 10:35:05] Descomprimiendo y restaurando backup...
[2024-01-15 10:35:15] ✅ Restauración completada exitosamente
[2024-01-15 10:35:15] 🎉 Proceso de restauración completado
[2024-01-15 10:35:15] Verifica que la aplicación funcione correctamente
```

---

## ⏰ Automatización con Cron

### Backup Diario

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * cd /path/to/taekwondo-manager && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh >> /var/log/taekwondo-backup.log 2>&1
```

### Backup Cada 6 Horas

```bash
0 */6 * * * cd /path/to/taekwondo-manager && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh
```

### Backup Semanal (Domingos)

```bash
0 3 * * 0 cd /path/to/taekwondo-manager && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh
```

### Verificar Cron Jobs

```bash
# Listar cron jobs actuales
crontab -l

# Ver logs de cron
tail -f /var/log/cron
# o
tail -f /var/log/taekwondo-backup.log
```

---

## ☁️ Backup en la Nube

### AWS S3

```bash
# Instalar AWS CLI
apt install awscli

# Configurar credenciales
aws configure

# Modificar script para subir a S3
# Agregar al final de backup-database.sh:
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://tu-bucket/backups/
```

### Google Cloud Storage

```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Autenticar
gcloud auth login

# Subir backup
gsutil cp "$BACKUP_DIR/$BACKUP_FILE" gs://tu-bucket/backups/
```

### Dropbox

```bash
# Instalar Dropbox Uploader
# https://github.com/andreafabrizi/Dropbox-Uploader

# Configurar
./dropbox_uploader.sh

# Subir backup
./dropbox_uploader.sh upload "$BACKUP_DIR/$BACKUP_FILE" /backups/
```

---

## 🔍 Verificación de Backups

### Listar Backups

```bash
ls -lh backups/
```

### Ver Tamaño Total

```bash
du -sh backups/
```

### Contar Backups

```bash
ls backups/ | wc -l
```

### Verificar Integridad

```bash
# Verificar que el archivo comprimido no está corrupto
gunzip -t backups/taekwondo_backup_20240115_103000.sql.gz

# Si no hay output, el archivo está OK
# Si hay error, el archivo está corrupto
```

### Ver Contenido (sin restaurar)

```bash
# Ver primeras líneas del backup
gunzip -c backups/taekwondo_backup_20240115_103000.sql.gz | head -n 50
```

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL no está configurado"

```bash
# Asegúrate de pasar DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/db" ./scripts/backup-database.sh
```

### Error: "pg_dump: command not found"

```bash
# Instalar PostgreSQL client
# Ubuntu/Debian
sudo apt install postgresql-client

# macOS
brew install postgresql
```

### Error: "Permission denied"

```bash
# Dar permisos de ejecución
chmod +x scripts/backup-database.sh
chmod +x scripts/restore-database.sh
```

### Backup muy grande

```bash
# Ver tamaño del backup
ls -lh backups/taekwondo_backup_*.sql.gz

# Si es muy grande, considera:
# 1. Limpiar datos antiguos innecesarios
# 2. Usar compresión más agresiva
# 3. Hacer backups incrementales
```

---

## 📋 Mejores Prácticas

### Frecuencia de Backups

- **Producción activa**: Cada 6-12 horas
- **Producción normal**: Diario
- **Desarrollo**: Semanal o antes de cambios importantes

### Retención

- **Backups diarios**: 30 días
- **Backups semanales**: 3 meses
- **Backups mensuales**: 1 año

### Almacenamiento

- ✅ Guardar backups en múltiples ubicaciones
- ✅ Usar almacenamiento en la nube (S3, GCS, etc.)
- ✅ Verificar backups periódicamente
- ✅ Probar restauración al menos una vez al mes

### Seguridad

- ✅ Encriptar backups sensibles
- ✅ Limitar acceso a backups
- ✅ No commitear backups a Git (ya está en .gitignore)
- ✅ Rotar credenciales periódicamente

---

## 📚 Recursos Adicionales

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Cron Tutorial](https://crontab.guru/)
- [AWS S3 CLI](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Google Cloud Storage](https://cloud.google.com/storage/docs/gsutil)

---

Made with 🔧 for Taekwondo Manager