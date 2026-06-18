# 🥋 Taekwondo Manager

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)
![License](https://img.shields.io/badge/license-Private-red)

**Sistema completo de gestión para escuelas de Taekwondo**

[Características](#-características) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Tecnologías](#-tecnologías)

</div>

---

## 📖 Descripción

**Taekwondo Manager** es una aplicación web moderna y completa diseñada para facilitar la gestión administrativa de escuelas de Taekwondo. Desarrollada con las últimas tecnologías web, ofrece una solución integral para el control de alumnos, horarios, asistencias y pagos.

### 🎯 Problema que Resuelve

Las escuelas de artes marciales tradicionalmente manejan su administración con planillas de Excel, cuadernos o sistemas desactualizados. Esto genera:
- ❌ Pérdida de información
- ❌ Dificultad para hacer seguimiento de pagos
- ❌ Control manual de asistencias
- ❌ Falta de estadísticas y reportes

**Taekwondo Manager** soluciona estos problemas con una plataforma centralizada, intuitiva y eficiente.

---

## ✨ Características

### 👥 Gestión de Alumnos
- ✅ Registro completo de estudiantes con información personal
- ✅ Seguimiento de progreso (cinturones, notas)
- ✅ Contactos de emergencia
- ✅ Activación/desactivación de alumnos
- ✅ Búsqueda y filtrado avanzado

### 📅 Gestión de Horarios
- ✅ Creación de horarios semanales
- ✅ Inscripción de alumnos en clases
- ✅ Control de capacidad por clase
- ✅ Vista de calendario semanal
- ✅ Gestión de múltiples horarios

### 📊 Registro de Asistencia
- ✅ Marcado rápido de asistencia por clase
- ✅ Calendario visual de asistencias
- ✅ Historial completo por alumno
- ✅ Estadísticas de asistencia
- ✅ Cálculo de porcentajes y tendencias

### 💰 Sistema de Pagos Inteligente
- ✅ Configuración de cuotas mensuales
- ✅ Registro de pagos con múltiples métodos
- ✅ **Lógica inteligente**: Solo cobra si el alumno asistió
- ✅ Cálculo automático de deudas
- ✅ Alertas de pagos pendientes
- ✅ Historial completo de pagos
- ✅ Reportes de ingresos

### 📈 Dashboard y Reportes
- ✅ Métricas en tiempo real
- ✅ Gráficos de asistencia
- ✅ Estadísticas de pagos
- ✅ Distribución de alumnos por cinturón
- ✅ Actividad reciente
- ✅ Clases próximas

### 🔐 Seguridad y Autenticación
- ✅ Sistema de login seguro con NextAuth.js
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Sesiones JWT
- ✅ Protección de rutas
- ✅ Multi-escuela (un profesor puede tener varias escuelas)
- ✅ **Rate Limiting** para prevenir ataques de fuerza bruta
- ✅ **Security Headers** (HSTS, X-Frame-Options, CSP, etc.)
- ✅ **Security Logging** para auditoría y monitoreo
- ✅ **Backups automáticos** de base de datos

---

## 🚀 Instalación Rápida

### Requisitos Previos

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14.x o superior ([Descargar](https://www.postgresql.org/download/))
- **npm** o **yarn** (incluido con Node.js)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd taekwondo-manager

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Configurar base de datos
npx prisma migrate dev --name init
npx prisma generate

# 5. (Opcional) Cargar datos de ejemplo
npx prisma db seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

> 📚 **Para instrucciones detalladas**, consulta la [Guía de Instalación Completa](docs/INSTALLATION.md)

---

## 📁 Estructura del Proyecto

```
taekwondo-manager/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Rutas de autenticación
│   │   │   ├── login/           # Página de login
│   │   │   └── register/        # Página de registro
│   │   ├── (dashboard)/         # Rutas protegidas del dashboard
│   │   │   ├── page.tsx         # Dashboard principal
│   │   │   ├── students/        # Gestión de alumnos
│   │   │   ├── schedules/       # Gestión de horarios
│   │   │   ├── attendance/      # Registro de asistencia
│   │   │   ├── payments/        # Gestión de pagos
│   │   │   └── settings/        # Configuración
│   │   └── api/                 # API Routes
│   │       ├── auth/            # Endpoints de autenticación
│   │       ├── students/        # CRUD de alumnos
│   │       ├── schedules/       # CRUD de horarios
│   │       ├── attendance/      # Registro de asistencia
│   │       ├── payments/        # Gestión de pagos
│   │       └── dashboard/       # Estadísticas
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes base (shadcn/ui)
│   │   ├── auth/                # Componentes de autenticación
│   │   ├── dashboard/           # Componentes del dashboard
│   │   ├── students/            # Componentes de alumnos
│   │   ├── schedules/           # Componentes de horarios
│   │   ├── attendance/          # Componentes de asistencia
│   │   └── payments/            # Componentes de pagos
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── auth.ts              # Configuración de NextAuth
│   │   ├── prisma.ts            # Cliente de Prisma
│   │   ├── utils.ts             # Funciones auxiliares
│   │   └── validations/         # Esquemas de validación Zod
│   ├── services/                # Lógica de negocio
│   │   ├── studentService.ts    # Servicio de alumnos
│   │   ├── scheduleService.ts   # Servicio de horarios
│   │   ├── attendanceService.ts # Servicio de asistencia
│   │   ├── paymentService.ts    # Servicio de pagos (lógica inteligente)
│   │   └── dashboardService.ts  # Servicio de estadísticas
│   └── types/                   # Tipos TypeScript
│       └── index.ts             # Definiciones de tipos
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── seed.ts                  # Datos de ejemplo
├── docs/                        # Documentación
│   ├── INSTALLATION.md          # Guía de instalación
│   ├── USER_GUIDE.md            # Guía de usuario
│   ├── TECHNICAL.md             # Documentación técnica
│   ├── DEPLOYMENT.md            # Guía de despliegue
│   ├── DEVELOPMENT.md           # Guía de desarrollo
│   └── FAQ.md                   # Preguntas frecuentes
├── public/                      # Archivos estáticos
├── .env.example                 # Ejemplo de variables de entorno
├── package.json                 # Dependencias del proyecto
└── README.md                    # Este archivo
```

---

## 🗄️ Modelos de Base de Datos

El sistema utiliza **Prisma ORM** con **PostgreSQL**. Los modelos principales son:

| Modelo | Descripción |
|--------|-------------|
| **User** | Usuarios del sistema (profesores/administradores) |
| **School** | Escuelas de Taekwondo |
| **Student** | Alumnos registrados |
| **Schedule** | Horarios de clases semanales |
| **StudentSchedule** | Inscripciones de alumnos en horarios |
| **Attendance** | Registro de asistencias |
| **Payment** | Pagos realizados |
| **MonthlyFee** | Configuración de cuotas mensuales |

### Relaciones Clave

- Un **User** puede tener múltiples **Schools**
- Una **School** tiene múltiples **Students**, **Schedules**, **Payments** y **MonthlyFees**
- Un **Student** puede estar inscrito en múltiples **Schedules**
- Cada **Attendance** está vinculada a un **Student** y un **Schedule**
- Los **Payments** están asociados a un **Student** y una **School**

> 📚 **Para más detalles**, consulta la [Documentación Técnica](docs/TECHNICAL.md)

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo (http://localhost:3000)

# Producción
npm run build        # Construir aplicación para producción
npm start            # Ejecutar aplicación en modo producción

# Calidad de código
npm run lint         # Ejecutar ESLint para verificar código

# Base de datos (Prisma)
npx prisma studio    # Abrir interfaz visual de la base de datos
npx prisma generate  # Generar cliente de Prisma
npx prisma migrate dev --name <nombre>  # Crear nueva migración
npx prisma db seed   # Cargar datos de ejemplo
npx prisma migrate reset  # Resetear base de datos (¡cuidado!)
```

---

## 💻 Tecnologías

### Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Radix UI](https://www.radix-ui.com/)** - Componentes accesibles
- **[Lucide React](https://lucide.dev/)** - Iconos

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Endpoints API
- **[Prisma ORM](https://www.prisma.io/)** - ORM para base de datos
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticación
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Encriptación de contraseñas
- **[Zod](https://zod.dev/)** - Validación de esquemas

### Utilidades
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[clsx](https://www.npmjs.com/package/clsx)** - Utilidad para clases CSS

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📦 Guía de Instalación](docs/INSTALLATION.md) | Instalación paso a paso del sistema |
| [👤 Guía de Usuario](docs/USER_GUIDE.md) | Cómo usar la aplicación (para usuarios finales) |
| [🔧 Documentación Técnica](docs/TECHNICAL.md) | Arquitectura y detalles técnicos |
| [🚀 Guía de Despliegue](docs/DEPLOYMENT.md) | Cómo desplegar en producción |
| [🔒 Guía de Seguridad](docs/SECURITY.md) | **Medidas de seguridad y mejores prácticas** |
| [💻 Guía de Desarrollo](docs/DEVELOPMENT.md) | Cómo contribuir y desarrollar |
| [❓ FAQ](docs/FAQ.md) | Preguntas frecuentes y solución de problemas |
| [📝 Changelog](CHANGELOG.md) | Historial de versiones y cambios |

---

## 🎨 Capturas de Pantalla

### Dashboard Principal
El dashboard muestra métricas clave en tiempo real:
- Total de alumnos (activos e inactivos)
- Horarios configurados
- Tasa de asistencia mensual
- Recaudación mensual
- Alumnos al día vs. con deuda
- Gráficos de tendencias
- Alertas de pagos pendientes
- Actividad reciente

### Gestión de Alumnos
Interfaz completa para administrar alumnos:
- Lista con búsqueda y filtros
- Formulario de registro con validación
- Vista detallada con estadísticas
- Historial de asistencia
- Estado de pagos

### Registro de Asistencia
Sistema intuitivo de control de asistencia:
- Calendario visual mensual
- Marcado rápido por clase
- Estadísticas por alumno
- Historial completo

### Gestión de Pagos
Sistema inteligente de pagos:
- Configuración de cuotas mensuales
- Registro de pagos con múltiples métodos
- Cálculo automático de deudas
- Solo cobra meses con asistencia
- Alertas de pagos pendientes

---

## 🔐 Credenciales de Prueba

Si ejecutaste el seed de datos (`npx prisma db seed`), puedes usar estas credenciales:

**Usuario 1:**
- Email: `juan.perez@taekwondo.com`
- Password: `password123`
- Escuela: Escuela de Taekwondo Dragón Dorado

**Usuario 2:**
- Email: `maria.gonzalez@taekwondo.com`
- Password: `password123`
- Escuela: Academia Tigre Blanco

---

## 🌟 Características Destacadas

### 💡 Sistema de Pagos Inteligente

Una de las características más innovadoras del sistema es la **lógica inteligente de pagos**:

**¿Cómo funciona?**
1. El sistema solo genera deuda para meses donde el alumno **asistió al menos una vez**
2. Si un alumno no asiste en todo el mes, **no se genera deuda** para ese mes
3. Esto es justo tanto para el alumno como para la escuela
4. El cálculo es automático y se actualiza en tiempo real

**Ejemplo:**
- Cuota mensual: $10,000
- Alumno asiste en Enero: ✅ Se genera deuda de $10,000
- Alumno NO asiste en Febrero: ❌ No se genera deuda
- Alumno asiste en Marzo: ✅ Se genera deuda de $10,000
- **Deuda total: $20,000** (solo Enero y Marzo)

> 📚 **Para más detalles**, consulta la [Guía de Usuario - Sección de Pagos](docs/USER_GUIDE.md#gestión-de-pagos)

---

## 🚀 Despliegue

### Opciones Recomendadas

#### 1. Vercel (Recomendado para Next.js)
- Despliegue automático desde Git
- Configuración de variables de entorno
- Base de datos PostgreSQL externa (Neon, Supabase, Railway)

#### 2. Railway / Render
- Incluye PostgreSQL en el mismo servicio
- Configuración sencilla
- Plan gratuito disponible

#### 3. VPS Tradicional
- DigitalOcean, AWS, Linode, etc.
- Mayor control y personalización
- Requiere más configuración

> 📚 **Para instrucciones detalladas**, consulta la [Guía de Despliegue](docs/DEPLOYMENT.md)

---

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:

1. Contacta al administrador del proyecto
2. Lee la [Guía de Desarrollo](docs/DEVELOPMENT.md)
3. Sigue las convenciones de código establecidas
4. Crea un Pull Request con tus cambios

---

## 📄 Licencia

Este proyecto es **privado** y está protegido por derechos de autor. Todos los derechos reservados.

---

## 📞 Soporte

¿Necesitas ayuda? Consulta:

1. 📚 [Documentación completa](docs/)
2. ❓ [Preguntas Frecuentes](docs/FAQ.md)
3. 🐛 Reporta bugs creando un issue
4. 💬 Contacta al equipo de desarrollo

---

## 🙏 Agradecimientos

Desarrollado con ❤️ usando las mejores tecnologías modernas.

**Stack tecnológico:**
- Next.js 14 & React 18
- TypeScript 5
- PostgreSQL 14+
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- shadcn/ui

---

<div align="center">

**[⬆ Volver arriba](#-taekwondo-manager)**

Made with 🥋 by Bob

</div>