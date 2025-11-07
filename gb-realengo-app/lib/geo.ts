/**
 * Geofencing e antifraude helpers
 */

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Calcula distância entre duas coordenadas usando fórmula de Haversine
 * @returns distância em metros
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3 // Raio da Terra em metros
  const φ1 = (point1.lat * Math.PI) / 180
  const φ2 = (point2.lat * Math.PI) / 180
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distância em metros
}

/**
 * Verifica se está dentro do raio permitido
 */
export function isWithinRadius(
  userLocation: Coordinates,
  schoolLocation: Coordinates,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLocation, schoolLocation)
  return distance <= radiusMeters
}

/**
 * Valida precisão do GPS
 */
export function hasValidAccuracy(accuracy: number, minAccuracy: number): boolean {
  return accuracy <= minAccuracy
}

/**
 * Verifica se está dentro da janela de check-in
 * @param classTime horário da aula em formato "HH:mm"
 * @param windowBefore minutos antes da aula
 * @param windowAfter minutos depois da aula
 * @param currentTime timestamp atual (Date ou string)
 * @param timezone timezone da aplicação
 */
export function isWithinCheckinWindow(
  classTime: string,
  classWeekday: number,
  windowBefore: number,
  windowAfter: number,
  currentTime: Date,
  timezone: string
): boolean {
  const dayjs = require('dayjs')
  const utc = require('dayjs/plugin/utc')
  const tz = require('dayjs/plugin/timezone')
  
  dayjs.extend(utc)
  dayjs.extend(tz)

  const now = dayjs(currentTime).tz(timezone)
  const currentWeekday = now.day()

  // Verifica se é o dia correto
  if (currentWeekday !== classWeekday) {
    return false
  }

  // Parse do horário da aula
  const [hours, minutes] = classTime.split(':').map(Number)
  
  // Cria objeto de data/hora da aula
  const classDateTime = now.hour(hours).minute(minutes).second(0).millisecond(0)

  // Calcula janela
  const windowStart = classDateTime.subtract(windowBefore, 'minute')
  const windowEnd = classDateTime.add(windowAfter, 'minute')

  return now.isAfter(windowStart) && now.isBefore(windowEnd)
}

/**
 * Gera um hash simples de device_id + user_agent para detecção de dispositivos
 */
export function generateDeviceFingerprint(deviceId?: string, userAgent?: string): string {
  const crypto = require('crypto')
  const data = `${deviceId || 'unknown'}-${userAgent || 'unknown'}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}
