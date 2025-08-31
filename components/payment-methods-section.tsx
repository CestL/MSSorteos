/**
 * Payment Methods Section Component
 * -------------------------------------------------------
 * Clean payment selection with mobile responsiveness
 */

"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useClipboard } from "@/hooks/use-clipboard"
import { usePayment } from "@/contexts/payment-context"
import { PAYMENT_METHODS, ACCOUNT_DETAILS } from "@/lib/constants"
import type { PaymentMethod } from "@/lib/types"

export function PaymentMethodsSection() {
  const { selectedPaymentMethod, setSelectedPaymentMethod } = usePayment()
  const { copy, copiedField } = useClipboard()

  const renderPaymentMethodButton = (method: PaymentMethod) => (
    <button
      key={method.id}
      onClick={() => setSelectedPaymentMethod(method.id)}
      className={`p-3 rounded-lg border-2 transition-all w-full sm:w-auto sm:p-4 ${
        selectedPaymentMethod === method.id
          ? "border-yellow-400 bg-yellow-900/20"
          : "border-gray-600 hover:border-yellow-400 bg-gray-800"
      }`}
      aria-pressed={selectedPaymentMethod === method.id}
    >
      <div className="w-12 h-12 mb-2 relative mx-auto sm:w-16 sm:h-16">
        <Image src={method.logo || "/placeholder.svg"} alt={`${method.name} logo`} fill className="object-contain" />
      </div>
      <div className="text-xs font-medium text-white sm:text-sm">{method.name}</div>
    </button>
  )

  const renderCopyButton = (text: string, fieldName: string) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => copy(text, fieldName)}
      className="h-6 w-6 p-0 text-white hover:text-yellow-400 hover:bg-gray-700 flex-shrink-0"
    >
      {copiedField === fieldName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )

  const renderAccountField = (label: string, value: string, fieldName: string, showCopy = true) => (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-gray-300 flex-shrink-0 sm:text-sm">{label}:</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-white text-xs break-all sm:text-sm">{value}</span>
        {showCopy && renderCopyButton(value, fieldName)}
      </div>
    </div>
  )

  const renderAccountDetails = () => {
    const accountDetail = ACCOUNT_DETAILS[selectedPaymentMethod]
    if (!accountDetail) return null

    const method = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)
    if (!method) return null

    return (
      <Card className="border-gray-600 bg-gray-800">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2 sm:text-lg">
            <div className="w-6 h-6 relative flex-shrink-0 sm:w-8 sm:h-8">
              <Image
                src={method.logo || "/placeholder.svg"}
                alt={`${method.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <span className="truncate">{method.name}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3">
          <div className="grid gap-2 sm:gap-3">
            {selectedPaymentMethod === "zelle" && (
              <>
                {renderAccountField("Nombre", accountDetail.name!, "Nombre")}
                {renderAccountField("Teléfono", accountDetail.phone!, "Teléfono")}
                {renderAccountField("Servicio", accountDetail.service!, "Servicio", false)}
              </>
            )}

            {selectedPaymentMethod !== "zelle" && (
              <>
                {accountDetail.rut && renderAccountField("RUT", accountDetail.rut, "RUT")}
                {accountDetail.accountHolder && renderAccountField("Titular", accountDetail.accountHolder, "Titular")}
                {accountDetail.name && renderAccountField("Nombre", accountDetail.name, "Nombre")}
                {accountDetail.bank && renderAccountField("Banco", accountDetail.bank, "Banco", false)}
                {accountDetail.accountType &&
                  renderAccountField("Tipo de cuenta", accountDetail.accountType, "Tipo de cuenta", false)}
                {accountDetail.accountNumber &&
                  renderAccountField("N° de cuenta", accountDetail.accountNumber, "Número de cuenta")}
                {accountDetail.email && renderAccountField("Email", accountDetail.email, "Email")}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section aria-label="Métodos de pago">
      <Card className="border-gray-600 bg-gray-800">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿A dónde quieres transferir?</CardTitle>
          <p className="text-sm text-gray-300 sm:text-base">Selecciona una cuenta:</p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-center sm:gap-4 sm:flex-wrap">
            {PAYMENT_METHODS.map(renderPaymentMethodButton)}
          </div>
          {renderAccountDetails()}
        </CardContent>
      </Card>
    </section>
  )
}
