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
import type { Currency } from "./types"

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
