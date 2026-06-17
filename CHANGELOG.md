# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2024-01-15

### 🎉 Lanzamiento Inicial

Primera versión estable de Taekwondo Manager con todas las funcionalidades principales implementadas.

### ✨ Características Principales

#### 🔐 Autenticación y Seguridad
- Sistema de autenticación con NextAuth.js
- Login con email y contraseña
- Registro de nuevos usuarios
- Contraseñas hasheadas con bcrypt
- Sesiones JWT con expiración de 30 días
- Protección de rutas con middleware
- Verificación de permisos por escuela

#### 👥 Gestión de Alumnos
- CRUD completo de alumnos
- Campos de información personal:
  - Nombre y apellido
  - Email y teléfono
  - Fecha de nacimiento
  - Dirección
  - Cinturón actual
  - Contacto de emergencia
  - Notas adicionales
- Estado activo/inactivo
- Búsqueda y filtrado de alumnos
- Vista detallada con pestañas:
  - Información general
  - Horarios inscritos
  - Historial de asistencia
  - Estado de pagos
- Estadísticas por alumno

#### 📅 Gestión de Horarios
- CRUD completo de horarios de clase
- Configuración de horarios semanales:
  - Nombre de la clase
  - Día de la semana
  - Hora de inicio y fin
  - Capacidad máxima (opcional)
- Inscripción de alumnos en horarios
- Desinscripción de alumnos
- Vista de calendario semanal
- Lista de alumnos por horario
- Control de capacidad

#### ✅ Registro de Asistencia
- Registro rápido de asistencia por clase
- Registro individual por alumno
- Registro masivo (bulk) para toda la clase
- Calendario visual de asistencias
- Historial completo por alumno
- Estadísticas de asistencia:
  - Total de asistencias
  - Porcentaje de asistencia
  - Racha actual
  - Racha más larga
- Notas opcionales por asistencia
- Edición de asistencias registradas
- Filtros por fecha y horario

#### 💰 Sistema de Pagos Inteligente
- **Lógica inteligente**: Solo cobra meses con asistencia
- Configuración de cuotas mensuales
- Registro de pagos con:
  - Monto
  - Mes y año
  - Fecha de pago
  - Método de pago
  - Notas opcionales
- Cálculo automático de deudas
- Desglose de deuda por mes
- Historial completo de pagos
- Estado de pagos por alumno:
  - Al día
  - Parcial (1 mes)
  - Atrasado (2+ meses)
- Alertas de pagos pendientes
- Estadísticas de pagos:
  - Recaudación mensual
  - Recaudación anual
  - Total recaudado
  - Deuda total
  - Alumnos al día vs con deuda
- Soporte para pagos parciales

#### 📊 Dashboard y Reportes
- Dashboard principal con métricas en tiempo real:
  - Total de alumnos (activos/inactivos)
  - Horarios activos
  - Tasa de asistencia mensual
  - Recaudación mensual
  - Alumnos al día
  - Alumnos con deuda
- Gráfico de tendencia de asistencia (7 días)
- Distribución de alumnos por cinturón
- Alertas de pagos pendientes (top 5)
- Clases próximas (hoy y mañana)
- Actividad reciente (últimas 10)
- Acciones rápidas para funciones comunes

#### 🎨 Interfaz de Usuario
- Diseño moderno y responsive
- Compatible con móviles, tablets y desktop
- Componentes UI con shadcn/ui y Radix UI
- Iconos con Lucide React
- Estilos con Tailwind CSS
- Tema claro (modo oscuro en roadmap)
- Navegación intuitiva
- Feedback visual (toasts, loading states)
- Formularios con validación
- Modales y diálogos

#### 🗄️ Base de Datos
- PostgreSQL como base de datos
- Prisma ORM para gestión de datos
- Modelos implementados:
  - User (usuarios/profesores)
  - School (escuelas)
  - Student (alumnos)
  - Schedule (horarios)
  - StudentSchedule (inscripciones)
  - Attendance (asistencias)
  - Payment (pagos)
  - MonthlyFee (cuotas mensuales)
- Relaciones entre modelos
- Índices para optimización
- Migraciones versionadas
- Seed con datos de ejemplo

#### 🔧 Servicios y Lógica de Negocio
- `studentService`: Gestión de alumnos
- `scheduleService`: Gestión de horarios
- `attendanceService`: Control de asistencia
- `paymentService`: Sistema de pagos inteligente
- `dashboardService`: Agregación de estadísticas
- Validación con Zod
- Manejo de errores
- Transacciones de base de datos

#### 📱 API REST
- Endpoints para todas las funcionalidades
- Autenticación en todas las rutas
- Validación de entrada
- Respuestas JSON estandarizadas
- Códigos de estado HTTP apropiados
- Manejo de errores consistente

### 🛠️ Tecnologías Utilizadas

#### Frontend
- Next.js 14 con App Router
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- shadcn/ui components
- Radix UI primitives
- Lucide React icons
- date-fns para fechas

#### Backend
- Next.js API Routes
- Prisma ORM 5
- PostgreSQL 14+
- NextAuth.js 4.24
- bcryptjs para contraseñas
- Zod para validación

#### Desarrollo
- ESLint para linting
- TypeScript para tipado
- Git para control de versiones

### 📚 Documentación
- README.md principal completo
- Guía de instalación detallada
- Guía de usuario completa
- Documentación técnica
- Guía de despliegue
- Guía de desarrollo
- FAQ con troubleshooting
- Este CHANGELOG

### 🔒 Seguridad
- Contraseñas hasheadas con bcrypt (10 rounds)
- Sesiones JWT seguras
- Protección CSRF
- Validación de entrada en todas las APIs
- Autorización por escuela
- Variables de entorno para secretos
- HTTPS en producción

### 🚀 Despliegue
- Compatible con Vercel
- Compatible con Railway
- Compatible con Render
- Compatible con VPS tradicionales
- Documentación de despliegue completa
- Configuración de variables de entorno
- Guía de migraciones en producción

### 📦 Datos de Ejemplo
- Script de seed incluido
- 2 usuarios de prueba
- 2 escuelas de ejemplo
- 15 alumnos de muestra
- 6 horarios configurados
- Inscripciones de ejemplo
- Registros de asistencia
- Cuotas mensuales
- Pagos de ejemplo

### 🎯 Características Destacadas

#### Sistema de Pagos Inteligente
La característica más innovadora del sistema:
- Solo genera deuda si el alumno asistió al menos una vez en el mes
- Si no asiste en todo el mes, no se cobra
- Cálculo automático basado en asistencia real
- Justo para alumno y escuela
- Transparente y fácil de entender

#### Dashboard Completo
- Métricas en tiempo real
- Visualización de datos clara
- Acciones rápidas
- Alertas importantes
- Actividad reciente

#### Diseño Responsive
- Funciona en cualquier dispositivo
- Optimizado para móviles
- Interfaz táctil amigable
- Navegación adaptativa

### 🐛 Correcciones
- N/A (primera versión)

### 🔄 Cambios
- N/A (primera versión)

### ⚠️ Deprecaciones
- N/A (primera versión)

### 🗑️ Eliminaciones
- N/A (primera versión)

---

## [Unreleased]

### 🚧 En Desarrollo

Funcionalidades planeadas para futuras versiones:

#### Versión 1.1
- [ ] Testing unitario completo
- [ ] Testing E2E con Playwright
- [ ] Optimización de queries
- [ ] Caché con Redis
- [ ] Rate limiting en APIs
- [ ] Logs estructurados
- [ ] Monitoreo con Sentry

#### Versión 1.2
- [ ] Notificaciones por email
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Gráficos avanzados
- [ ] Multi-idioma (i18n)
- [ ] Modo oscuro
- [ ] Búsqueda avanzada
- [ ] Filtros personalizados

#### Versión 2.0
- [ ] App móvil nativa (React Native)
- [ ] Integración con pasarelas de pago
- [ ] Sistema de mensajería interna
- [ ] Gestión de torneos y competencias
- [ ] Certificados digitales
- [ ] Gestión de inventario
- [ ] Sistema de evaluaciones
- [ ] Portal para alumnos/padres

---

## Tipos de Cambios

- **✨ Added** - Nuevas funcionalidades
- **🔄 Changed** - Cambios en funcionalidades existentes
- **⚠️ Deprecated** - Funcionalidades que serán eliminadas
- **🗑️ Removed** - Funcionalidades eliminadas
- **🐛 Fixed** - Corrección de bugs
- **🔒 Security** - Correcciones de seguridad

---

## Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nueva funcionalidad compatible
- **PATCH** (0.0.X): Correcciones de bugs compatibles

---

## Enlaces

- [Repositorio](https://github.com/tu-usuario/taekwondo-manager)
- [Documentación](docs/)
- [Issues](https://github.com/tu-usuario/taekwondo-manager/issues)
- [Pull Requests](https://github.com/tu-usuario/taekwondo-manager/pulls)

---

<div align="center">

**[⬆ Volver arriba](#-changelog)**

Para más información, consulta la [documentación completa](README.md)

Made with 🥋 and ❤️

</div>