# Sistema de Tarifas por Frecuencia Semanal

## 📋 Descripción General

Este sistema permite configurar tarifas mensuales según la frecuencia de asistencia semanal de los alumnos (1x, 2x, 3x, etc. por semana). Las tarifas se aplican automáticamente a todos los alumnos según su frecuencia configurada.

## 🎯 Características Principales

### ✅ Configuración Centralizada
- Configura tarifas por frecuencia desde la página "Configuración de Cuotas"
- Las tarifas se aplican automáticamente a todos los alumnos con esa frecuencia
- Actualiza tarifas para todos los alumnos de una sola vez

### ✅ Prioridad de Cuotas
El sistema utiliza el siguiente orden de prioridad para calcular la cuota de un alumno:

1. **Cuota Personalizada** (StudentSchedule.monthlyFee) - Máxima prioridad
2. **Tarifa por Frecuencia** (FrequencyRate) - Prioridad media
3. **Cuota General** (MonthlyFee) - Fallback

### ✅ Interfaz Intuitiva
- Visualización de tarifas al inscribir alumnos
- Indicadores visuales de tarifas aplicables
- Formulario simple para configurar tarifas

## 🗄️ Estructura de Base de Datos

### Nuevo Modelo: FrequencyRate

```prisma
model FrequencyRate {
  id              String   @id @default(cuid())
  amount          Decimal  @db.Decimal(10, 2)
  weeklyFrequency Int      // 1, 2, 3, 4, 5, 6, 7
  month           Int      // 1-12
  year            Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  
  @@unique([schoolId, year, month, weeklyFrequency])
  @@index([schoolId, year, month])
  @@map("frequency_rates")
}
```

### Campos Existentes Utilizados

- **StudentSchedule.weeklyFrequency**: Frecuencia de asistencia del alumno (1-7)
- **StudentSchedule.monthlyFee**: Cuota personalizada opcional (override)

## 🔧 Implementación Técnica

### 1. API Endpoints

#### GET /api/frequency-rates
Obtiene las tarifas por frecuencia de un mes específico.

**Query Parameters:**
- `year`: Año (default: año actual)
- `month`: Mes 1-12 (default: mes actual)

**Response:**
```json
{
  "year": 2026,
  "month": 3,
  "rates": [
    { "weeklyFrequency": 1, "amount": 6000 },
    { "weeklyFrequency": 2, "amount": 10000 },
    { "weeklyFrequency": 3, "amount": 14000 }
  ]
}
```

#### POST /api/frequency-rates
Crea o actualiza tarifas por frecuencia de un mes.

**Request Body:**
```json
{
  "year": 2026,
  "month": 3,
  "rates": [
    { "weeklyFrequency": 1, "amount": 6000 },
    { "weeklyFrequency": 2, "amount": 10000 },
    { "weeklyFrequency": 3, "amount": 14000 }
  ]
}
```

### 2. Componentes Creados/Modificados

#### Nuevos Componentes:
- `src/components/payments/FrequencyRatesForm.tsx`: Formulario para configurar tarifas

#### Componentes Modificados:
- `src/app/(dashboard)/payments/fees/page.tsx`: Página de configuración de cuotas
- `src/components/schedules/StudentEnrollment.tsx`: Formulario de inscripción
- `src/services/paymentService.ts`: Servicio de pagos

### 3. Lógica de Cálculo de Cuotas

El servicio `paymentService.getStudentDebtDetails()` ahora:

1. Obtiene todas las inscripciones activas del alumno
2. Para cada inscripción, busca en orden:
   - Cuota personalizada (monthlyFee)
   - Tarifa por frecuencia (FrequencyRate)
   - Cuota general (MonthlyFee)
3. Suma todas las cuotas aplicables
4. Calcula la deuda considerando pagos realizados

## 📖 Guía de Uso

### Para Administradores

#### 1. Configurar Tarifas por Frecuencia

1. Ir a **Pagos → Configuración de Cuotas**
2. Seleccionar el mes deseado (o crear uno nuevo)
3. Hacer clic en el ícono de frecuencia (🔄) en la tarjeta del mes
4. Configurar las tarifas para cada frecuencia:
   - 1x por semana: $6,000
   - 2x por semana: $10,000
   - 3x por semana: $14,000
   - etc.
5. Hacer clic en "Guardar Tarifas"

**Nota:** Las tarifas se aplicarán automáticamente a todos los alumnos con esa frecuencia.

#### 2. Inscribir Alumno con Tarifa Automática

1. Ir a **Horarios** → Seleccionar horario
2. Hacer clic en "Inscribir Alumno"
3. Seleccionar alumno
4. Elegir frecuencia semanal
5. **El sistema mostrará automáticamente la tarifa aplicable**
6. Opcionalmente, configurar cuota personalizada si es necesario
7. Guardar

#### 3. Actualizar Tarifas Existentes

1. Ir a **Pagos → Configuración de Cuotas**
2. Seleccionar el mes
3. Hacer clic en el ícono de frecuencia (🔄)
4. Modificar las tarifas
5. Guardar

**Importante:** Al actualizar las tarifas, se aplicarán automáticamente a todos los alumnos con esa frecuencia en el próximo cálculo de deuda.

### Para Profesores

Los profesores pueden:
- Ver las tarifas configuradas
- Inscribir alumnos con las tarifas automáticas
- Configurar cuotas personalizadas cuando sea necesario

## 🔄 Flujo de Trabajo Completo

### Escenario 1: Configuración Inicial

```
1. Admin configura tarifas para Marzo 2026:
   - 1x/semana = $6,000
   - 2x/semana = $10,000
   - 3x/semana = $14,000

2. Admin inscribe alumno Juan:
   - Frecuencia: 2x/semana
   - Sistema aplica automáticamente: $10,000/mes

3. Sistema calcula deuda de Juan:
   - Marzo 2026: $10,000 (según frecuencia)
   - Pagos: $0
   - Deuda: $10,000
```

### Escenario 2: Actualización de Tarifas

```
1. Admin actualiza tarifas para Abril 2026:
   - 2x/semana = $12,000 (antes $10,000)

2. Sistema recalcula automáticamente:
   - Juan (2x/semana): Ahora debe $12,000 en Abril
   - No hay que actualizar alumno por alumno
```

### Escenario 3: Cuota Personalizada

```
1. Admin inscribe alumno María con beca:
   - Frecuencia: 2x/semana
   - Tarifa automática: $10,000
   - Cuota personalizada: $5,000 (50% descuento)

2. Sistema usa cuota personalizada:
   - María paga $5,000/mes (no $10,000)
   - La tarifa por frecuencia no se aplica
```

## 🚀 Pasos para Activar el Sistema

### 1. Reiniciar el Servidor de Desarrollo

El servidor debe reiniciarse para regenerar el cliente de Prisma con el nuevo modelo `FrequencyRate`.

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
cd C:/Users/037901613/Desktop/taekwondo-manager
npx prisma generate
npm run dev
```

### 2. Verificar la Migración

La migración ya fue creada y aplicada:
- `prisma/migrations/20260616151458_add_frequency_rates/`

### 3. Configurar Tarifas Iniciales

1. Acceder a la aplicación
2. Ir a **Pagos → Configuración de Cuotas**
3. Crear cuota general para el mes actual (si no existe)
4. Configurar tarifas por frecuencia

## 🧪 Testing

### Casos de Prueba Recomendados

1. **Configurar tarifas por frecuencia**
   - Crear tarifas para el mes actual
   - Verificar que se guardan correctamente
   - Actualizar tarifas existentes

2. **Inscribir alumno con tarifa automática**
   - Inscribir alumno con frecuencia 2x/semana
   - Verificar que se muestra la tarifa correcta
   - Confirmar que la cuota se aplica automáticamente

3. **Cuota personalizada**
   - Inscribir alumno con cuota personalizada
   - Verificar que tiene prioridad sobre tarifa por frecuencia

4. **Cálculo de deuda**
   - Verificar que la deuda se calcula con la tarifa correcta
   - Probar con múltiples inscripciones
   - Verificar fallback a cuota general

5. **Actualización masiva**
   - Actualizar tarifas de un mes
   - Verificar que afecta a todos los alumnos

## 📊 Ejemplos de Configuración

### Configuración Típica

```
Marzo 2026:
├── 1x/semana: $6,000
├── 2x/semana: $10,000
├── 3x/semana: $14,000
├── 4x/semana: $18,000
└── Cuota General: $15,000 (fallback)
```

### Alumno con Múltiples Inscripciones

```
Alumno: Juan Pérez
Inscripciones:
├── Horario Lunes (2x/semana) → $10,000
└── Horario Miércoles (1x/semana) → $6,000
Total: $16,000/mes
```

### Alumno con Cuota Personalizada

```
Alumno: María García (Beca 50%)
Inscripciones:
└── Horario Martes (2x/semana)
    ├── Tarifa automática: $10,000
    └── Cuota personalizada: $5,000 ✓ (se usa esta)
Total: $5,000/mes
```

## 🔍 Troubleshooting

### Problema: No se muestran las tarifas en el formulario de inscripción

**Solución:**
1. Verificar que existen tarifas configuradas para el mes actual
2. Revisar la consola del navegador para errores
3. Verificar que el endpoint `/api/frequency-rates` responde correctamente

### Problema: Las tarifas no se aplican automáticamente

**Solución:**
1. Verificar que el alumno tiene `weeklyFrequency` configurado
2. Revisar que no tiene `monthlyFee` personalizado (tiene prioridad)
3. Verificar que existe una tarifa para esa frecuencia en ese mes

### Problema: Errores de TypeScript sobre `frequencyRate`

**Solución:**
1. Regenerar el cliente de Prisma: `npx prisma generate`
2. Reiniciar el servidor de desarrollo
3. Reiniciar VS Code si es necesario

## 📝 Notas Importantes

1. **Las tarifas son por mes**: Cada mes puede tener tarifas diferentes
2. **Prioridad de cuotas**: Personalizada > Frecuencia > General
3. **Actualización automática**: Al cambiar tarifas, se aplican a todos los alumnos
4. **Múltiples inscripciones**: Se suman las cuotas de todas las inscripciones activas
5. **Fallback**: Si no hay tarifa por frecuencia, se usa la cuota general

## 🎓 Mejores Prácticas

1. **Configurar tarifas al inicio de cada mes**
2. **Usar cuotas personalizadas solo para casos especiales** (becas, descuentos)
3. **Revisar tarifas antes de inscribir alumnos nuevos**
4. **Documentar cambios de tarifas** en el campo de descripción
5. **Mantener consistencia** en las tarifas entre meses similares

## 🔮 Futuras Mejoras Posibles

- [ ] Historial de cambios de tarifas
- [ ] Copiar tarifas de un mes a otro
- [ ] Plantillas de tarifas
- [ ] Notificaciones de cambios de tarifas
- [ ] Reportes de ingresos por frecuencia
- [ ] Descuentos por múltiples inscripciones
- [ ] Tarifas por rango de edad

---

**Documentación creada:** 16 de Junio de 2026  
**Versión:** 1.0  
**Autor:** Bob (AI Assistant)