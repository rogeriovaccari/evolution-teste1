/**
 * Utilitários para faixas de Jiu-Jitsu
 */

export const ADULT_BELTS = [
  'branca',
  'azul',
  'roxa',
  'marrom',
  'preta',
  'vermelha',
] as const

export const KIDS_BELTS = [
  'cinza',
  'amarela',
  'laranja',
  'verde',
  'azul',
  'roxa',
  'marrom',
  'preta',
  'vermelha',
] as const

export type BeltCore = typeof ADULT_BELTS[number] | typeof KIDS_BELTS[number]

/**
 * Deriva belt_core a partir de belt_level
 * Ex: "Branca (Adulto)" -> "branca"
 * Ex: "Azul 1º Grau (Adulto)" -> "azul"
 * Ex: "Cinza/Branca (Criança)" -> "cinza"
 */
export function deriveBeltCore(beltLevel: string): string {
  const normalized = beltLevel.toLowerCase()

  // Mapeia cores em português
  const colorMap: Record<string, string> = {
    cinza: 'cinza',
    amarela: 'amarela',
    laranja: 'laranja',
    verde: 'verde',
    azul: 'azul',
    roxa: 'roxa',
    marrom: 'marrom',
    preta: 'preta',
    vermelha: 'vermelha',
    branca: 'branca',
  }

  // Procura primeira cor que aparece no nome
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalized.includes(key)) {
      return value
    }
  }

  // Default
  return 'branca'
}

/**
 * Verifica se belt_level é de criança
 */
export function isKidsBelt(beltLevel: string): boolean {
  return beltLevel.toLowerCase().includes('criança')
}

/**
 * Gera lista de opções de faixas adulto para select
 */
export function getAdultBeltOptions() {
  return [
    'Branca (Adulto)',
    'Azul 1º Grau (Adulto)',
    'Azul 2º Grau (Adulto)',
    'Azul 3º Grau (Adulto)',
    'Azul 4º Grau (Adulto)',
    'Roxa 1º Grau (Adulto)',
    'Roxa 2º Grau (Adulto)',
    'Roxa 3º Grau (Adulto)',
    'Roxa 4º Grau (Adulto)',
    'Marrom 1º Grau (Adulto)',
    'Marrom 2º Grau (Adulto)',
    'Marrom 3º Grau (Adulto)',
    'Marrom 4º Grau (Adulto)',
    'Preta (Adulto)',
  ]
}

/**
 * Gera lista de opções de faixas kids para select
 */
export function getKidsBeltOptions() {
  return [
    'Cinza/Branca (Criança)',
    'Cinza (Criança)',
    'Amarela/Cinza (Criança)',
    'Amarela (Criança)',
    'Laranja/Amarela (Criança)',
    'Laranja (Criança)',
    'Verde/Laranja (Criança)',
    'Verde (Criança)',
  ]
}

/**
 * Retorna todas as opções de faixas
 */
export function getAllBeltOptions() {
  return [...getAdultBeltOptions(), ...getKidsBeltOptions()]
}
