import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const dayjs = require('dayjs')
  require('dayjs/locale/pt-br')
  dayjs.locale('pt-br')
  
  return dayjs(date).format('DD/MM/YYYY')
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: Date | string): string {
  const dayjs = require('dayjs')
  require('dayjs/locale/pt-br')
  dayjs.locale('pt-br')
  
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

/**
 * Formata horário
 */
export function formatTime(time: string): string {
  return time
}

/**
 * Retorna nome do dia da semana
 */
export function getWeekdayName(weekday: number): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[weekday] || ''
}

/**
 * Retorna nome curto do dia da semana
 */
export function getWeekdayShort(weekday: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[weekday] || ''
}
