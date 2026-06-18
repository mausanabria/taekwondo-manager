#!/bin/bash

###############################################################################
# Script de Restauración de PostgreSQL
# Para Taekwondo Manager
###############################################################################

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

# Verificar argumentos
if [ $# -eq 0 ]; then
    error "Debe especificar el archivo de backup"
    echo "Uso: DATABASE_URL='postgresql://...' ./restore-database.sh <backup_file.sql.gz>"
    echo ""
    echo "Ejemplo:"
    echo "  ./restore-database.sh backups/taekwondo_backup_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    error "El archivo de backup no existe: $BACKUP_FILE"
    exit 1
fi

# Verificar que DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL no está configurado"
    error "Uso: DATABASE_URL='postgresql://...' ./restore-database.sh <backup_file>"
    exit 1
fi

log "Iniciando restauración de base de datos..."
log "Archivo de backup: $BACKUP_FILE"

# Extraer componentes de DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

log "Base de datos: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"

# Advertencia
warning "⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual"
warning "⚠️  Asegúrate de tener un backup reciente antes de continuar"
echo ""
read -p "¿Deseas continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    log "Restauración cancelada"
    exit 0
fi

# Realizar restauración
export PGPASSWORD="$DB_PASS"

log "Descomprimiendo y restaurando backup..."

if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; then
    log "✅ Restauración completada exitosamente"
else
    error "❌ Restauración falló"
    exit 1
fi

unset PGPASSWORD

log "🎉 Proceso de restauración completado"
log "Verifica que la aplicación funcione correctamente"

# Made with Bob