/**
 * Payment Context
 * -------------------------------------------------------
 * Manages selected payment method across components
 */

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { PaymentMethodId } from "@/lib/types"

interface PaymentContextType {
  selectedPaymentMethod: PaymentMethodId
  setSelectedPaymentMethod: (method: PaymentMethodId) => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>("mercadopago")

  return (
    <PaymentContext.Provider value={{ selectedPaymentMethod, setSelectedPaymentMethod }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
