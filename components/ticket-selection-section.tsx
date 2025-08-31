/**
 * Ticket Selection Section Component
 * -------------------------------------------------------
 * Enhanced ticket selection with clean custom input handling
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayment } from "@/contexts/payment-context"
import { TICKET_PRICES, TICKET_PRESETS, MINIMUM_TICKETS, PAYMENT_METHODS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import type { TicketPreset } from "@/lib/types"

export function TicketSelectionSection() {
  const { selectedPaymentMethod } = usePayment()
  const [selectedTickets, setSelectedTickets] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [totalAmount, setTotalAmount] = useState<number>(0)

  const currentPaymentMethod = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)
  const currency = currentPaymentMethod?.currency || "CLP"
  const ticketPrice = TICKET_PRICES[currency]

  // Update total amount whenever tickets or payment method changes
  useEffect(() => {
    setTotalAmount(selectedTickets * ticketPrice)
  }, [selectedTickets, ticketPrice])

  const handlePresetClick = useCallback(
    (amount: number) => {
      const newTotal = selectedTickets + amount
      setSelectedTickets(newTotal)
      setCustomAmount(newTotal.toString())
    },
    [selectedTickets],
  )

  const handleCustomChange = useCallback((value: string) => {
    // Clean input to only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, "")
    setCustomAmount(cleanValue)

    // Convert to number and update selected tickets
    const numValue = cleanValue === "" ? 0 : Math.max(0, Number.parseInt(cleanValue, 10))
    setSelectedTickets(numValue)
  }, [])

  const renderPresetButtons = () => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {TICKET_PRESETS.map((preset: TicketPreset) => (
        <Button
          key={preset.value}
          onClick={() => handlePresetClick(preset.value)}
          className="h-10 rounded-lg font-semibold transition-all bg-yellow-400 text-black hover:bg-yellow-500 text-xs sm:h-12 sm:text-sm"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )

  const renderTicketSummary = () => {
    if (selectedTickets === 0) {
      return (
        <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 sm:p-4">
          <p className="text-xs text-gray-300 sm:text-sm">
            Selecciona la cantidad de tickets que deseas comprar, el mínimo obligatorio de compra es 3
          </p>
        </div>
      )
    }

    const isMinimumMet = selectedTickets >= MINIMUM_TICKETS

    return (
      <div
        className={`text-center p-3 rounded-lg border sm:p-4 ${
          isMinimumMet ? "bg-yellow-900/20 border-yellow-400" : "bg-red-900/20 border-red-400"
        }`}
      >
        <div className="space-y-2">
          <p className="text-base font-semibold text-white sm:text-lg">
            Tickets seleccionados:{" "}
            <span className={isMinimumMet ? "text-yellow-400" : "text-red-400"}>{selectedTickets}</span>
          </p>
          {!isMinimumMet && (
            <p className="text-xs text-red-400 font-medium sm:text-sm">⚠️ Mínimo requerido: {MINIMUM_TICKETS} tickets</p>
          )}
          <div className="text-xs text-gray-300 space-y-1 sm:text-sm">
            <p>Precio por ticket: {formatCurrency(ticketPrice, currency)}</p>
            <p>
              Cálculo: {selectedTickets} × {formatCurrency(ticketPrice, currency)}
            </p>
          </div>
          <p className="text-lg font-bold text-white border-t border-gray-600 pt-2 sm:text-xl">
            Total:{" "}
            <span className={isMinimumMet ? "text-yellow-400" : "text-red-400"}>
              {formatCurrency(totalAmount, currency)} {currency}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <section aria-label="Selección de tickets">
      <Card className="border-gray-600 bg-gray-800">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿Cuántos tickets quieres?</CardTitle>
          <p className="text-xs text-gray-300 sm:text-sm">Precio por ticket: {formatCurrency(ticketPrice, currency)}</p>
          <p className="text-xs text-yellow-400 font-medium">Haz clic en los botones varias veces para sumar tickets</p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {renderPresetButtons()}

          <div className="space-y-2">
            <Label htmlFor="custom-tickets" className="text-xs font-medium text-white sm:text-sm">
              O ingresa una cantidad personalizada:
            </Label>
            <Input
              id="custom-tickets"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={`Mínimo ${MINIMUM_TICKETS} tickets`}
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="h-10 text-center text-base font-semibold bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 sm:h-12 sm:text-lg"
            />
          </div>

          {selectedTickets > 0 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  setSelectedTickets(0)
                  setCustomAmount("")
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent text-xs sm:text-sm"
              >
                Reiniciar selección
              </Button>
            </div>
          )}

          {renderTicketSummary()}
        </CardContent>
      </Card>
    </section>
  )
}
