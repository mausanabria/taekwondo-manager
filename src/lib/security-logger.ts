/**
 * Security Logger
 * Sistema de logging para eventos de seguridad
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_RATE_LIMITED = 'LOGIN_RATE_LIMITED',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  REGISTER_RATE_LIMITED = 'REGISTER_RATE_LIMITED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
}

export interface SecurityLogEntry {
  timestamp: string
  type: SecurityEventType
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class SecurityLogger {
  private logs: SecurityLogEntry[] = []
  private maxLogs = 1000 // Mantener últimos 1000 logs en memoria

  /**
   * Registra un evento de seguridad
   */
  log(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
    const logEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    }

    // Agregar a logs en memoria
    this.logs.push(logEntry)
    
    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Log en consola con formato
    this.logToConsole(logEntry)

    // En producción, aquí podrías enviar a un servicio externo
    // como Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry)
    }
  }

  /**
   * Log formateado en consola
   */
  private logToConsole(entry: SecurityLogEntry): void {
    const emoji = this.getEmojiForType(entry.type)
    const color = this.getColorForSeverity(entry.severity)
    
    console.log(
      `${emoji} [SECURITY ${entry.severity.toUpperCase()}] ${entry.type}`,
      {
        timestamp: entry.timestamp,
        userId: entry.userId,
        email: entry.email,
        ip: entry.ip,
        details: entry.details,
      }
    )
  }

  /**
   * Enviar a servicio externo (placeholder)
   */
  private sendToExternalService(entry: SecurityLogEntry): void {
    // Aquí implementarías la integración con servicios como:
    // - Sentry: para tracking de errores
    // - LogRocket: para session replay
    // - DataDog: para monitoring
    // - CloudWatch: si usas AWS
    
    // Ejemplo con fetch a un endpoint de logging:
    /*
    fetch('/api/security-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => console.error('Failed to send security log:', err))
    */
  }

  /**
   * Obtiene emoji según el tipo de evento
   */
  private getEmojiForType(type: SecurityEventType): string {
    const emojiMap: Record<SecurityEventType, string> = {
      [SecurityEventType.LOGIN_SUCCESS]: '✅',
      [SecurityEventType.LOGIN_FAILED]: '❌',
      [SecurityEventType.LOGIN_RATE_LIMITED]: '🚫',
      [SecurityEventType.REGISTER_SUCCESS]: '🎉',
      [SecurityEventType.REGISTER_FAILED]: '❌',
      [SecurityEventType.REGISTER_RATE_LIMITED]: '🚫',
      [SecurityEventType.UNAUTHORIZED_ACCESS]: '🔒',
      [SecurityEventType.PERMISSION_DENIED]: '⛔',
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: '⚠️',
      [SecurityEventType.DATA_BREACH_ATTEMPT]: '🚨',
      [SecurityEventType.PASSWORD_CHANGE]: '🔑',
      [SecurityEventType.ACCOUNT_LOCKED]: '🔐',
    }
    return emojiMap[type] || '📝'
  }

  /**
   * Obtiene color según severidad
   */
  private getColorForSeverity(severity: SecurityLogEntry['severity']): string {
    const colorMap = {
      low: '\x1b[32m',      // Verde
      medium: '\x1b[33m',   // Amarillo
      high: '\x1b[31m',     // Rojo
      critical: '\x1b[35m', // Magenta
    }
    return colorMap[severity]
  }

  /**
   * Obtiene logs recientes
   */
  getRecentLogs(limit: number = 100): SecurityLogEntry[] {
    return this.logs.slice(-limit)
  }

  /**
   * Obtiene logs por tipo
   */
  getLogsByType(type: SecurityEventType): SecurityLogEntry[] {
    return this.logs.filter(log => log.type === type)
  }

  /**
   * Obtiene logs por usuario
   */
  getLogsByUser(userId: string): SecurityLogEntry[] {
    return this.logs.filter(log => log.userId === userId)
  }

  /**
   * Obtiene logs por severidad
   */
  getLogsBySeverity(severity: SecurityLogEntry['severity']): SecurityLogEntry[] {
    return this.logs.filter(log => log.severity === severity)
  }

  /**
   * Detecta patrones sospechosos
   */
  detectSuspiciousPatterns(): {
    repeatedFailedLogins: Map<string, number>
    multipleIPs: Map<string, Set<string>>
  } {
    const failedLogins = new Map<string, number>()
    const userIPs = new Map<string, Set<string>>()

    this.logs.forEach(log => {
      // Contar intentos fallidos por email
      if (log.type === SecurityEventType.LOGIN_FAILED && log.email) {
        failedLogins.set(log.email, (failedLogins.get(log.email) || 0) + 1)
      }

      // Rastrear IPs por usuario
      if (log.userId && log.ip) {
        if (!userIPs.has(log.userId)) {
          userIPs.set(log.userId, new Set())
        }
        userIPs.get(log.userId)!.add(log.ip)
      }
    })

    return {
      repeatedFailedLogins: failedLogins,
      multipleIPs: userIPs,
    }
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger()

/**
 * Helper functions para logging rápido
 */
export function logLoginSuccess(userId: string, email: string, ip?: string): void {
  securityLogger.log({
    type: SecurityEventType.LOGIN_SUCCESS,
    userId,
    email,
    ip,
    severity: 'low',
  })
}

export function logLoginFailed(email: string, ip?: string, reason?: string): void {
  securityLogger.log({
    type: SecurityEventType.LOGIN_FAILED,
    email,
    ip,
    details: { reason },
    severity: 'medium',
  })
}

export function logUnauthorizedAccess(path: string, ip?: string, userId?: string): void {
  securityLogger.log({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    userId,
    ip,
    details: { path },
    severity: 'high',
  })
}

export function logPermissionDenied(userId: string, action: string, resource: string): void {
  securityLogger.log({
    type: SecurityEventType.PERMISSION_DENIED,
    userId,
    details: { action, resource },
    severity: 'medium',
  })
}

export function logSuspiciousActivity(description: string, userId?: string, ip?: string): void {
  securityLogger.log({
    type: SecurityEventType.SUSPICIOUS_ACTIVITY,
    userId,
    ip,
    details: { description },
    severity: 'high',
  })
}

// Made with Bob