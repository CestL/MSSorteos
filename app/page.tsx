/**
 * Página Principal de la Plataforma de Sorteos
 * -------------------------------------------------------
 * Aplicación de página única limpia con comportamiento de logo optimizado
 */

import type { Metadata } from "next"
import { PaymentProvider } from "@/contexts/payment-context"
import { HeroSection } from "@/components/hero-section"
import { PaymentMethodsSection } from "@/components/payment-methods-section"
import { TicketSelectionSection } from "@/components/ticket-selection-section"
import { RegistrationFormSection } from "@/components/registration-form-section"
import { FooterSection } from "@/components/footer-section"

// Fixed: Moved viewport configuration to separate export as recommended by Next.js 15
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Sorteo de 3 Millones - Gana Millones en Sorteos VIP | Miguel Sandoval",
  description:
    "Participa en nuestro sorteo de 3 millones de pesos chilenos. Compra tus tickets, realiza tu pago y completa tu registro para ganar millones. Sorteos seguros y confiables con Miguel Sandoval.",
  keywords:
    "sorteo, 3 millones, millones, sorteos, rifa, pesos chilenos, participar, ganar dinero, Miguel Sandoval, sorteos VIP, ganar millones, rifas millonarias",
  openGraph: {
    title: "Sorteo de 3 Millones - Gana Millones | Miguel Sandoval",
    description: "Participa en sorteos millonarios y gana 3 millones de pesos. Sorteos seguros y confiables.",
    type: "website",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sorteo de 3 Millones - Gana Millones",
    description: "Participa en sorteos millonarios y gana 3 millones de pesos chilenos.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sorteosmiguelsandoval.com",
  },
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