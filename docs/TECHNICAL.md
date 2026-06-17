AttendedInMonth()
      - Obtener cuota configurada del mes
      - Obtener pagos realizados del mes
      - Si asistió Y hay cuota: Calcular deuda
      - Si NO asistió: NO generar deuda
   d. Sumar todas las deudas
   ↓
6. Response: Retorna StudentDebtDetails
   ↓
7. Frontend: Muestra deuda total y desglose por mes
```

---

## 💡 Lógica de Negocio Crítica

### Sistema de Pagos Inteligente

Esta es la característica más importante y diferenciadora del sistema.

#### Principio Fundamental

**"Solo se cobra por el servicio prestado"**

Si un alumno no asiste en un mes completo, no se le cobra ese mes, aunque tenga una cuota configurada.

#### Implementación

**Archivo**: `src/services/paymentService.ts`

**Función**: `getStudentDebtDetails()`

**Algoritmo**:

```typescript
1. Obtener fecha de inscripción del alumno
2. Obtener fecha actual
3. Para cada mes entre inscripción y hoy:
   a. Verificar si el alumno asistió al menos 1 vez
   b. Si asistió:
      - Buscar cuota configurada para ese mes
      - Buscar pagos realizados para ese mes
      - Calcular: Deuda = Cuota - Pagos
      - Si Deuda > 0: Agregar a lista de meses adeudados
   c. Si NO asistió:
      - NO generar deuda (saltar al siguiente mes)
4. Sumar todas las deudas individuales
5. Retornar deuda total y desglose
```

#### Casos de Uso

**Caso 1: Alumno Regular**
```
Enero: Asiste 10 veces → Debe $10,000
Febrero: Asiste 8 veces → Debe $10,000
Marzo: Asiste 12 veces → Debe $10,000
Total: $30,000
```

**Caso 2: Alumno con Ausencia**
```
Enero: Asiste 10 veces → Debe $10,000
Febrero: NO asiste → Debe $0 (no se cobra)
Marzo: Asiste 5 veces → Debe $10,000
Total: $20,000
```

**Caso 3: Alumno con Pago Parcial**
```
Enero: Asiste 10 veces, paga $5,000 → Debe $5,000
Febrero: Asiste 8 veces, paga $10,000 → Debe $0
Marzo: Asiste 12 veces, paga $0 → Debe $10,000
Total: $15,000
```

**Caso 4: Alumno Inactivo**
```
Enero: Asiste 10 veces → Debe $10,000
Febrero-Diciembre: NO asiste → Debe $0
Total: $10,000 (solo Enero)
```

#### Ventajas del Sistema

✅ **Justo para el alumno**: No paga si no usa el servicio
✅ **Justo para la escuela**: Cobra por el servicio prestado
✅ **Automático**: No requiere cálculos manuales
✅ **Transparente**: El alumno ve exactamente qué debe y por qué
✅ **Flexible**: Permite pagos parciales
✅ **Preciso**: Usa la asistencia real como base

---

## ⚡ Optimizaciones

### Índices de Base de Datos

Los índices mejoran significativamente el rendimiento de las consultas:

```prisma
// Student
@@index([schoolId])      // Búsquedas por escuela
@@index([isActive])      // Filtros por estado

// Schedule
@@index([schoolId])      // Búsquedas por escuela
@@index([dayOfWeek])     // Filtros por día

// Attendance
@@index([studentId])     // Historial del alumno
@@index([scheduleId])    // Asistencia por clase
@@index([date])          // Búsquedas por fecha

// Payment
@@index([studentId])     // Historial del alumno
@@index([schoolId])      // Reportes de la escuela
@@index([month, year])   // Búsquedas por período
```

### Consultas Optimizadas

#### 1. Uso de `include` para Reducir Queries

```typescript
// ❌ Malo: N+1 queries
const students = await prisma.student.findMany()
for (const student of students) {
  const payments = await prisma.payment.findMany({
    where: { studentId: student.id }
  })
}

// ✅ Bueno: 1 query
const students = await prisma.student.findMany({
  include: {
    payments: true
  }
})
```

#### 2. Uso de `select` para Reducir Datos

```typescript
// ❌ Malo: Trae todos los campos
const students = await prisma.student.findMany()

// ✅ Bueno: Solo campos necesarios
const students = await prisma.student.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    belt: true
  }
})
```

#### 3. Paginación

```typescript
const page = 1
const pageSize = 20

const students = await prisma.student.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { lastName: 'asc' }
})
```

### Caché en el Cliente

Next.js cachea automáticamente:
- Páginas estáticas
- Componentes de servidor
- Respuestas de API (con revalidación)

### Transacciones

Para operaciones que deben ser atómicas:

```typescript
await prisma.$transaction(async (tx) => {
  // Todas estas operaciones se ejecutan juntas
  // Si una falla, todas se revierten
  await tx.attendance.create({ data: attendance1 })
  await tx.attendance.create({ data: attendance2 })
  await tx.attendance.create({ data: attendance3 })
})
```

---

## 🔍 Debugging

### Logs de Prisma

Habilitar logs en desarrollo:

```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### Next.js Debug Mode

```bash
# Habilitar modo debug
NODE_OPTIONS='--inspect' npm run dev

# Luego abrir Chrome DevTools
chrome://inspect
```

### Prisma Studio

Interfaz visual para explorar la base de datos:

```bash
npx prisma studio
```

### Logs en Producción

Usar `console.log` estratégicamente:

```typescript
try {
  const result = await someOperation()
  console.log('Operation successful:', result)
} catch (error) {
  console.error('Operation failed:', error)
  throw error
}
```

---

## 🧪 Testing (Futuro)

### Estructura Propuesta

```
tests/
├── unit/
│   ├── services/
│   │   ├── paymentService.test.ts
│   │   ├── attendanceService.test.ts
│   │   └── studentService.test.ts
│   └── utils/
│       └── calculations.test.ts
├── integration/
│   ├── api/
│   │   ├── students.test.ts
│   │   ├── payments.test.ts
│   │   └── attendance.test.ts
│   └── database/
│       └── prisma.test.ts
└── e2e/
    ├── auth.test.ts
    ├── student-flow.test.ts
    └── payment-flow.test.ts
```

### Herramientas Recomendadas

- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **Playwright**: Testing E2E
- **Prisma Test Environment**: Testing de base de datos

---

## 📊 Métricas y Monitoreo

### Métricas Clave a Monitorear

1. **Performance**
   - Tiempo de respuesta de API
   - Tiempo de carga de páginas
   - Queries lentas de base de datos

2. **Uso**
   - Usuarios activos
   - Páginas más visitadas
   - Funciones más usadas

3. **Errores**
   - Tasa de errores
   - Errores más comunes
   - Fallos de autenticación

4. **Base de Datos**
   - Tamaño de la base de datos
   - Queries más lentas
   - Conexiones activas

### Herramientas Recomendadas

- **Vercel Analytics**: Métricas de Next.js
- **Sentry**: Tracking de errores
- **Prisma Pulse**: Monitoreo de base de datos
- **LogRocket**: Session replay

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

✅ **Autenticación**
- Contraseñas hasheadas con bcrypt
- Sesiones JWT con expiración
- Protección de rutas con middleware

✅ **Autorización**
- Verificación de schoolId en cada request
- Usuarios solo acceden a sus datos
- Validación de permisos en API

✅ **Validación de Entrada**
- Esquemas Zod en todas las APIs
- Sanitización de datos
- Prevención de SQL injection (Prisma)

✅ **Variables de Entorno**
- Secretos no en código
- `.env` en `.gitignore`
- Validación de variables requeridas

✅ **HTTPS**
- Forzar HTTPS en producción
- Cookies seguras
- Headers de seguridad

### Recomendaciones Adicionales

🔐 **Implementar**:
- Rate limiting en APIs
- CSRF protection
- Content Security Policy
- Auditoría de accesos
- Backup automático de BD

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Tutoriales Recomendados

- Next.js 14 App Router
- Prisma con PostgreSQL
- NextAuth.js Authentication
- TypeScript Best Practices

### Comunidad

- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Discord](https://discord.gg/prisma)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🔄 Versionado

### Semantic Versioning

El proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs

**Versión Actual**: 1.0.0

---

## 📝 Convenciones de Código

### TypeScript

```typescript
// ✅ Usar tipos explícitos
function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}

// ✅ Usar interfaces para objetos
interface Student {
  id: string
  firstName: string
  lastName: string
}

// ✅ Usar enums para constantes
enum BeltColor {
  WHITE = 'Blanco',
  YELLOW = 'Amarillo',
  GREEN = 'Verde',
  BLUE = 'Azul',
  RED = 'Rojo',
  BLACK = 'Negro'
}
```

### Nombres

```typescript
// ✅ Componentes: PascalCase
const StudentCard = () => {}

// ✅ Funciones: camelCase
const calculateDebt = () => {}

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_STUDENTS_PER_CLASS = 20

// ✅ Archivos de componentes: PascalCase.tsx
StudentCard.tsx

// ✅ Archivos de utilidades: camelCase.ts
dateUtils.ts
```

### Comentarios

```typescript
// ✅ Comentarios descriptivos
// Calculate total debt for a student based on attendance
const debt = await calculateDebt(studentId)

// ✅ JSDoc para funciones públicas
/**
 * Calculate the total debt for a student
 * @param studentId - The ID of the student
 * @param schoolId - The ID of the school
 * @returns The total debt amount
 */
async function calculateDebt(
  studentId: string,
  schoolId: string
): Promise<number>
```

---

## 🎯 Roadmap Técnico

### Versión 1.1 (Próxima)

- [ ] Testing unitario completo
- [ ] Testing E2E con Playwright
- [ ] Optimización de queries
- [ ] Caché de Redis
- [ ] Rate limiting

### Versión 1.2

- [ ] Notificaciones por email
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Gráficos avanzados
- [ ] Multi-idioma (i18n)
- [ ] Modo oscuro

### Versión 2.0

- [ ] App móvil (React Native)
- [ ] Integración con pasarelas de pago
- [ ] Sistema de mensajería
- [ ] Gestión de torneos
- [ ] Certificados digitales

---

## 🆘 Soporte Técnico

### Reportar Bugs

1. Verificar que no esté ya reportado
2. Incluir:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Logs de error
   - Versión del sistema

### Solicitar Funcionalidades

1. Describir la funcionalidad
2. Explicar el caso de uso
3. Proponer implementación (opcional)

### Contacto

- 📧 Email: soporte@taekwondo-manager.com
- 💬 Discord: [Link al servidor]
- 🐛 Issues: [Link al repositorio]

---

<div align="center">

**[⬆ Volver arriba](#-documentación-técnica---taekwondo-manager)**

Para más información, consulta:
- [Guía de Instalación](INSTALLATION.md)
- [Guía de Usuario](USER_GUIDE.md)
- [Guía de Desarrollo](DEVELOPMENT.md)
- [FAQ](FAQ.md)

Made with 🥋 and ❤️ by Bob

</div>