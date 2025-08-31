/**
 * Main Raffle Platform Page
 * -------------------------------------------------------
 * Clean single-page application with optimized logo behavior
 */

import type { Metadata } from "next"
import { PaymentProvider } from "@/contexts/payment-context"
import { HeroSection } from "@/components/hero-section"
import { PaymentMethodsSection } from "@/components/payment-methods-section"
import { TicketSelectionSection } from "@/components/ticket-selection-section"
import { RegistrationFormSection } from "@/components/registration-form-section"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Sorteo de 3M - Rifa VIP",
  description:
    "Participa en nuestro sorteo de 3 millones de pesos. Selecciona tus tickets, realiza tu pago y completa tu registro para ganar millones.",
  keywords: "sorteo, 3 millones, rifa, pesos chilenos, participar, ganar dinero",
  viewport: "width=device-width, initial-scale=1",
}

export default function RafflePage() {
  return (
    <PaymentProvider>
      <div className="min-h-screen bg-gray-900">
        <HeroSection />
        <main className="mx-auto max-w-4xl px-3 py-4 space-y-6 sm:px-4 sm:py-6 sm:space-y-8">
          <PaymentMethodsSection />
          <TicketSelectionSection />
          <RegistrationFormSection />
        </main>
        <FooterSection />
      </div>
    </PaymentProvider>
  )
}
