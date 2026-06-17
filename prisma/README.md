# Prisma Database Setup Guide

Este documento explica cómo configurar y gestionar la base de datos del sistema de gestión de taekwondo.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y ejecutándose
- Acceso a una base de datos PostgreSQL

## 🚀 Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui-cambiar-en-produccion"
```

**Importante:** Reemplaza `usuario`, `contraseña` y `taekwondo_db` con tus credenciales reales de PostgreSQL.

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias, incluyendo:
- `@prisma/client` - Cliente de Prisma
- `prisma` - CLI de Prisma
- `ts-node` - Para ejecutar el seed
- `bcryptjs` - Para hashear contraseñas

### 3. Generar el Cliente de Prisma

```bash
npx prisma generate
```

Este comando genera el cliente de Prisma basado en el schema.

## 🗄️ Gestión de Migraciones

### Crear la Migración Inicial

Para crear la base de datos y todas las tablas por primera vez:

```bash
npx prisma migrate dev --name init
```

Este comando:
1. Crea la base de datos si no existe
2. Aplica todas las migraciones pendientes
3. Genera el cliente de Prisma
4. Ejecuta el seed automáticamente (si está configurado)

### Crear Nuevas Migraciones

Cuando modifiques el schema, crea una nueva migración:

```bash
npx prisma migrate dev --name descripcion_del_cambio
```

Ejemplos:
```bash
npx prisma migrate dev --name add_student_photo_field
npx prisma migrate dev --name add_belt_exam_table
```

### Aplicar Migraciones en Producción

```bash
npx prisma migrate deploy
```

**Nota:** Este comando NO ejecuta el seed automáticamente.

### Ver Estado de Migraciones

```bash
npx prisma migrate status
```

### Resetear la Base de Datos (⚠️ CUIDADO)

```bash
npx prisma migrate reset
```

Este comando:
1. Elimina la base de datos
2. Crea una nueva base de datos
3. Aplica todas las migraciones
4. Ejecuta el seed

**⚠️ ADVERTENCIA:** Esto eliminará TODOS los datos. Solo usar en desarrollo.

## 🌱 Seed (Datos de Ejemplo)

### Ejecutar el Seed

```bash
npx prisma db seed
```

O alternativamente:

```bash
npm run prisma db seed
```

### Datos Creados por el Seed

El seed crea los siguientes datos de ejemplo:

#### 👤 Usuarios (Profesores)
- **Email:** `juan.perez@taekwondo.com`
  - **Password:** `password123`
  - **Escuela:** Escuela de Taekwondo Dragón Dorado

- **Email:** `maria.gonzalez@taekwondo.com`
  - **Password:** `password123`
  - **Escuela:** Academia Tigre Blanco

#### 🏫 Escuelas
1. **Escuela de Taekwondo Dragón Dorado**
   - Dirección: Av. Libertador 1234, Buenos Aires
   - Teléfono: +54 11 4567-8900

2. **Academia Tigre Blanco**
   - Dirección: Calle Corrientes 5678, Buenos Aires
   - Teléfono: +54 11 4567-8901

#### 📅 Horarios (Escuela Dragón Dorado)
- **Lunes y Miércoles 17:00-18:00:** Niños Principiantes (Capacidad: 20)
- **Martes y Jueves 19:00-20:30:** Adultos Avanzados (Capacidad: 15)
- **Viernes 18:00-20:00:** Entrenamiento de Competencia (Capacidad: 12)

#### 👨‍🎓 Estudiantes
10 estudiantes con diferentes cinturones:
- Lucas Martínez (Amarillo)
- Sofía Rodríguez (Naranja)
- Mateo Fernández (Verde)
- Valentina López (Azul)
- Benjamín García (Rojo)
- Emma Sánchez (Blanco)
- Thiago Romero (Amarillo)
- Martina Díaz (Verde)
- Santiago Torres (Azul)
- Isabella Morales (Naranja)

#### ✅ Asistencias
- Registros de asistencia para los últimos 3 meses
- ~90% de asistencia para estudiantes regulares

#### 💰 Pagos
- Cuotas mensuales configuradas: $15,000 ARS
- Algunos estudiantes con pagos al día
- Algunos estudiantes con deudas pendientes (para probar la lógica de cálculo)

## 🔍 Herramientas Útiles

### Prisma Studio (GUI para la Base de Datos)

```bash
npx prisma studio
```

Abre una interfaz web en `http://localhost:5555` donde puedes:
- Ver todos los datos
- Editar registros
- Crear nuevos registros
- Eliminar datos

### Validar el Schema

```bash
npx prisma validate
```

### Formatear el Schema

```bash
npx prisma format
```

## 📊 Estructura del Schema

### Modelos Principales

1. **User** - Usuarios del sistema (profesores)
2. **School** - Escuelas de taekwondo
3. **Student** - Alumnos
4. **Schedule** - Horarios de clases
5. **StudentSchedule** - Inscripciones de alumnos a horarios
6. **Attendance** - Registro de asistencias
7. **Payment** - Pagos realizados
8. **MonthlyFee** - Configuración de cuotas mensuales

### Relaciones Clave

```
User (1) ──→ (N) School
School (1) ──→ (N) Student
School (1) ──→ (N) Schedule
Student (N) ←──→ (N) Schedule (through StudentSchedule)
Student (1) ──→ (N) Attendance
Schedule (1) ──→ (N) Attendance
Student (1) ──→ (N) Payment
School (1) ──→ (N) Payment
School (1) ──→ (N) MonthlyFee
```

## 🔐 Seguridad

### Contraseñas
- Todas las contraseñas se hashean con `bcryptjs` (10 rounds)
- Nunca almacenar contraseñas en texto plano
- El seed usa contraseñas hasheadas

### Variables de Entorno
- Nunca commitear el archivo `.env`
- Usar `.env.example` como plantilla
- Cambiar `NEXTAUTH_SECRET` en producción

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solución:**
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar las credenciales en `DATABASE_URL`
3. Verificar que la base de datos exista

```bash
# En PostgreSQL
CREATE DATABASE taekwondo_db;
```

### Error: "Migration failed"

**Solución:**
1. Verificar el estado de las migraciones: `npx prisma migrate status`
2. Si hay conflictos, resetear: `npx prisma migrate reset` (solo desarrollo)
3. Aplicar migraciones manualmente: `npx prisma migrate deploy`

### Error: "Seed failed"

**Solución:**
1. Verificar que las dependencias estén instaladas: `npm install`
2. Verificar que el cliente de Prisma esté generado: `npx prisma generate`
3. Revisar los logs de error para más detalles

### Error: "Type errors in seed.ts"

**Solución:**
Los errores de TypeScript en `seed.ts` son normales antes de instalar las dependencias. Ejecutar:

```bash
npm install
npx prisma generate
```

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## 🚀 Comandos Rápidos

```bash
# Setup inicial completo
npm install
npx prisma generate
npx prisma migrate dev --name init

# Desarrollo diario
npx prisma studio                    # Abrir GUI
npx prisma migrate dev --name cambio # Nueva migración
npx prisma db seed                   # Re-ejecutar seed

# Producción
npx prisma migrate deploy            # Aplicar migraciones
npx prisma generate                  # Generar cliente

# Utilidades
npx prisma validate                  # Validar schema
npx prisma format                    # Formatear schema
npx prisma migrate status            # Ver estado
```

## 📝 Notas Importantes

1. **Lógica de Pagos:** El sistema solo genera deuda si el alumno asistió al menos una vez en el mes.

2. **Índices:** El schema incluye índices optimizados para consultas frecuentes:
   - `Student.schoolId`
   - `Student.isActive`
   - `Schedule.schoolId`
   - `Schedule.dayOfWeek`
   - `Attendance.date`
   - `Payment.month, year`

3. **Cascadas:** Las eliminaciones en cascada están configuradas para mantener la integridad referencial.

4. **Timestamps:** Todos los modelos principales incluyen `createdAt` y `updatedAt`.

5. **Validaciones:** Las validaciones de negocio deben implementarse en la capa de aplicación (API routes).