/**
 * Contexto de Pago
 * -------------------------------------------------------
 * Este contexto maneja el estado global del método de pago seleccionado.
 * Permite que múltiples componentes accedan y modifiquen la selección
 * de método de pago sin prop drilling.
 *
 * Funcionalidades:
 * - Estado global para método de pago seleccionado
 * - Provider para envolver la aplicación
 * - Hook personalizado para acceso fácil al contexto
 * - Validación de uso correcto del contexto
 */

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { PaymentMethodId } from "@/lib/types"

/**
 * Interfaz que define la estructura del contexto de pago
 * Incluye el estado actual y la función para modificarlo
 */
interface PaymentContextType {
  selectedPaymentMethod: PaymentMethodId
  setSelectedPaymentMethod: (method: PaymentMethodId) => void
}

/**
 * Crear el contexto con valor inicial undefined
 * Esto permite detectar si el hook se usa fuera del Provider
 */
const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

/**
 * Componente Provider que envuelve la aplicación
 * Proporciona el estado y funciones del contexto a todos los componentes hijos
 * @param children - Componentes hijos que tendrán acceso al contexto
 */
export function PaymentProvider({ children }: { children: ReactNode }) {
  // Estado local que se compartirá globalmente
  // Valor por defecto: "mercadopago" (primer método disponible)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>("mercadopago")

  return (
    <PaymentContext.Provider value={{ selectedPaymentMethod, setSelectedPaymentMethod }}>
      {children}
    </PaymentContext.Provider>
  )
}

/**
 * Hook personalizado para acceder al contexto de pago
 * Incluye validación para asegurar uso correcto dentro del Provider
 * @returns Objeto con estado y funciones del contexto de pago
 * @throws Error si se usa fuera del PaymentProvider
 */
export function usePayment() {
  const context = useContext(PaymentContext)

  // Validación: el hook debe usarse dentro del Provider
  if (context === undefined) {
    throw new Error("usePayment debe ser usado dentro de un PaymentProvider")
  }

  return context
}
