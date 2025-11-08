import { describe, it, expect } from 'vitest'
import { calculateDistance, isWithinRadius, hasValidAccuracy } from '@/lib/geo'

describe('Geo Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const point1 = { lat: -22.8941172, lng: -43.4420113 }
      const point2 = { lat: -22.8941172, lng: -43.4420113 }
      
      const distance = calculateDistance(point1, point2)
      expect(distance).toBe(0)
    })

    it('should calculate distance for different points', () => {
      const schoolLocation = { lat: -22.8941172, lng: -43.4420113 }
      const nearbyLocation = { lat: -22.8942, lng: -43.4421 }
      
      const distance = calculateDistance(schoolLocation, nearbyLocation)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(20) // Less than 20m
    })
  })

  describe('isWithinRadius', () => {
    it('should return true when within radius', () => {
      const point1 = { lat: -22.8941172, lng: -43.4420113 }
      const point2 = { lat: -22.8941172, lng: -43.4420113 }
      
      const result = isWithinRadius(point1, point2, 20)
      expect(result).toBe(true)
    })

    it('should return false when outside radius', () => {
      const schoolLocation = { lat: -22.8941172, lng: -43.4420113 }
      const farLocation = { lat: -22.9000000, lng: -43.5000000 } // Far away
      
      const result = isWithinRadius(farLocation, schoolLocation, 20)
      expect(result).toBe(false)
    })
  })

  describe('hasValidAccuracy', () => {
    it('should return true for good accuracy', () => {
      const result = hasValidAccuracy(10, 50)
      expect(result).toBe(true)
    })

    it('should return false for poor accuracy', () => {
      const result = hasValidAccuracy(100, 50)
      expect(result).toBe(false)
    })

    it('should return true for exact threshold', () => {
      const result = hasValidAccuracy(50, 50)
      expect(result).toBe(true)
    })
  })
})
