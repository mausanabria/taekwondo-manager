# ❓ FAQ - Preguntas Frecuentes

Respuestas a las preguntas más comunes sobre Taekwondo Manager.

---

## 📋 Tabla de Contenidos

- [Preguntas Generales](#-preguntas-generales)
- [Sistema de Pagos](#-sistema-de-pagos)
- [Gestión de Alumnos](#-gestión-de-alumnos)
- [Asistencia](#-asistencia)
- [Problemas Técnicos](#-problemas-técnicos)
- [Seguridad](#-seguridad)
- [Despliegue](#-despliegue)

---

## 🎯 Preguntas Generales

### ¿Qué es Taekwondo Manager?

Taekwondo Manager es un sistema completo de gestión para escuelas de Taekwondo que permite administrar alumnos, horarios, asistencias y pagos de forma eficiente.

### ¿Es gratuito?

El código es privado. Consulta con el administrador del proyecto sobre licencias y uso.

### ¿Funciona en dispositivos móviles?

Sí, la aplicación es completamente responsive y funciona en smartphones, tablets y computadoras.

### ¿Necesito conocimientos técnicos para usarlo?

No. La interfaz está diseñada para ser intuitiva. Solo necesitas conocimientos técnicos para la instalación inicial.

### ¿Puedo gestionar múltiples escuelas?

Sí, un usuario puede tener múltiples escuelas asociadas.

### ¿Está disponible en otros idiomas?

Actualmente solo en español. El soporte multi-idioma está en el roadmap.

---

## 💰 Sistema de Pagos

### ¿Cómo funciona el sistema de pagos inteligente?

El sistema solo genera deuda para meses donde el alumno asistió al menos una vez. Si un alumno no asiste en todo el mes, no se le cobra ese mes.

**Ejemplo:**
```
Enero: Asiste 10 veces → Debe $10,000
Febrero: NO asiste → Debe $0 (no se cobra)
Marzo: Asiste 5 veces → Debe $10,000
Total: $20,000 (solo Enero y Marzo)
```

### ¿Qué pasa si un alumno no asiste en todo el mes?

No se genera deuda para ese mes. El sistema es justo: solo cobra por el servicio prestado.

### ¿Puedo hacer pagos parciales?

Sí, puedes registrar múltiples pagos para el mismo mes hasta completar la cuota.

### ¿Cómo cambio la cuota mensual?

Ve a **Pagos** → **Configurar Cuotas** → **Nueva Cuota** o edita una existente.

### ¿La cuota es la misma para todos los alumnos?

Sí, la cuota se configura por mes/año para toda la escuela. Todos los alumnos activos tienen la misma cuota.

### ¿Puedo ver el historial de pagos de un alumno?

Sí, en la página de detalles del alumno, pestaña "Pagos".

### ¿Cómo sé qué alumnos deben pagos?

El dashboard muestra alertas de pagos pendientes. También puedes ir a **Pagos** → **Estado de Pagos**.

### ¿Puedo eliminar un pago registrado por error?

Actualmente no hay función de eliminar pagos en la UI. Contacta al administrador técnico.

---

## 👥 Gestión de Alumnos

### ¿Cuántos alumnos puedo registrar?

No hay límite en el sistema. El límite depende de tu plan de base de datos.

### ¿Qué información debo registrar de cada alumno?

**Obligatorio**: Nombre y apellido
**Recomendado**: Email, teléfono, fecha de nacimiento, cinturón, contacto de emergencia

### ¿Puedo eliminar un alumno?

Sí, pero **no es recomendado**. Es mejor desactivarlo para mantener el historial.

### ¿Qué pasa cuando desactivo un alumno?

- No aparece en listas de alumnos activos
- No aparece en registro de asistencia
- No genera alertas de pagos
- Se mantiene todo su historial

### ¿Puedo reactivar un alumno desactivado?

Sí, simplemente activa el toggle "Activo" en su página de detalles.

### ¿Cómo cambio el cinturón de un alumno?

Edita el alumno y selecciona el nuevo cinturón en el campo correspondiente.

### ¿Puedo buscar alumnos?

Sí, usa la barra de búsqueda en la lista de alumnos. Busca por nombre, email o teléfono.

---

## ✅ Asistencia

### ¿Cómo registro la asistencia?

**Método rápido**:
1. Ve a **Asistencia**
2. Selecciona fecha y horario
3. Marca presente/ausente para cada alumno
4. Guarda

### ¿Puedo registrar asistencia de días pasados?

Sí, selecciona la fecha deseada en el calendario.

### ¿Puedo editar una asistencia ya registrada?

Sí, ve al historial de asistencia y edita el registro.

### ¿Qué pasa si olvido registrar la asistencia?

Puedes registrarla después seleccionando la fecha correcta. Sin embargo, afecta el cálculo de deudas si ya pasó el mes.

### ¿Cómo veo el historial de asistencia de un alumno?

En la página de detalles del alumno, pestaña "Asistencia".

### ¿Qué es la "racha" de asistencia?

Es la cantidad de días consecutivos que un alumno ha asistido. Motiva a mantener la constancia.

### ¿Puedo agregar notas a una asistencia?

Sí, hay un campo de notas opcional al registrar asistencia.

---

## 🔧 Problemas Técnicos

### No puedo iniciar sesión

**Soluciones**:
1. Verifica que el email y contraseña sean correctos
2. Verifica que tu cuenta esté activa
3. Limpia caché del navegador
4. Intenta en modo incógnito
5. Verifica que el servidor esté corriendo

### La página está en blanco

**Soluciones**:
1. Refresca la página (F5 o Ctrl+R)
2. Limpia caché del navegador
3. Verifica la consola del navegador (F12)
4. Verifica que el servidor esté corriendo

### Error: "Cannot connect to database"

**Soluciones**:
1. Verifica que PostgreSQL esté corriendo
2. Verifica `DATABASE_URL` en `.env`
3. Verifica credenciales de base de datos
4. Verifica que la base de datos exista

### Error: "Prisma Client not generated"

**Solución**:
```bash
npx prisma generate
```

### Error: "Port 3000 already in use"

**Soluciones**:
```bash
# Opción 1: Usar otro puerto
PORT=3001 npm run dev

# Opción 2: Matar proceso en puerto 3000
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### La aplicación está muy lenta

**Soluciones**:
1. Verifica tu conexión a internet
2. Verifica que la base de datos no esté sobrecargada
3. Limpia caché del navegador
4. Verifica logs del servidor
5. Considera optimizar queries de base de datos

### Error 500 en API

**Soluciones**:
1. Verifica logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que la base de datos esté accesible
4. Verifica que las migraciones estén aplicadas

### No se muestran los datos

**Soluciones**:
1. Verifica que haya datos en la base de datos
2. Verifica la consola del navegador (F12)
3. Verifica que el usuario tenga una escuela asociada
4. Refresca la página

---

## 🔐 Seguridad

### ¿Las contraseñas están seguras?

Sí, las contraseñas se hashean con bcrypt antes de almacenarse. Nunca se guardan en texto plano.

### ¿Puedo cambiar mi contraseña?

Sí, ve a **Configuración** → **Perfil** → **Cambiar Contraseña**.

### ¿Qué pasa si olvido mi contraseña?

Actualmente no hay función de recuperación automática. Contacta al administrador.

### ¿Los datos están encriptados?

- Contraseñas: Sí (bcrypt)
- Datos en tránsito: Sí (HTTPS en producción)
- Datos en base de datos: Depende de la configuración de PostgreSQL

### ¿Quién puede ver mis datos?

Solo tú y los usuarios de tu escuela. Cada escuela tiene sus datos aislados.

### ¿Puedo hacer backup de mis datos?

Sí, consulta la [Guía de Despliegue](DEPLOYMENT.md#backup-y-recuperación) para instrucciones.

---

## 🚀 Despliegue

### ¿Dónde puedo desplegar la aplicación?

Opciones recomendadas:
- **Vercel** (mejor para Next.js)
- **Railway** (incluye PostgreSQL)
- **Render** (incluye PostgreSQL)
- **VPS** (DigitalOcean, AWS, etc.)

Consulta la [Guía de Despliegue](DEPLOYMENT.md) completa.

### ¿Necesito un dominio propio?

No es obligatorio. Los servicios de hosting proveen subdominios gratuitos. Un dominio propio es opcional.

### ¿Cuánto cuesta el hosting?

- **Vercel**: Plan gratuito disponible
- **Railway**: $5/mes de crédito gratis
- **Render**: Plan gratuito disponible
- **VPS**: Desde $5/mes

### ¿Cómo actualizo la aplicación en producción?

Depende del servicio:
- **Vercel/Railway/Render**: Push a Git y se despliega automáticamente
- **VPS**: SSH al servidor, pull de Git, rebuild

### ¿Necesito SSL/HTTPS?

Sí, es obligatorio para producción. Vercel, Railway y Render lo incluyen automáticamente.

---

## 🐛 Reportar Problemas

### ¿Cómo reporto un bug?

1. Verifica que no esté ya reportado
2. Incluye:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Logs de error
   - Versión del sistema
3. Contacta al equipo de desarrollo

### ¿Cómo solicito una nueva funcionalidad?

1. Describe la funcionalidad deseada
2. Explica el caso de uso
3. Proporciona ejemplos si es posible
4. Contacta al equipo de desarrollo

---

## 💡 Tips y Trucos

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + K` | Búsqueda rápida |
| `Ctrl + N` | Nuevo alumno |
| `Esc` | Cerrar modal |

### Mejores Prácticas

1. **Registra asistencia el mismo día** de la clase
2. **Configura cuotas al inicio** de cada mes
3. **Registra pagos inmediatamente** al recibirlos
4. **Desactiva alumnos** en lugar de eliminarlos
5. **Revisa alertas de pagos** semanalmente
6. **Haz backup** de la base de datos regularmente

### Flujo de Trabajo Recomendado

**Diario**:
- Registrar asistencia de clases del día
- Registrar pagos recibidos

**Semanal**:
- Revisar estado de pagos
- Enviar recordatorios de deuda
- Revisar estadísticas de asistencia

**Mensual**:
- Configurar cuota del nuevo mes
- Generar reporte mensual
- Revisar alumnos inactivos

---

## 📞 Soporte

### ¿Dónde puedo obtener ayuda?

1. 📚 Consulta esta documentación
2. 📖 Lee la [Guía de Usuario](USER_GUIDE.md)
3. 🔧 Revisa la [Documentación Técnica](TECHNICAL.md)
4. 💬 Contacta al equipo de soporte

### ¿Hay tutoriales en video?

Actualmente no, pero está en el roadmap.

### ¿Ofrecen capacitación?

Consulta con el administrador del proyecto sobre opciones de capacitación.

---

## 🔄 Actualizaciones

### ¿Con qué frecuencia se actualiza?

Consulta el [CHANGELOG](../CHANGELOG.md) para ver el historial de versiones.

### ¿Cómo sé si hay una nueva versión?

Las actualizaciones se anunciarán a través de los canales oficiales.

### ¿Las actualizaciones son automáticas?

Depende de tu método de despliegue:
- **Vercel/Railway/Render**: Automáticas con cada push
- **VPS**: Manuales

---

## 📚 Recursos Adicionales

### Documentación

- [README Principal](../README.md)
- [Guía de Instalación](INSTALLATION.md)
- [Guía de Usuario](USER_GUIDE.md)
- [Documentación Técnica](TECHNICAL.md)
- [Guía de Despliegue](DEPLOYMENT.md)
- [Guía de Desarrollo](DEVELOPMENT.md)

### Enlaces Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## ❓ ¿No encuentras tu pregunta?

Si tu pregunta no está aquí:

1. Busca en la documentación completa
2. Revisa los issues del repositorio (si aplica)
3. Contacta al equipo de soporte
4. Sugiere agregar tu pregunta a este FAQ

---

<div align="center">

**[⬆ Volver arriba](#-faq---preguntas-frecuentes)**

¿Más preguntas? Consulta la [documentación completa](../README.md#-documentación)

Made with 🥋 to help you

</div>