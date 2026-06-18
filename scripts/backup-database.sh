#!/bin/bash

###############################################################################
# Script de Backup Automático de PostgreSQL
# Para Taekwondo Manager
###############################################################################

# Configuración
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="taekwondo_backup_${TIMESTAMP}.sql.gz"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL no está configurado"
    error "Uso: DATABASE_URL='postgresql://...' ./backup-database.sh"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

log "Iniciando backup de base de datos..."
log "Directorio de backup: $BACKUP_DIR"
log "Archivo: $BACKUP_FILE"

# Extraer componentes de DATABASE_URL
# Formato: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Verificar que se extrajeron los datos
if [ -z "$DB_NAME" ]; then
    error "No se pudo extraer el nombre de la base de datos de DATABASE_URL"
    exit 1
fi

log "Base de datos: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"

# Realizar backup
export PGPASSWORD="$DB_PASS"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    
    log "✅ Backup completado exitosamente"
    
    # Obtener tamaño del archivo
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Tamaño del backup: $BACKUP_SIZE"
    
    # Limpiar backups antiguos
    log "Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
    find "$BACKUP_DIR" -name "taekwondo_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Contar backups restantes
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "taekwondo_backup_*.sql.gz" -type f | wc -l)
    log "Backups actuales: $BACKUP_COUNT"
    
    # Listar últimos 5 backups
    log "Últimos backups:"
    ls -lht "$BACKUP_DIR"/taekwondo_backup_*.sql.gz | head -5
    
else
    error "❌ Backup falló"
    exit 1
fi

unset PGPASSWORD

log "🎉 Proceso de backup completado"

# Made with Bob