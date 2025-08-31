/**
 * Utility Functions
 * -------------------------------------------------------
 * Optimized utility functions for the raffle platform
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function generateWhatsAppUrl(number: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encodedMessage}`
}

export function validateFormData(data: Record<string, string>): string[] {
  const errors: string[] = []
  const requiredFields = ["buyerName", "email", "phone", "referenceNumber"]

  for (const field of requiredFields) {
    if (!data[field]?.trim()) {
      errors.push(`${field} es requerido`)
    }
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email no válido")
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
