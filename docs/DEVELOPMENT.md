# 💻 Guía de Desarrollo - Taekwondo Manager

Guía para desarrolladores que quieren contribuir o extender el proyecto.

---

## 📋 Tabla de Contenidos

- [Configuración del Entorno](#-configuración-del-entorno)
- [Estructura del Código](#-estructura-del-código)
- [Convenciones](#-convenciones)
- [Agregar Funcionalidades](#-agregar-funcionalidades)
- [Testing](#-testing)
- [Debugging](#-debugging)
- [Git Workflow](#-git-workflow)
- [Contribuir](#-contribuir)

---

## 🛠️ Configuración del Entorno

### Requisitos

- Node.js 18+
- PostgreSQL 14+
- Git
- Editor de código (VS Code recomendado)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd taekwondo-manager

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# Configurar base de datos
npx prisma migrate dev
npx prisma db seed

# Iniciar desarrollo
npm run dev
```

### Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 📁 Estructura del Código

### Organización por Módulos

```
src/
├── app/                    # Rutas y páginas
│   ├── (auth)/            # Módulo de autenticación
│   ├── (dashboard)/       # Módulo principal
│   └── api/               # API endpoints
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── [module]/         # Componentes por módulo
├── lib/                   # Utilidades
├── services/              # Lógica de negocio
└── types/                 # Tipos TypeScript
```

### Principios de Organización

1. **Separación de Responsabilidades**: UI, lógica, datos
2. **Modularidad**: Código organizado por funcionalidad
3. **Reutilización**: Componentes y funciones reutilizables
4. **Tipado Fuerte**: TypeScript en todo el código

---

## 📝 Convenciones

### Nombres de Archivos

```
Componentes:     PascalCase.tsx      (StudentCard.tsx)
Páginas:         page.tsx            (Next.js convention)
Servicios:       camelCase.ts        (studentService.ts)
Utilidades:      camelCase.ts        (dateUtils.ts)
Tipos:           camelCase.ts        (index.ts)
```

### Nombres de Variables

```typescript
// Componentes: PascalCase
const StudentCard = () => {}

// Funciones: camelCase
const calculateTotal = () => {}

// Constantes: UPPER_SNAKE_CASE
const MAX_STUDENTS = 20

// Interfaces: PascalCase con I prefix (opcional)
interface Student {}
interface IStudentProps {}

// Types: PascalCase
type StudentStatus = 'active' | 'inactive'
```

### Estructura de Componentes

```typescript
// 1. Imports
import { FC } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface StudentCardProps {
  student: Student
  onEdit?: () => void
}

// 3. Component
export const StudentCard: FC<StudentCardProps> = ({ 
  student, 
  onEdit 
}) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false)
  
  // 5. Handlers
  const handleEdit = () => {
    setIsEditing(true)
    onEdit?.()
  }
  
  // 6. Render
  return (
    <div className="card">
      {/* JSX */}
    </div>
  )
}
```

### Estructura de Servicios

```typescript
// studentService.ts
import { prisma } from '@/lib/prisma'

export interface CreateStudentData {
  firstName: string
  lastName: string
  // ...
}

export const studentService = {
  async create(data: CreateStudentData) {
    // Validación
    if (!data.firstName) {
      throw new Error('First name is required')
    }
    
    // Lógica de negocio
    const student = await prisma.student.create({
      data: {
        ...data,
        createdAt: new Date()
      }
    })
    
    return student
  },
  
  async getById(id: string) {
    // ...
  }
}
```

---

## ➕ Agregar Funcionalidades

### 1. Agregar Nuevo Modelo de Base de Datos

**Paso 1**: Editar `prisma/schema.prisma`

```prisma
model Belt {
  id          String   @id @default(cuid())
  name        String
  color       String
  order       Int
  description String?
  createdAt   DateTime @default(now())
  
  students    Student[]
  
  @@map("belts")
}
```

**Paso 2**: Crear migración

```bash
npx prisma migrate dev --name add_belt_model
```

**Paso 3**: Generar cliente

```bash
npx prisma generate
```

### 2. Crear Nuevo Servicio

**Archivo**: `src/services/beltService.ts`

```typescript
import { prisma } from '@/lib/prisma'

export interface CreateBeltData {
  name: string
  color: string
  order: number
  description?: string
}

export const beltService = {
  async create(data: CreateBeltData) {
    return await prisma.belt.create({ data })
  },
  
  async getAll() {
    return await prisma.belt.findMany({
      orderBy: { order: 'asc' }
    })
  },
  
  async getById(id: string) {
    return await prisma.belt.findUnique({
      where: { id }
    })
  }
}
```

### 3. Crear API Endpoint

**Archivo**: `src/app/api/belts/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { beltService } from '@/services/beltService'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }
  
  const belts = await beltService.getAll()
  return NextResponse.json(belts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }
  
  const data = await request.json()
  const belt = await beltService.create(data)
  
  return NextResponse.json(belt, { status: 201 })
}
```

### 4. Crear Componente

**Archivo**: `src/components/belts/BeltCard.tsx`

```typescript
import { FC } from 'react'
import { Card } from '@/components/ui/card'

interface BeltCardProps {
  belt: {
    id: string
    name: string
    color: string
    order: number
  }
}

export const BeltCard: FC<BeltCardProps> = ({ belt }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full"
          style={{ backgroundColor: belt.color }}
        />
        <div>
          <h3 className="font-semibold">{belt.name}</h3>
          <p className="text-sm text-gray-500">Orden: {belt.order}</p>
        </div>
      </div>
    </Card>
  )
}
```

### 5. Crear Página

**Archivo**: `src/app/(dashboard)/belts/page.tsx`

```typescript
import { requireAuth } from '@/lib/auth'
import { beltService } from '@/services/beltService'
import { BeltCard } from '@/components/belts/BeltCard'

export default async function BeltsPage() {
  await requireAuth()
  const belts = await beltService.getAll()
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cinturones</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {belts.map(belt => (
          <BeltCard key={belt.id} belt={belt} />
        ))}
      </div>
    </div>
  )
}
```

---

## 🧪 Testing

### Configurar Jest (Futuro)

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**jest.config.js**:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### Ejemplo de Test

```typescript
// studentService.test.ts
import { studentService } from '@/services/studentService'

describe('studentService', () => {
  describe('create', () => {
    it('should create a student', async () => {
      const data = {
        firstName: 'Juan',
        lastName: 'Pérez',
        schoolId: 'school-123'
      }
      
      const student = await studentService.create(data)
      
      expect(student).toBeDefined()
      expect(student.firstName).toBe('Juan')
    })
    
    it('should throw error if firstName is missing', async () => {
      const data = {
        firstName: '',
        lastName: 'Pérez',
        schoolId: 'school-123'
      }
      
      await expect(studentService.create(data))
        .rejects
        .toThrow('First name is required')
    })
  })
})
```

---

## 🐛 Debugging

### Next.js Debug

```bash
# Modo debug
NODE_OPTIONS='--inspect' npm run dev

# Abrir Chrome DevTools
chrome://inspect
```

### Prisma Debug

```typescript
// Habilitar logs
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### React DevTools

Instalar extensión de Chrome: React Developer Tools

### Console Logs Estratégicos

```typescript
console.log('🔍 Debug:', variable)
console.error('❌ Error:', error)
console.warn('⚠️ Warning:', warning)
console.info('ℹ️ Info:', info)
```

---

## 🔀 Git Workflow

### Branches

```
main          → Producción
develop       → Desarrollo
feature/*     → Nuevas funcionalidades
bugfix/*      → Corrección de bugs
hotfix/*      → Correcciones urgentes
```

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add belt management module
fix: correct payment calculation logic
docs: update installation guide
style: format code with prettier
refactor: simplify attendance service
test: add tests for payment service
chore: update dependencies
```

### Workflow

```bash
# 1. Crear branch
git checkout -b feature/belt-management

# 2. Hacer cambios y commits
git add .
git commit -m "feat: add belt model and service"

# 3. Push
git push origin feature/belt-management

# 4. Crear Pull Request en GitHub

# 5. Después de merge, actualizar main
git checkout main
git pull origin main
```

---

## 🤝 Contribuir

### Proceso de Contribución

1. **Fork** el repositorio
2. **Clonar** tu fork
3. **Crear branch** para tu feature
4. **Hacer cambios** siguiendo las convenciones
5. **Testear** tus cambios
6. **Commit** con mensajes descriptivos
7. **Push** a tu fork
8. **Crear Pull Request**

### Checklist de Pull Request

- [ ] Código sigue las convenciones del proyecto
- [ ] Funcionalidad testeada localmente
- [ ] Sin errores de TypeScript
- [ ] Sin errores de ESLint
- [ ] Documentación actualizada si es necesario
- [ ] Commits con mensajes descriptivos
- [ ] PR describe los cambios claramente

### Code Review

Todos los PRs serán revisados antes de merge. Se verificará:

- ✅ Calidad del código
- ✅ Funcionalidad correcta
- ✅ Performance
- ✅ Seguridad
- ✅ Documentación

---

## 🔧 Herramientas Útiles

### Prisma Studio

```bash
npx prisma studio
```

Interfaz visual para explorar la base de datos.

### ESLint

```bash
npm run lint
```

Verificar problemas de código.

### TypeScript Check

```bash
npx tsc --noEmit
```

Verificar errores de tipos.

### Format Code

```bash
npx prettier --write .
```

Formatear todo el código.

---

## 📚 Recursos

### Documentación Oficial

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tutoriales

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Comunidad

- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Discord](https://discord.gg/prisma)
- [Stack Overflow](https://stackoverflow.com)

---

## 💡 Tips y Mejores Prácticas

### Performance

- ✅ Usar `select` en Prisma para traer solo campos necesarios
- ✅ Implementar paginación en listas largas
- ✅ Usar índices en base de datos
- ✅ Optimizar imágenes
- ✅ Lazy loading de componentes

### Seguridad

- ✅ Validar todas las entradas
- ✅ Sanitizar datos
- ✅ Usar prepared statements (Prisma lo hace automáticamente)
- ✅ Verificar autenticación en todas las APIs
- ✅ No exponer información sensible

### Mantenibilidad

- ✅ Código limpio y legible
- ✅ Comentarios donde sea necesario
- ✅ Funciones pequeñas y específicas
- ✅ DRY (Don't Repeat Yourself)
- ✅ Nombres descriptivos

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-desarrollo---taekwondo-manager)**

¿Preguntas? Consulta el [FAQ](FAQ.md) o la [Documentación Técnica](TECHNICAL.md)

Happy Coding! 🚀

</div>