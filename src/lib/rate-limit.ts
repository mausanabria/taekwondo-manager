/**
 * Rate Limiting Utility
 * Previene ataques de fuerza bruta limitando requests por IP
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  interval: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests en la ventana
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Verifica si un identificador (IP, email, etc.) ha excedido el límite
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  // Si no existe o expiró, crear nueva entrada
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.interval
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: store[key].resetTime
    }
  }

  // Incrementar contador
  store[key].count++

  // Verificar si excedió el límite
  if (store[key].count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: store[key].resetTime
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - store[key].count,
    reset: store[key].resetTime
  }
}

/**
 * Configuraciones predefinidas
 */
export const RATE_LIMITS = {
  // Login: 5 intentos por 15 minutos
  LOGIN: {
    interval: 15 * 60 * 1000,
    maxRequests: 5
  },
  // API general: 100 requests por minuto
  API: {
    interval: 60 * 1000,
    maxRequests: 100
  },
  // Registro: 3 intentos por hora
  REGISTER: {
    interval: 60 * 60 * 1000,
    maxRequests: 3
  }
}

/**
 * Obtiene el identificador del request (IP)
 */
export function getIdentifier(request: Request): string {
  // Intentar obtener IP real detrás de proxies
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback a IP directa (en desarrollo)
  return 'unknown'
}

// Made with Bob