# 👤 Guía de Usuario - Taekwondo Manager

Bienvenido a la guía completa de usuario de Taekwondo Manager. Esta guía te enseñará cómo usar todas las funcionalidades del sistema paso a paso.

---

## 📋 Tabla de Contenidos

- [Introducción](#-introducción)
- [Primeros Pasos](#-primeros-pasos)
- [Dashboard Principal](#-dashboard-principal)
- [Gestión de Alumnos](#-gestión-de-alumnos)
- [Gestión de Horarios](#-gestión-de-horarios)
- [Registro de Asistencia](#-registro-de-asistencia)
- [Gestión de Pagos](#-gestión-de-pagos)
- [Configuración](#-configuración)
- [Mejores Prácticas](#-mejores-prácticas)
- [Atajos de Teclado](#-atajos-de-teclado)

---

## 🎯 Introducción

Taekwondo Manager es un sistema completo de gestión diseñado específicamente para escuelas de Taekwondo. Te permite:

- 👥 Administrar información de tus alumnos
- 📅 Organizar horarios de clases
- ✅ Registrar asistencias de forma rápida
- 💰 Gestionar pagos y cuotas mensuales
- 📊 Visualizar estadísticas y reportes

### ¿Para quién es este sistema?

- **Profesores de Taekwondo**: Gestiona tu escuela de forma profesional
- **Administradores**: Controla pagos y asistencias
- **Dueños de escuelas**: Obtén reportes y estadísticas

---

## 🚀 Primeros Pasos

### Acceder al Sistema

1. **Abrir el navegador** y ve a la URL de tu instalación:
   - Desarrollo: `http://localhost:3000`
   - Producción: Tu dominio personalizado

2. **Página de Login**: Verás la pantalla de inicio de sesión

### Iniciar Sesión

#### Si usaste los datos de ejemplo:

**Credenciales de prueba:**
```
Email: juan.perez@taekwondo.com
Password: password123
```

#### Pasos para iniciar sesión:

1. Ingresa tu **email** en el primer campo
2. Ingresa tu **contraseña** en el segundo campo
3. Click en el botón **"Iniciar Sesión"**
4. Serás redirigido al Dashboard

> 💡 **Tip**: El sistema recuerda tu sesión por 30 días. No necesitas iniciar sesión cada vez.

### Cerrar Sesión

1. Click en tu **avatar/nombre** en la esquina superior derecha
2. Selecciona **"Cerrar Sesión"**

---

## 📊 Dashboard Principal

El Dashboard es la pantalla principal que ves al iniciar sesión. Muestra un resumen completo de tu escuela.

### Secciones del Dashboard

#### 1. **Tarjetas de Estadísticas** (Parte Superior)

Muestra métricas clave en tiempo real:

| Métrica | Descripción |
|---------|-------------|
| **Total Alumnos** | Cantidad total de alumnos (activos e inactivos) |
| **Horarios Activos** | Número de clases configuradas |
| **Asistencia del Mes** | Porcentaje de asistencia del mes actual |
| **Recaudación Mensual** | Total recaudado en el mes actual |
| **Alumnos al Día** | Cantidad de alumnos sin deudas |
| **Alumnos con Deuda** | Cantidad de alumnos que deben pagos |

#### 2. **Acciones Rápidas**

Botones para acceder rápidamente a las funciones más usadas:

- ➕ **Nuevo Alumno**: Registrar un alumno nuevo
- 📅 **Nuevo Horario**: Crear un horario de clase
- ✅ **Registrar Asistencia**: Marcar asistencia del día
- 💰 **Registrar Pago**: Registrar un pago recibido

#### 3. **Gráfico de Asistencia**

Muestra la tendencia de asistencia de los últimos 7 días:
- Barras azules: Total de asistencias por día
- Línea verde: Porcentaje de asistencia

#### 4. **Distribución por Cinturón**

Gráfico circular que muestra:
- Cantidad de alumnos por cada cinturón
- Porcentaje de cada categoría
- Colores distintivos por cinturón

#### 5. **Alertas de Pagos**

Lista de alumnos con pagos pendientes:
- Nombre del alumno
- Cinturón actual
- Monto total de deuda
- Meses adeudados
- Fecha del último pago

> 🔴 **Importante**: Los alumnos con más deuda aparecen primero.

#### 6. **Clases Próximas**

Muestra las clases de hoy y mañana:
- Nombre de la clase
- Día y horario
- Cantidad de alumnos inscritos
- Estado de asistencia (si ya se marcó)

#### 7. **Actividad Reciente**

Últimas 10 actividades en el sistema:
- 👤 Nuevos alumnos registrados
- 💰 Pagos recibidos
- ✅ Asistencias marcadas

---

## 👥 Gestión de Alumnos

La gestión de alumnos es el corazón del sistema. Aquí administras toda la información de tus estudiantes.

### Ver Lista de Alumnos

1. Click en **"Alumnos"** en el menú lateral
2. Verás una tabla con todos los alumnos

**Información mostrada:**
- Nombre completo
- Email
- Teléfono
- Cinturón actual
- Estado (Activo/Inactivo)
- Acciones disponibles

### Buscar y Filtrar Alumnos

#### Búsqueda por Texto
1. Usa la barra de búsqueda en la parte superior
2. Escribe nombre, email o teléfono
3. Los resultados se filtran automáticamente

#### Filtrar por Estado
- **Todos**: Muestra todos los alumnos
- **Activos**: Solo alumnos activos
- **Inactivos**: Solo alumnos inactivos

#### Filtrar por Cinturón
- Selecciona un cinturón específico del dropdown
- Muestra solo alumnos con ese cinturón

### Agregar Nuevo Alumno

1. Click en el botón **"+ Nuevo Alumno"**
2. Se abre un formulario con los siguientes campos:

#### Información Personal (Obligatoria)
- **Nombre**: Primer nombre del alumno
- **Apellido**: Apellido del alumno
- **Fecha de Nacimiento**: Selecciona del calendario

#### Información de Contacto (Opcional)
- **Email**: Correo electrónico
- **Teléfono**: Número de contacto
- **Dirección**: Dirección completa

#### Información de Taekwondo
- **Cinturón**: Selecciona el cinturón actual
  - Blanco (principiante)
  - Amarillo
  - Verde
  - Azul
  - Rojo
  - Negro (y grados Dan)

#### Contacto de Emergencia (Recomendado)
- **Nombre del Contacto**: Persona a contactar en emergencias
- **Teléfono de Emergencia**: Número de contacto

#### Notas Adicionales
- Campo de texto libre para cualquier información relevante
- Alergias, condiciones médicas, observaciones, etc.

3. Click en **"Guardar"** para crear el alumno
4. El alumno aparecerá en la lista

> ✅ **Validación**: El sistema valida que nombre y apellido no estén vacíos.

### Ver Detalles de un Alumno

1. Click en el nombre del alumno o en el botón **"Ver"**
2. Se abre la página de detalles con 4 pestañas:

#### Pestaña: Información General
- Todos los datos personales del alumno
- Fecha de registro
- Estado actual
- Botón para editar información

#### Pestaña: Horarios
- Lista de horarios en los que está inscrito
- Día de la semana y horario
- Opción para desinscribir

#### Pestaña: Asistencia
- Calendario visual de asistencias
- Estadísticas:
  - Total de asistencias
  - Porcentaje de asistencia
  - Racha actual
  - Racha más larga
- Historial detallado por fecha

#### Pestaña: Pagos
- Estado de cuenta actual
- Deuda total (si existe)
- Meses adeudados
- Historial de pagos:
  - Fecha de pago
  - Monto
  - Mes/año pagado
  - Método de pago
- Botón para registrar nuevo pago

### Editar Alumno

1. En la página de detalles, click en **"Editar"**
2. Modifica los campos necesarios
3. Click en **"Guardar Cambios"**

> 💡 **Tip**: Puedes cambiar el cinturón cuando el alumno avance de grado.

### Activar/Desactivar Alumno

**¿Cuándo desactivar un alumno?**
- Cuando deja de asistir temporalmente
- Cuando se da de baja definitivamente
- Para mantener el historial sin que aparezca en listas activas

**Cómo hacerlo:**
1. En la página de detalles del alumno
2. Toggle del switch **"Activo"**
3. El cambio es inmediato

> ⚠️ **Nota**: Los alumnos inactivos no aparecen en el registro de asistencia ni en alertas de pagos.

---

## 📅 Gestión de Horarios

Los horarios representan las clases semanales de tu escuela.

### Ver Horarios

1. Click en **"Horarios"** en el menú lateral
2. Verás dos vistas:
   - **Vista de Lista**: Tabla con todos los horarios
   - **Vista de Calendario**: Calendario semanal visual

### Crear Nuevo Horario

1. Click en **"+ Nuevo Horario"**
2. Completa el formulario:

#### Información del Horario
- **Nombre de la Clase**: Ej: "Niños Principiantes", "Adultos Avanzados"
- **Día de la Semana**: Selecciona el día
  - Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo
- **Hora de Inicio**: Formato 24 horas (Ej: 17:00)
- **Hora de Fin**: Formato 24 horas (Ej: 18:30)
- **Capacidad Máxima**: Número máximo de alumnos (opcional)

3. Click en **"Crear Horario"**

> 💡 **Tip**: Puedes crear múltiples horarios para el mismo día.

### Ver Detalles de un Horario

1. Click en el nombre del horario
2. Verás:
   - Información completa del horario
   - Lista de alumnos inscritos
   - Botón para inscribir más alumnos
   - Botón para editar horario
   - Botón para eliminar horario

### Inscribir Alumnos en un Horario

**Método 1: Desde el horario**
1. En la página de detalles del horario
2. Click en **"Inscribir Alumno"**
3. Selecciona el alumno del dropdown
4. Click en **"Inscribir"**

**Método 2: Desde el alumno**
1. En la página de detalles del alumno
2. Pestaña "Horarios"
3. Click en **"Inscribir en Horario"**
4. Selecciona el horario
5. Click en **"Inscribir"**

> ⚠️ **Validación**: No puedes inscribir un alumno dos veces en el mismo horario.

### Desinscribir Alumno de un Horario

1. En la lista de alumnos inscritos
2. Click en el botón **"Desinscribir"** (ícono de X)
3. Confirma la acción

### Editar Horario

1. En la página de detalles del horario
2. Click en **"Editar"**
3. Modifica los campos necesarios
4. Click en **"Guardar Cambios"**

### Eliminar Horario

1. En la página de detalles del horario
2. Click en **"Eliminar Horario"**
3. Confirma la acción

> ⚠️ **Advertencia**: Eliminar un horario también elimina todas las inscripciones y asistencias asociadas.

---

## ✅ Registro de Asistencia

El registro de asistencia es rápido y eficiente.

### Marcar Asistencia del Día

#### Método 1: Registro Rápido (Recomendado)

1. Click en **"Asistencia"** en el menú lateral
2. Selecciona la **fecha** (por defecto es hoy)
3. Selecciona el **horario/clase**
4. Aparece la lista de alumnos inscritos en ese horario
5. Marca cada alumno como:
   - ✅ **Presente** (check verde)
   - ❌ **Ausente** (X roja)
6. Opcionalmente agrega notas para cada alumno
7. Click en **"Guardar Asistencia"**

> 💡 **Tip**: Por defecto todos están marcados como presentes. Solo desmarca los ausentes.

#### Método 2: Registro Individual

1. Desde la página de detalles del alumno
2. Pestaña "Asistencia"
3. Click en **"Registrar Asistencia"**
4. Selecciona fecha y horario
5. Marca presente/ausente
6. Guarda

### Ver Historial de Asistencia

#### Por Horario
1. **Asistencia** → **Historial**
2. Selecciona el horario
3. Selecciona el rango de fechas
4. Verás una tabla con:
   - Fecha
   - Alumnos presentes
   - Alumnos ausentes
   - Porcentaje de asistencia

#### Por Alumno
1. Página de detalles del alumno
2. Pestaña "Asistencia"
3. Verás:
   - Calendario visual (días con asistencia marcados)
   - Estadísticas generales
   - Lista detallada por fecha

### Calendario de Asistencia

El calendario visual muestra:
- 🟢 **Verde**: Día con asistencia presente
- 🔴 **Rojo**: Día con asistencia ausente
- ⚪ **Blanco**: Día sin registro

### Estadísticas de Asistencia

Para cada alumno se calculan:
- **Total de Asistencias**: Cantidad de veces que asistió
- **Porcentaje de Asistencia**: (Presentes / Total) × 100
- **Racha Actual**: Días consecutivos asistiendo
- **Racha Más Larga**: Máxima racha de asistencia

### Editar Asistencia

1. En el historial de asistencia
2. Click en el registro que quieres editar
3. Modifica presente/ausente
4. Guarda los cambios

> ⚠️ **Nota**: Cambiar la asistencia puede afectar el cálculo de deudas de pagos.

---

## 💰 Gestión de Pagos

El sistema de pagos es **inteligente** y solo cobra meses donde el alumno asistió.

### Entender el Sistema de Pagos

#### 🎯 Lógica Inteligente de Pagos

**Regla Principal**: Solo se genera deuda para meses donde el alumno asistió al menos una vez.

**Ejemplo Práctico:**

```
Cuota mensual: $10,000

Enero:
- Alumno asiste 8 veces → ✅ Debe $10,000

Febrero:
- Alumno NO asiste ninguna vez → ❌ NO debe nada

Marzo:
- Alumno asiste 1 vez → ✅ Debe $10,000

Deuda Total: $20,000 (solo Enero y Marzo)
```

**¿Por qué es inteligente?**
- ✅ Justo para el alumno (no paga si no asiste)
- ✅ Justo para la escuela (cobra por servicio prestado)
- ✅ Automático (no necesitas calcular manualmente)
- ✅ Transparente (el alumno ve exactamente qué debe)

### Configurar Cuotas Mensuales

Las cuotas se configuran por mes y año.

1. Click en **"Pagos"** → **"Configurar Cuotas"**
2. Click en **"+ Nueva Cuota"**
3. Completa:
   - **Mes**: Selecciona el mes
   - **Año**: Selecciona el año
   - **Monto**: Ingresa el valor de la cuota
   - **Descripción**: (Opcional) Ej: "Cuota regular", "Cuota con descuento"
4. Click en **"Guardar"**

> 💡 **Tip**: Configura las cuotas al inicio de cada mes.

#### Modificar Cuota Existente

1. En la lista de cuotas
2. Click en **"Editar"**
3. Modifica el monto
4. Guarda

> ⚠️ **Nota**: Cambiar una cuota afecta el cálculo de deudas de todos los alumnos para ese mes.

### Registrar un Pago

#### Método 1: Desde Pagos

1. Click en **"Pagos"** en el menú lateral
2. Click en **"+ Registrar Pago"**
3. Completa el formulario:
   - **Alumno**: Selecciona el alumno
   - **Mes**: Mes que está pagando
   - **Año**: Año correspondiente
   - **Monto**: Cantidad pagada
   - **Fecha de Pago**: Fecha en que se recibió el pago
   - **Método de Pago**: Efectivo, Transferencia, Tarjeta, etc.
   - **Notas**: (Opcional) Observaciones
4. Click en **"Registrar Pago"**

#### Método 2: Desde el Alumno

1. Página de detalles del alumno
2. Pestaña "Pagos"
3. Click en **"Registrar Pago"**
4. Completa el formulario
5. Guarda

### Ver Estado de Pagos

#### Vista General (Todos los Alumnos)

1. **Pagos** → **Estado de Pagos**
2. Verás una tabla con:
   - Nombre del alumno
   - Cinturón
   - Deuda total
   - Meses adeudados
   - Último pago
   - Estado:
     - 🟢 **Al día**: Sin deudas
     - 🟡 **Parcial**: Debe 1 mes
     - 🔴 **Atrasado**: Debe 2+ meses

#### Vista Individual (Por Alumno)

1. Página de detalles del alumno
2. Pestaña "Pagos"
3. Verás:
   - **Deuda Total**: Monto total adeudado
   - **Meses Adeudados**: Lista de meses que debe
   - **Historial de Pagos**: Todos los pagos realizados

### Entender el Cálculo de Deudas

El sistema calcula automáticamente:

1. **Revisa cada mes** desde que el alumno se inscribió hasta hoy
2. **Verifica si asistió** al menos una vez en ese mes
3. **Si asistió**:
   - Busca la cuota configurada para ese mes
   - Busca los pagos realizados para ese mes
   - Calcula: Deuda = Cuota - Pagos
4. **Si NO asistió**: No genera deuda

**Ejemplo Detallado:**

```
Alumno: Juan Pérez
Inscripción: Enero 2024
Cuota: $10,000/mes

Enero 2024:
- Asistencias: 8 veces ✅
- Cuota: $10,000
- Pagos: $10,000
- Deuda: $0 ✅

Febrero 2024:
- Asistencias: 0 veces ❌
- Cuota: $10,000
- Pagos: $0
- Deuda: $0 (no asistió, no se cobra) ✅

Marzo 2024:
- Asistencias: 5 veces ✅
- Cuota: $10,000
- Pagos: $5,000
- Deuda: $5,000 ⚠️

Abril 2024:
- Asistencias: 10 veces ✅
- Cuota: $10,000
- Pagos: $0
- Deuda: $10,000 ⚠️

DEUDA TOTAL: $15,000 (Marzo + Abril)
```

### Pagos Parciales

El sistema permite pagos parciales:

**Ejemplo:**
- Cuota de Marzo: $10,000
- Alumno paga: $5,000
- Deuda restante: $5,000

Puedes registrar múltiples pagos para el mismo mes hasta completar la cuota.

### Historial de Pagos

Cada pago registrado muestra:
- Fecha del pago
- Monto pagado
- Mes/año al que corresponde
- Método de pago
- Notas adicionales

### Reportes de Pagos

#### Reporte Mensual

1. **Pagos** → **Reportes**
2. Selecciona el mes y año
3. Verás:
   - Total recaudado
   - Cantidad de pagos
   - Alumnos que pagaron
   - Alumnos que no pagaron

#### Reporte Anual

1. Selecciona el año
2. Verás:
   - Recaudación por mes
   - Gráfico de tendencia
   - Total anual

---

## ⚙️ Configuración

### Configuración de Perfil

1. Click en tu avatar/nombre
2. Selecciona **"Configuración"**
3. Puedes modificar:
   - Nombre
   - Email
   - Contraseña

### Configuración de la Escuela

1. **Configuración** → **"Mi Escuela"**
2. Edita:
   - Nombre de la escuela
   - Dirección
   - Teléfono
   - Descripción

---

## 💡 Mejores Prácticas

### Para Registro de Asistencia

✅ **Recomendaciones:**
- Marca la asistencia el mismo día de la clase
- Usa el registro rápido para ahorrar tiempo
- Agrega notas si un alumno llegó tarde o se fue temprano
- Revisa el historial semanalmente

❌ **Evita:**
- Registrar asistencia con mucho retraso
- Olvidar marcar ausencias
- No revisar el calendario mensual

### Para Gestión de Pagos

✅ **Recomendaciones:**
- Configura las cuotas al inicio de cada mes
- Registra los pagos el mismo día que los recibes
- Usa el campo de notas para detalles importantes
- Revisa el estado de pagos semanalmente
- Envía recordatorios a alumnos con deuda

❌ **Evita:**
- Olvidar configurar la cuota mensual
- Registrar pagos sin especificar el mes correcto
- No hacer seguimiento de deudas

### Para Gestión de Alumnos

✅ **Recomendaciones:**
- Completa toda la información al registrar un alumno
- Actualiza el cinturón cuando el alumno avance
- Mantén actualizada la información de contacto
- Desactiva alumnos que ya no asisten (no los elimines)
- Usa el campo de notas para información importante

❌ **Evita:**
- Eliminar alumnos (mejor desactívalos)
- Dejar campos importantes vacíos
- No actualizar el progreso del alumno

### Para Gestión de Horarios

✅ **Recomendaciones:**
- Usa nombres descriptivos para las clases
- Configura la capacidad máxima si es necesario
- Revisa regularmente la lista de inscritos
- Mantén los horarios actualizados

❌ **Evita:**
- Crear horarios duplicados
- Eliminar horarios con historial (mejor desactívalos)
- Inscribir más alumnos que la capacidad

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + K` | Búsqueda rápida |
| `Ctrl + N` | Nuevo alumno |
| `Ctrl + H` | Ir a horarios |
| `Ctrl + A` | Ir a asistencia |
| `Ctrl + P` | Ir a pagos |
| `Esc` | Cerrar modal/diálogo |

> 💡 **Tip**: En Mac, usa `Cmd` en lugar de `Ctrl`.

---

## 📱 Uso en Dispositivos Móviles

El sistema es completamente responsive y funciona en:
- 📱 Smartphones (iOS y Android)
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

### Consejos para Móvil

- Usa el menú hamburguesa (☰) para navegar
- El registro de asistencia es táctil y fácil de usar
- Puedes registrar pagos desde tu teléfono
- Las estadísticas se adaptan a pantallas pequeñas

---

## 🆘 Obtener Ayuda

Si tienes dudas o problemas:

1. 📚 Consulta esta guía
2. ❓ Revisa el [FAQ](FAQ.md)
3. 🔧 Consulta la [Documentación Técnica](TECHNICAL.md)
4. 💬 Contacta al soporte técnico

---

## 📝 Glosario

| Término | Definición |
|---------|------------|
| **Alumno Activo** | Alumno que actualmente asiste a clases |
| **Alumno Inactivo** | Alumno que dejó de asistir pero mantiene su historial |
| **Horario** | Clase semanal recurrente (ej: Lunes 17:00) |
| **Inscripción** | Relación entre un alumno y un horario |
| **Asistencia** | Registro de presencia/ausencia en una clase específica |
| **Cuota Mensual** | Monto a pagar por mes de clases |
| **Deuda** | Monto pendiente de pago |
| **Racha** | Días consecutivos de asistencia |

---

## ✅ Checklist de Uso Diario

Usa esta lista para tu rutina diaria:

**Al inicio del día:**
- [ ] Revisar clases del día en el dashboard
- [ ] Verificar alumnos inscritos en cada clase

**Durante/después de cada clase:**
- [ ] Registrar asistencia de la clase
- [ ] Agregar notas si es necesario

**Al recibir un pago:**
- [ ] Registrar el pago inmediatamente
- [ ] Verificar que se aplicó al mes correcto

**Semanalmente:**
- [ ] Revisar estado de pagos
- [ ] Enviar recordatorios de deuda
- [ ] Revisar estadísticas de asistencia

**Mensualmente:**
- [ ] Configurar cuota del nuevo mes
- [ ] Generar reporte mensual
- [ ] Revisar alumnos inactivos

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-usuario---taekwondo-manager)**

¿Necesitas más ayuda? Consulta el [FAQ](FAQ.md) o la [Documentación Técnica](TECHNICAL.md)

Made with 🥋 for Taekwondo Schools

</div>