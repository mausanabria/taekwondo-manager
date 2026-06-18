# 🔒 Guía de Seguridad - Taekwondo Manager

Documentación completa de las medidas de seguridad implementadas.

---

## 📋 Tabla de Contenidos

- [Resumen de Seguridad](#-resumen-de-seguridad)
- [Rate Limiting](#-rate-limiting)
- [Headers de Seguridad](#-headers-de-seguridad)
- [Logging de Seguridad](#-logging-de-seguridad)
- [Backups Automáticos](#-backups-automáticos)
- [Mejores Prácticas](#-mejores-prácticas)
- [Monitoreo](#-monitoreo)

---

## 🛡️ Resumen de Seguridad

### Capas de Protección Implementadas

| Capa | Tecnología | Estado |
|------|------------|--------|
| **Autenticación** | NextAuth + JWT | ✅ Activo |
| **Autorización** | RBAC (Role-Based) | ✅ Activo |
| **Rate Limiting** | Custom Implementation | ✅ Activo |
| **Validación Input** | Zod Schemas | ✅ Activo |
| **SQL Injection** | Prisma ORM | ✅ Protegido |
| **XSS Protection** | React + Headers | ✅ Protegido |
| **CSRF Protection** | NextAuth Tokens | ✅ Protegido |
| **Security Headers** | Next.js Config | ✅ Activo |
| **Security Logging** | Custom Logger | ✅ Activo |
| **Database Backups** | Automated Scripts | ✅ Configurado |

---

## 🚦 Rate Limiting

### Implementación

El sistema de rate limiting previene ataques de fuerza bruta limitando el número de requests por IP/usuario.

**Archivo:** `src/lib/rate-limit.ts`

### Configuraciones

```typescript
// Login: 5 intentos cada 15 minutos
LOGIN: {
  interval: 15 * 60 * 1000,
  maxRequests: 5
}

// Registro: 3 intentos por hora
REGISTER: {
  interval: 60 * 60 * 1000,
  maxRequests: 3
}

// API General: 100 requests por minuto
API: {
  interval: 60 * 1000,
  maxRequests: 100
}
```

### Endpoints Protegidos

- ✅ `/api/auth/[...nextauth]` - Login
- ✅ `/api/auth/register` - Registro
- 🔄 Puedes agregar a otros endpoints según necesidad

### Uso en Código

```typescript
import { rateLimit, RATE_LIMITS, getIdentifier } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const identifier = getIdentifier(request)
  const result = rateLimit(`action:${identifier}`, RATE_LIMITS.API)
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Continuar con la lógica...
}
```

### Respuesta de Rate Limit

```json
{
  "error": "Too many login attempts. Please try again after 3:45 PM",
  "resetTime": 1234567890
}
```

---

## 🔐 Headers de Seguridad

### Implementación

**Archivo:** `next.config.js`

### Headers Configurados

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=63072000` | Forzar HTTPS |
| `X-Frame-Options` | `DENY` | Prevenir clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevenir MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Protección XSS legacy |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control de referrer |
| `Permissions-Policy` | `camera=(), microphone=()` | Deshabilitar APIs |

### Verificar Headers

```bash
# Usando curl
curl -I https://tu-dominio.com

# Usando herramientas online
# https://securityheaders.com
```

### Resultado Esperado

```
HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
```

---

## 📊 Logging de Seguridad

### Implementación

**Archivo:** `src/lib/security-logger.ts`

### Eventos Registrados

| Evento | Severidad | Descripción |
|--------|-----------|-------------|
| `LOGIN_SUCCESS` | Low | Login exitoso |
| `LOGIN_FAILED` | Medium | Login fallido |
| `LOGIN_RATE_LIMITED` | High | Rate limit excedido |
| `REGISTER_SUCCESS` | Low | Registro exitoso |
| `UNAUTHORIZED_ACCESS` | High | Acceso no autorizado |
| `PERMISSION_DENIED` | Medium | Permiso denegado |
| `SUSPICIOUS_ACTIVITY` | High | Actividad sospechosa |
| `DATA_BREACH_ATTEMPT` | Critical | Intento de breach |

### Uso Básico

```typescript
import { logLoginSuccess, logLoginFailed } from '@/lib/security-logger'

// Login exitoso
logLoginSuccess(userId, email, ip)

// Login fallido
logLoginFailed(email, ip, 'Invalid password')
```

### Uso Avanzado

```typescript
import { securityLogger, SecurityEventType } from '@/lib/security-logger'

securityLogger.log({
  type: SecurityEventType.SUSPICIOUS_ACTIVITY,
  userId: 'user123',
  ip: '192.168.1.1',
  severity: 'high',
  details: {
    action: 'Multiple failed attempts',
    count: 10
  }
})
```

### Ver Logs

```typescript
// Últimos 100 logs
const recentLogs = securityLogger.getRecentLogs(100)

// Logs por tipo
const failedLogins = securityLogger.getLogsByType(
  SecurityEventType.LOGIN_FAILED
)

// Logs por usuario
const userLogs = securityLogger.getLogsByUser('user123')

// Detectar patrones sospechosos
const patterns = securityLogger.detectSuspiciousPatterns()
```

### Formato de Log

```typescript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  type: "LOGIN_FAILED",
  email: "user@example.com",
  ip: "192.168.1.1",
  severity: "medium",
  details: {
    reason: "Invalid password"
  }
}
```

### Integración con Servicios Externos

Para producción, puedes integrar con:

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Monitoring
- **CloudWatch**: AWS logging

```typescript
// En security-logger.ts, método sendToExternalService()
private sendToExternalService(entry: SecurityLogEntry): void {
  // Ejemplo con Sentry
  Sentry.captureMessage(`Security Event: ${entry.type}`, {
    level: entry.severity,
    extra: entry
  })
}
```

---

## 💾 Backups Automáticos

### Scripts Disponibles

**Ubicación:** `scripts/`

1. `backup-database.sh` - Crear backup
2. `restore-database.sh` - Restaurar backup

### Crear Backup Manual

```bash
# Dar permisos de ejecución (primera vez)
chmod +x scripts/backup-database.sh

# Ejecutar backup
DATABASE_URL="postgresql://user:pass@host:5432/db" \
  ./scripts/backup-database.sh
```

### Configuración de Backup

```bash
# Variables de entorno opcionales
export BACKUP_DIR="./backups"        # Directorio de backups
export RETENTION_DAYS="30"           # Días de retención
```

### Backup Automático con Cron

```bash
# Editar crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * cd /path/to/app && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh >> /var/log/backup.log 2>&1

# Backup cada 6 horas
0 */6 * * * cd /path/to/app && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh

# Backup semanal (domingos a las 3 AM)
0 3 * * 0 cd /path/to/app && DATABASE_URL="postgresql://..." ./scripts/backup-database.sh
```

### Restaurar Backup

```bash
# Dar permisos de ejecución (primera vez)
chmod +x scripts/restore-database.sh

# Restaurar desde backup
DATABASE_URL="postgresql://user:pass@host:5432/db" \
  ./scripts/restore-database.sh backups/taekwondo_backup_20240115_020000.sql.gz
```

### Backup en la Nube

#### AWS S3

```bash
# Instalar AWS CLI
apt install awscli

# Configurar credenciales
aws configure

# Modificar backup-database.sh para subir a S3
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://tu-bucket/backups/
```

#### Google Cloud Storage

```bash
# Instalar gcloud
# https://cloud.google.com/sdk/docs/install

# Subir backup
gsutil cp "$BACKUP_DIR/$BACKUP_FILE" gs://tu-bucket/backups/
```

### Verificar Backups

```bash
# Listar backups
ls -lh backups/

# Ver tamaño total
du -sh backups/

# Contar backups
ls backups/ | wc -l

# Verificar integridad (descomprimir sin restaurar)
gunzip -t backups/taekwondo_backup_20240115_020000.sql.gz
```

---

## 🎯 Mejores Prácticas

### Variables de Entorno

```bash
# ✅ HACER
- Usar variables de entorno para secrets
- Diferentes secrets por entorno
- Rotar secrets periódicamente
- Usar .env.example como template

# ❌ NO HACER
- Commitear .env a Git
- Hardcodear secrets en código
- Compartir secrets por email/chat
- Usar mismos secrets en dev y prod
```

### Contraseñas

```bash
# ✅ HACER
- Mínimo 8 caracteres
- Hashear con bcrypt (ya implementado)
- Validar complejidad
- Implementar cambio de contraseña

# ❌ NO HACER
- Guardar contraseñas en texto plano
- Enviar contraseñas por email
- Usar contraseñas débiles
- Reutilizar contraseñas
```

### Base de Datos

```bash
# ✅ HACER
- Backups automáticos diarios
- Usar SSL en conexiones
- Limitar acceso por IP
- Monitorear queries lentas

# ❌ NO HACER
- Exponer puerto de DB públicamente
- Usar usuario root en producción
- Ignorar logs de errores
- Olvidar hacer backups
```

### Código

```bash
# ✅ HACER
- Validar TODO input del usuario
- Usar Prisma para queries
- Implementar rate limiting
- Loggear eventos de seguridad

# ❌ NO HACER
- Confiar en input del cliente
- Construir queries SQL manualmente
- Ignorar errores de validación
- Exponer stack traces en producción
```

---

## 📈 Monitoreo

### Métricas Clave

1. **Intentos de Login Fallidos**
   - Umbral: > 5 por usuario en 15 min
   - Acción: Bloquear temporalmente

2. **Rate Limit Hits**
   - Umbral: > 10 por IP en 1 hora
   - Acción: Investigar IP

3. **Accesos No Autorizados**
   - Umbral: > 0
   - Acción: Alerta inmediata

4. **Queries Lentas**
   - Umbral: > 1 segundo
   - Acción: Optimizar query

### Dashboard de Seguridad (Futuro)

Puedes crear un dashboard para visualizar:

```typescript
// Endpoint: /api/security/dashboard
export async function GET() {
  const logs = securityLogger.getRecentLogs(1000)
  const patterns = securityLogger.detectSuspiciousPatterns()
  
  return NextResponse.json({
    totalEvents: logs.length,
    failedLogins: logs.filter(l => l.type === 'LOGIN_FAILED').length,
    rateLimitHits: logs.filter(l => l.type === 'LOGIN_RATE_LIMITED').length,
    suspiciousIPs: Array.from(patterns.repeatedFailedLogins.entries())
      .filter(([_, count]) => count > 5)
  })
}
```

### Alertas

Configura alertas para eventos críticos:

```typescript
// En security-logger.ts
if (entry.severity === 'critical') {
  // Enviar email/SMS/Slack
  sendAlert(entry)
}
```

---

## 🔍 Auditoría de Seguridad

### Checklist Mensual

- [ ] Revisar logs de seguridad
- [ ] Verificar backups funcionan
- [ ] Actualizar dependencias
- [ ] Rotar secrets si es necesario
- [ ] Revisar usuarios activos
- [ ] Verificar rate limits efectivos
- [ ] Comprobar headers de seguridad
- [ ] Analizar patrones sospechosos

### Herramientas Recomendadas

- **OWASP ZAP**: Escaneo de vulnerabilidades
- **npm audit**: Vulnerabilidades en dependencias
- **Snyk**: Monitoreo continuo
- **SecurityHeaders.com**: Verificar headers

```bash
# Escanear vulnerabilidades
npm audit

# Arreglar automáticamente
npm audit fix

# Ver reporte detallado
npm audit --json
```

---

## 📞 Contacto y Soporte

Si detectas una vulnerabilidad de seguridad:

1. **NO** la publiques públicamente
2. Contacta al equipo de desarrollo
3. Proporciona detalles técnicos
4. Espera confirmación antes de divulgar

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
- [NextAuth Security](https://next-auth.js.org/configuration/options#security)

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-seguridad---taekwondo-manager)**

Made with 🔒 for Security

</div>