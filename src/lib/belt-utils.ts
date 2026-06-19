// Belt levels with tips (puntas)
export const BELT_LEVELS = [
  { value: 'blanco', label: 'Blanco', order: 1 },
  { value: 'blanco-amarillo', label: 'Blanco Punta Amarillo', order: 2 },
  { value: 'amarillo', label: 'Amarillo', order: 3 },
  { value: 'amarillo-verde', label: 'Amarillo Punta Verde', order: 4 },
  { value: 'verde', label: 'Verde', order: 5 },
  { value: 'verde-azul', label: 'Verde Punta Azul', order: 6 },
  { value: 'azul', label: 'Azul', order: 7 },
  { value: 'azul-rojo', label: 'Azul Punta Rojo', order: 8 },
  { value: 'rojo', label: 'Rojo', order: 9 },
  { value: 'rojo-negro', label: 'Rojo Punta Negro', order: 10 },
  { value: 'negro', label: 'Negro', order: 11 },
  { value: 'negro-1dan', label: 'Negro 1° Dan', order: 12 },
  { value: 'negro-2dan', label: 'Negro 2° Dan', order: 13 },
  { value: 'negro-3dan', label: 'Negro 3° Dan', order: 14 },
  { value: 'negro-4dan', label: 'Negro 4° Dan', order: 15 },
  { value: 'negro-5dan', label: 'Negro 5° Dan', order: 16 },
] as const

export type BeltValue = typeof BELT_LEVELS[number]['value']

// Get belt display name
export function getBeltLabel(belt: string | null): string {
  if (!belt) return 'Sin cinturón'
  const beltLevel = BELT_LEVELS.find(b => b.value === belt)
  return beltLevel ? beltLevel.label : belt.charAt(0).toUpperCase() + belt.slice(1)
}

// Get belt color classes for Tailwind
export function getBeltColorClasses(belt: string | null): string {
  if (!belt) return 'bg-gray-100 text-gray-800 border-gray-300'
  
  const baseColor = belt.split('-')[0]
  
  const colors: Record<string, string> = {
    blanco: 'bg-gray-100 text-gray-800 border-gray-300',
    amarillo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    verde: 'bg-green-100 text-green-800 border-green-300',
    azul: 'bg-blue-100 text-blue-800 border-blue-300',
    rojo: 'bg-red-100 text-red-800 border-red-300',
    negro: 'bg-gray-900 text-white border-gray-900'
  }
  
  return colors[baseColor] || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Get belt order for sorting
export function getBeltOrder(belt: string | null): number {
  if (!belt) return 0
  const beltLevel = BELT_LEVELS.find(b => b.value === belt)
  return beltLevel ? beltLevel.order : 0
}

// Sort students by belt level
export function sortByBelt<T extends { belt?: string | null }>(students: T[]): T[] {
  return [...students].sort((a, b) => {
    const orderA = getBeltOrder(a.belt || null)
    const orderB = getBeltOrder(b.belt || null)
    return orderB - orderA // Higher belts first
  })
}

// Get next belt level (for promotion)
export function getNextBelt(currentBelt: string | null): string | null {
  if (!currentBelt) return BELT_LEVELS[0].value
  
  const currentIndex = BELT_LEVELS.findIndex(b => b.value === currentBelt)
  if (currentIndex === -1 || currentIndex === BELT_LEVELS.length - 1) {
    return null // Already at highest belt or belt not found
  }
  
  return BELT_LEVELS[currentIndex + 1].value
}

// Get previous belt level (for demotion)
export function getPreviousBelt(currentBelt: string | null): string | null {
  if (!currentBelt) return null
  
  const currentIndex = BELT_LEVELS.findIndex(b => b.value === currentBelt)
  if (currentIndex === -1 || currentIndex === 0) {
    return null // Already at lowest belt or belt not found
  }
  
  return BELT_LEVELS[currentIndex - 1].value
}

// Made with Bob