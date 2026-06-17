# 📦 Guía de Instalación - Taekwondo Manager

Esta guía te llevará paso a paso por el proceso de instalación y configuración del sistema Taekwondo Manager en tu entorno local.

---

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#-requisitos-del-sistema)
- [Instalación Paso a Paso](#-instalación-paso-a-paso)
- [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
- [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
- [Verificación de la Instalación](#-verificación-de-la-instalación)
- [Datos de Ejemplo](#-datos-de-ejemplo)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🖥️ Requisitos del Sistema

Antes de comenzar, asegúrate de tener instalado lo siguiente:

### Software Requerido

| Software | Versión Mínima | Recomendada | Descarga |
|----------|----------------|-------------|----------|
| **Node.js** | 18.x | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x | 10.x | Incluido con Node.js |
| **PostgreSQL** | 14.x | 15.x o 16.x | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | 2.x | Última | [git-scm.com](https://git-scm.com/) |

### Sistemas Operativos Soportados

- ✅ Windows 10/11
- ✅ macOS 11 (Big Sur) o superior
- ✅ Linux (Ubuntu 20.04+, Debian 11+, Fedora 35+)

### Requisitos de Hardware

- **RAM**: Mínimo 4GB (Recomendado 8GB)
- **Disco**: Mínimo 500MB libres
- **Procesador**: Cualquier procesador moderno de 64 bits

---

## 🚀 Instalación Paso a Paso

### Paso 1: Verificar Instalaciones Previas

Abre una terminal y verifica que tienes las versiones correctas:

```bash
# Verificar Node.js
node --version
# Debe mostrar v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar 9.x.x o superior

# Verificar PostgreSQL
psql --version
# Debe mostrar 14.x o superior

# Verificar Git
git --version
# Debe mostrar 2.x.x o superior
```

> ⚠️ **Si algún comando falla**, instala el software correspondiente antes de continuar.

---

### Paso 2: Clonar el Repositorio

```bash
# Opción 1: Clonar desde Git (si tienes acceso al repositorio)
git clone <repository-url>
cd taekwondo-manager

# Opción 2: Descargar y extraer el archivo ZIP
# Descarga el proyecto y extráelo
cd taekwondo-manager
```

---

### Paso 3: Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Esto puede tomar 2-5 minutos dependiendo de tu conexión
```

**¿Qué se instala?**
- Next.js 14 y React 18
- Prisma ORM y cliente de PostgreSQL
- NextAuth.js para autenticación
- Tailwind CSS y componentes UI
- Todas las dependencias necesarias

> 💡 **Tip**: Si prefieres usar `yarn`, ejecuta `yarn install` en su lugar.

---

### Paso 4: Configurar Variables de Entorno

#### 4.1. Crear archivo .env

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# En Windows (PowerShell):
copy .env.example .env
```

#### 4.2. Editar el archivo .env

Abre el archivo `.env` con tu editor de texto favorito y configura las siguientes variables:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taekwondo_db?schema=public"

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"

# ============================================
# APP CONFIGURATION
# ============================================
NODE_ENV="development"
```

#### 4.3. Generar NEXTAUTH_SECRET

El `NEXTAUTH_SECRET` debe ser una cadena aleatoria segura. Genera una con:

```bash
# En Linux/macOS:
openssl rand -base64 32

# En Windows (PowerShell):
# Instala OpenSSL o usa este comando de Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET`.

---

## 🗄️ Configuración de la Base de Datos

### Paso 5: Crear la Base de Datos PostgreSQL

#### Opción A: Usando pgAdmin (Interfaz Gráfica)

1. Abre **pgAdmin**
2. Conéctate a tu servidor PostgreSQL
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `taekwondo_db`
5. Owner: tu usuario de PostgreSQL
6. Click "Save"

#### Opción B: Usando la Terminal (psql)

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Dentro de psql, ejecutar:
CREATE DATABASE taekwondo_db;

# Verificar que se creó
\l

# Salir de psql
\q
```

#### Opción C: Usando un Script SQL

Crea un archivo `create_db.sql`:

```sql
-- create_db.sql
CREATE DATABASE taekwondo_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

Ejecuta:

```bash
psql -U postgres -f create_db.sql
```

---

### Paso 6: Configurar la URL de Conexión

Edita `DATABASE_URL` en tu archivo `.env`:

```env
# Formato:
# postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB?schema=public

# Ejemplo con valores por defecto:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taekwondo_db?schema=public"

# Ejemplo con contraseña personalizada:
DATABASE_URL="postgresql://postgres:miContraseña123@localhost:5432/taekwondo_db?schema=public"
```

**Componentes de la URL:**
- `postgres` (primer): Usuario de PostgreSQL
- `postgres` (segundo): Contraseña del usuario
- `localhost`: Host (servidor local)
- `5432`: Puerto (por defecto de PostgreSQL)
- `taekwondo_db`: Nombre de la base de datos

> ⚠️ **Importante**: Si tu contraseña contiene caracteres especiales (@, :, /, etc.), debes codificarlos en URL. Por ejemplo, `@` se convierte en `%40`.

---

### Paso 7: Ejecutar Migraciones de Prisma

Las migraciones crean todas las tablas necesarias en la base de datos.

```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Esto hará:
# 1. Leer el schema.prisma
# 2. Crear todas las tablas en PostgreSQL
# 3. Generar el cliente de Prisma
```

**Salida esperada:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "taekwondo_db"

Applying migration `20240101000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

---

### Paso 8: Generar el Cliente de Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate
```

Este comando genera el cliente TypeScript que usarás para interactuar con la base de datos.

---

### Paso 9: (Opcional) Cargar Datos de Ejemplo

Para probar la aplicación con datos de ejemplo:

```bash
# Ejecutar el seed
npx prisma db seed
```

**Esto creará:**
- ✅ 2 usuarios de prueba (profesores)
- ✅ 2 escuelas de ejemplo
- ✅ 15 alumnos de muestra
- ✅ 6 horarios de clase
- ✅ Inscripciones de alumnos
- ✅ Registros de asistencia
- ✅ Cuotas mensuales configuradas
- ✅ Algunos pagos de ejemplo

**Credenciales de prueba:**
- Email: `juan.perez@taekwondo.com` / Password: `password123`
- Email: `maria.gonzalez@taekwondo.com` / Password: `password123`

---

### Paso 10: Iniciar el Servidor de Desarrollo

```bash
# Iniciar Next.js en modo desarrollo
npm run dev
```

**Salida esperada:**
```
> taekwondo-manager@0.1.0 dev
> next dev

   ▲ Next.js 14.0.0
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in 2.5s
```

---

## ✅ Verificación de la Instalación

### 1. Verificar que el Servidor Está Corriendo

Abre tu navegador y ve a: **http://localhost:3000**

Deberías ver la página de inicio de sesión.

### 2. Verificar la Base de Datos

```bash
# Abrir Prisma Studio (interfaz visual de la BD)
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes ver todas las tablas y datos.

### 3. Probar el Login

Si ejecutaste el seed:
1. Ve a http://localhost:3000/login
2. Email: `juan.perez@taekwondo.com`
3. Password: `password123`
4. Click en "Iniciar Sesión"

Deberías ser redirigido al dashboard.

### 4. Verificar las Funcionalidades

- ✅ Dashboard muestra estadísticas
- ✅ Puedes ver la lista de alumnos
- ✅ Puedes ver los horarios
- ✅ Puedes registrar asistencia
- ✅ Puedes ver pagos

---

## 🎲 Datos de Ejemplo

Si ejecutaste `npx prisma db seed`, estos son los datos creados:

### Usuarios (Profesores)

| Nombre | Email | Password | Escuela |
|--------|-------|----------|---------|
| Maestro Juan Pérez | juan.perez@taekwondo.com | password123 | Dragón Dorado |
| Maestra María González | maria.gonzalez@taekwondo.com | password123 | Tigre Blanco |

### Escuelas

1. **Escuela de Taekwondo Dragón Dorado**
   - Dirección: Av. Libertador 1234, Buenos Aires
   - Teléfono: +54 11 4567-8900

2. **Academia Tigre Blanco**
   - Dirección: Calle Corrientes 5678, Buenos Aires
   - Teléfono: +54 11 4567-8901

### Alumnos de Ejemplo

La escuela "Dragón Dorado" tiene 15 alumnos con diferentes cinturones:
- Cinturón Blanco (principiantes)
- Cinturón Amarillo
- Cinturón Verde
- Cinturón Azul
- Cinturón Rojo
- Cinturón Negro

### Horarios de Clase

- **Lunes y Miércoles**: Niños Principiantes (17:00-18:00)
- **Martes y Jueves**: Adultos Avanzados (19:00-20:30)
- **Viernes**: Competencia (18:00-20:00)

---

## 🔧 Solución de Problemas

### Problema 1: Error "Cannot find module 'next'"

**Causa**: Las dependencias no se instalaron correctamente.

**Solución**:
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# En Windows:
rmdir /s node_modules
del package-lock.json
npm install
```

---

### Problema 2: Error de Conexión a PostgreSQL

**Error**: `Can't reach database server at localhost:5432`

**Soluciones**:

1. **Verificar que PostgreSQL está corriendo**:
   ```bash
   # Linux/macOS:
   sudo systemctl status postgresql
   
   # Windows: Abrir "Servicios" y buscar PostgreSQL
   ```

2. **Verificar el puerto**:
   PostgreSQL por defecto usa el puerto 5432. Verifica en `postgresql.conf`.

3. **Verificar credenciales**:
   Asegúrate de que el usuario y contraseña en `DATABASE_URL` son correctos.

4. **Verificar que la base de datos existe**:
   ```bash
   psql -U postgres -l
   ```

---

### Problema 3: Error en Migraciones de Prisma

**Error**: `P1001: Can't reach database server`

**Solución**:
```bash
# 1. Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL

# 2. Probar conexión manual
psql -U postgres -d taekwondo_db

# 3. Resetear migraciones (¡cuidado, borra datos!)
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

### Problema 4: Error "NEXTAUTH_SECRET is not set"

**Causa**: Falta la variable de entorno `NEXTAUTH_SECRET`.

**Solución**:
```bash
# Generar una clave secreta
openssl rand -base64 32

# Agregar al archivo .env:
NEXTAUTH_SECRET="la-clave-generada-aqui"
```

---

### Problema 5: Puerto 3000 ya en uso

**Error**: `Port 3000 is already in use`

**Solución**:

**Opción A**: Usar otro puerto
```bash
# Linux/macOS:
PORT=3001 npm run dev

# Windows (PowerShell):
$env:PORT=3001; npm run dev
```

**Opción B**: Liberar el puerto 3000
```bash
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

### Problema 6: Error al ejecutar el Seed

**Error**: `Error: Cannot find module 'ts-node'`

**Solución**:
```bash
# Instalar ts-node como dependencia de desarrollo
npm install -D ts-node

# Ejecutar el seed nuevamente
npx prisma db seed
```

---

### Problema 7: Página en Blanco o Error 500

**Causa**: Error en el código o configuración incorrecta.

**Solución**:
```bash
# 1. Ver logs en la terminal donde corre npm run dev

# 2. Verificar que todas las variables de entorno están configuradas
cat .env

# 3. Limpiar caché de Next.js
rm -rf .next
npm run dev

# En Windows:
rmdir /s .next
npm run dev
```

---

### Problema 8: Error "Module not found: Can't resolve '@/...'

**Causa**: Problema con los alias de TypeScript.

**Solución**:
```bash
# Verificar que tsconfig.json tiene la configuración correcta
# Debería tener:
# "paths": {
#   "@/*": ["./src/*"]
# }

# Reiniciar el servidor
# Ctrl+C para detener
npm run dev
```

---

## 🆘 Obtener Ayuda Adicional

Si sigues teniendo problemas:

1. 📚 Consulta la [Documentación Técnica](TECHNICAL.md)
2. ❓ Revisa las [Preguntas Frecuentes](FAQ.md)
3. 🐛 Verifica los logs en la terminal
4. 💬 Contacta al equipo de desarrollo

---

## 📝 Comandos Útiles de Referencia

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm start                # Ejecutar en producción
npm run lint             # Verificar código

# Prisma
npx prisma studio        # Interfaz visual de la BD
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migración
npx prisma db seed       # Cargar datos de ejemplo
npx prisma migrate reset # Resetear BD (¡cuidado!)
npx prisma db push       # Sincronizar schema sin migración

# Base de datos
psql -U postgres         # Conectar a PostgreSQL
psql -U postgres -d taekwondo_db  # Conectar a la BD específica
```

---

## ✅ Checklist de Instalación

Marca cada paso a medida que lo completes:

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] Repositorio clonado/descargado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado y configurado
- [ ] `NEXTAUTH_SECRET` generado
- [ ] Base de datos PostgreSQL creada
- [ ] `DATABASE_URL` configurada correctamente
- [ ] Migraciones ejecutadas (`npx prisma migrate dev`)
- [ ] Cliente Prisma generado (`npx prisma generate`)
- [ ] (Opcional) Seed ejecutado (`npx prisma db seed`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Aplicación accesible en http://localhost:3000
- [ ] Login funciona correctamente
- [ ] Dashboard muestra datos

---

## 🎉 ¡Instalación Completada!

Si llegaste hasta aquí y todos los pasos funcionaron, ¡felicitaciones! 🎊

Tu instalación de Taekwondo Manager está lista para usar.

**Próximos pasos:**
1. 📖 Lee la [Guía de Usuario](USER_GUIDE.md) para aprender a usar el sistema
2. 🔧 Consulta la [Documentación Técnica](TECHNICAL.md) si quieres entender cómo funciona
3. 🚀 Revisa la [Guía de Despliegue](DEPLOYMENT.md) cuando estés listo para producción

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-instalación---taekwondo-manager)**

¿Problemas? Consulta la [sección de solución de problemas](#-solución-de-problemas) o el [FAQ](FAQ.md)

</div>