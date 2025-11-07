import { describe, it, expect } from 'vitest'
import { deriveBeltCore, isKidsBelt } from '@/lib/belt-utils'

describe('Belt Utils', () => {
  describe('deriveBeltCore', () => {
    it('should derive branca from Branca (Adulto)', () => {
      const result = deriveBeltCore('Branca (Adulto)')
      expect(result).toBe('branca')
    })

    it('should derive azul from Azul 2º Grau (Adulto)', () => {
      const result = deriveBeltCore('Azul 2º Grau (Adulto)')
      expect(result).toBe('azul')
    })

    it('should derive cinza from Cinza/Branca (Criança)', () => {
      const result = deriveBeltCore('Cinza/Branca (Criança)')
      expect(result).toBe('cinza')
    })

    it('should derive amarela from Amarela (Criança)', () => {
      const result = deriveBeltCore('Amarela (Criança)')
      expect(result).toBe('amarela')
    })

    it('should default to branca for unknown', () => {
      const result = deriveBeltCore('Unknown Belt')
      expect(result).toBe('branca')
    })
  })

  describe('isKidsBelt', () => {
    it('should return true for kids belt', () => {
      const result = isKidsBelt('Cinza (Criança)')
      expect(result).toBe(true)
    })

    it('should return false for adult belt', () => {
      const result = isKidsBelt('Branca (Adulto)')
      expect(result).toBe(false)
    })

    it('should be case insensitive', () => {
      const result = isKidsBelt('CINZA (CRIANÇA)')
      expect(result).toBe(true)
    })
  })
})
