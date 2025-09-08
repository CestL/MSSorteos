/**
 * Funciones de Utilidad
 * -------------------------------------------------------
 * Este archivo contiene funciones helper reutilizables en toda la aplicación.
 * Incluye utilidades para formateo, validación, clipboard y generación de URLs.
 *
 * Funciones principales:
 * - cn: Combinación de clases CSS con Tailwind
 * - formatCurrency: Formateo de monedas según región
 * - copyToClipboard: Copia de texto al portapapeles
 * - generateWhatsAppUrl: Generación de URLs de WhatsApp
 * - validateFormData: Validación de datos de formulario
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Types for the application
export type Currency = "CLP" | "USD"
export type PaymentMethodId = "mercadopago" | "tenpo" | "santander" | "zelle"

export interface FormData {
  buyerName: string
  email: string
  phone: string
  referenceNumber: string
  ticketCount: string
}

export interface TicketPreset {
  readonly label: string
  readonly value: number
}

export interface PaymentMethod {
  readonly id: PaymentMethodId
  readonly name: string
  readonly logo: string
  readonly currency: Currency
}

export interface AccountDetail {
  readonly accountNumber?: string
  readonly rut?: string
  readonly bank?: string
  readonly accountType?: string
  readonly accountHolder?: string
  readonly name?: string
  readonly email?: string
  readonly phone?: string
  readonly service?: string
}

export interface SocialLinks {
  readonly whatsapp: {
    readonly number: string
    readonly message: string
  }
  readonly instagram: string
  readonly facebook: string
}

// Constants for file upload and database integration
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB in bytes (updated to match database constraint)
export const MAX_FILE_SIZE_MB = 2 // 2MB for display purposes
export const PAYMENT_RECEIPTS_BUCKET = 'receipts' // Bucket según DATABASE_GUIDE.md

// Ticket pricing and configuration
export const TICKET_PRICES = {
  CLP: 800, // Pesos chilenos por ticket
  USD: 0.8, // Dólares estadounidenses por ticket
} as const

export const MINIMUM_TICKETS = 3

export const TICKET_PRESETS = [
  { label: "+3 tickets", value: 3 },
  { label: "+10 tickets", value: 10 },
  { label: "+20 tickets", value: 20 },
  { label: "+50 tickets", value: 50 },
  { label: "+100 tickets", value: 100 },
] as const

// Payment methods configuration
export const PAYMENT_METHODS = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    logo: "/images/mercadopago.png",
    currency: "CLP" as const,
  },
  {
    id: "tenpo",
    name: "Cuenta Tenpo",
    logo: "/images/tenpo.jpeg",
    currency: "CLP" as const,
  },
  {
    id: "santander",
    name: "Banco Santander",
    logo: "/images/santander.png",
    currency: "CLP" as const,
  },
  {
    id: "zelle",
    name: "Zelle",
    logo: "/images/zelle-logo.png",
    currency: "USD" as const,
  },
] as const

// Account details for payment methods
export const ACCOUNT_DETAILS = {
  mercadopago: {
    accountNumber: "1020788385",
    rut: "26178351-7",
    bank: "Mercado Pago",
    accountType: "Vista",
    accountHolder: "Miguel Angel Sandoval Silvera",
  },
  tenpo: {
    name: "MIGUEL ANGEL SANDOVAL SILVERA",
    rut: "26178351-7",
    bank: "Banco prepago Tenpo",
    accountType: "Cuenta Vista",
    accountNumber: "111126178351",
    email: "sandovalmiguel888@gmail.com",
  },
  santander: {
    name: "Miguel Angel Sandoval Silvera",
    rut: "26178351-7",
    accountType: "Cuenta Corriente",
    accountNumber: "0 000 81 08954 0",
    bank: "Banco Santander",
    email: "sandovalmiguel888@gmail.com",
  },
  zelle: {
    name: "Jehonadad Samuel Sulbaran Díaz",
    phone: "7208712756",
    service: "Zelle",
  },
} as const

// Social media links
export const SOCIAL_LINKS = {
  whatsapp: {
    number: "56949077188",
    message: "Hola! Me interesa participar en el sorteo de 3M",
  },
  instagram: "https://www.instagram.com/sandoval__miguel?igsh=MXVoMjAzMHJ6bW5tdg==",
  facebook: "https://www.facebook.com/share/1CtheYuW2E/",
} as const

// Image paths
export const IMAGES = {
  logo: "/images/logo.png",
  heroBackground: "/images/hero-background.jpeg",
} as const

/**
 * Función para combinar clases CSS de manera inteligente
 * Utiliza clsx para concatenar clases y twMerge para resolver conflictos de Tailwind
 * @param inputs - Array de clases CSS o valores condicionales
 * @returns String con clases CSS combinadas y optimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Función para formatear cantidades monetarias según la moneda
 * Utiliza Intl.NumberFormat para formateo localizado
 * @param amount - Cantidad numérica a formatear
 * @param currency - Tipo de moneda (CLP o USD)
 * @returns String con formato de moneda localizado
 */
export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "USD") {
    // Formato para dólares estadounidenses
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2, // Siempre mostrar centavos
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Formato para pesos chilenos
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0, // Sin decimales para pesos
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Función asíncrona para copiar texto al portapapeles
 * Utiliza la API moderna de Clipboard con manejo de errores
 * @param text - Texto a copiar al portapapeles
 * @returns Promise<boolean> - true si la copia fue exitosa, false si falló
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Intentar usar la API moderna de Clipboard
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Si falla, retornar false (podría implementarse fallback aquí)
    return false
  }
}

/**
 * Función para generar URLs de WhatsApp con mensaje predefinido
 * Crea enlaces que abren WhatsApp con un número y mensaje específicos
 * @param number - Número de teléfono (formato internacional sin +)
 * @param message - Mensaje predefinido a enviar
 * @returns String con URL completa de WhatsApp
 */
export function generateWhatsAppUrl(number: string, message: string): string {
  // Codificar el mensaje para URL (espacios, caracteres especiales, etc.)
  const encodedMessage = encodeURIComponent(message)

  // Construir URL de WhatsApp con formato wa.me
  return `https://wa.me/${number}?text=${encodedMessage}`
}

/**
 * Función para validar datos del formulario de registro
 * Verifica campos obligatorios y formatos específicos como email
 * @param data - Objeto con datos del formulario
 * @returns Array de strings con mensajes de error (vacío si no hay errores)
 */
export function validateFormData(data: Record<string, string>): string[] {
  const errors: string[] = []

  // Lista de campos obligatorios con sus nombres en español
  const requiredFields = ["buyerName", "email", "phone", "referenceNumber"]

  // Validar cada campo obligatorio
  for (const field of requiredFields) {
    if (!data[field]?.trim()) {
      // Mapear nombres de campos técnicos a nombres amigables en español
      const fieldNames: Record<string, string> = {
        buyerName: "Nombre del comprador",
        email: "Email",
        phone: "Número de teléfono",
        referenceNumber: "Número de referencia",
      }
      errors.push(`${fieldNames[field] || field} es requerido`)
    }
  }

  // Validación específica para formato de email
  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email no válido")
  }

  return errors
}

/**
 * Función helper para validar formato de email
 * Utiliza expresión regular para verificar estructura básica de email
 * @param email - String con dirección de email a validar
 * @returns boolean - true si el email tiene formato válido
 */
function isValidEmail(email: string): boolean {
  // Expresión regular básica para validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}