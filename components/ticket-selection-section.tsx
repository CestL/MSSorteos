/**
 * Componente de Sección de Selección de Tickets
 * -------------------------------------------------------
 * Este componente maneja la selección de cantidad de tickets para el sorteo.
 * Incluye botones preestablecidos, entrada personalizada y cálculo de precios.
 *
 * Funcionalidades principales:
 * - Botones de cantidad preestablecida que se suman al total
 * - Campo de entrada personalizada para cantidades específicas
 * - Cálculo automático de precios según método de pago y moneda
 * - Validación de cantidad mínima de tickets
 * - Diseño responsivo y feedback visual
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayment } from "@/contexts/payment-context"
import { TICKET_PRICES, TICKET_PRESETS, MINIMUM_TICKETS, PAYMENT_METHODS, formatCurrency, type TicketPreset } from "@/lib/utils"

export function TicketSelectionSection() {
  // Obtener método de pago seleccionado del contexto global
  const { selectedPaymentMethod } = usePayment()

  // Estados locales del componente
  const [selectedTickets, setSelectedTickets] = useState<number>(0) // Cantidad total de tickets
  const [customAmount, setCustomAmount] = useState<string>("") // Valor del campo personalizado
  const [totalAmount, setTotalAmount] = useState<number>(0) // Monto total calculado

  // Obtener información del método de pago actual
  const currentPaymentMethod = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)
  const currency = currentPaymentMethod?.currency || "CLP" // Moneda por defecto CLP
  const ticketPrice = TICKET_PRICES[currency] // Precio por ticket según moneda

  /**
   * Effect para actualizar el monto total cuando cambian los tickets o método de pago
   * Se ejecuta automáticamente cuando selectedTickets o ticketPrice cambian
   */
  useEffect(() => {
    // Calcular monto total: cantidad de tickets × precio por ticket
    setTotalAmount(selectedTickets * ticketPrice)
  }, [selectedTickets, ticketPrice])

  /**
   * Función para manejar clics en botones de cantidad preestablecida
   * Suma la cantidad del botón al total actual (comportamiento acumulativo)
   * @param amount - Cantidad de tickets a agregar
   */
  const handlePresetClick = useCallback(
    (amount: number) => {
      // Sumar la cantidad al total actual
      const newTotal = selectedTickets + amount
      setSelectedTickets(newTotal)

      // Actualizar también el campo personalizado para mantener sincronización
      setCustomAmount(newTotal.toString())
    },
    [selectedTickets],
  )

  /**
   * Función para manejar cambios en el campo de entrada personalizada
   * Valida y limpia la entrada para permitir solo números
   * @param value - Valor ingresado por el usuario
   */
  const handleCustomChange = useCallback((value: string) => {
    // Limpiar entrada: remover todo excepto números
    const cleanValue = value.replace(/[^0-9]/g, "")

    // Actualizar el valor mostrado en el campo
    setCustomAmount(cleanValue)

    // Convertir a número y validar (mínimo 0)
    const numValue = cleanValue === "" ? 0 : Math.max(0, Number.parseInt(cleanValue, 10))

    // Actualizar cantidad de tickets seleccionados
    setSelectedTickets(numValue)
  }, [])

  /**
   * Función para renderizar los botones de cantidades preestablecidas
   * Crea una grilla responsiva de botones con las cantidades más comunes
   */
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

  /**
   * Función para renderizar el resumen de tickets seleccionados
   * Muestra información detallada sobre la selección actual y validaciones
   */
  const renderTicketSummary = () => {
    // Si no hay tickets seleccionados, mostrar mensaje informativo
    if (selectedTickets === 0) {
      return (
        <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 sm:p-4">
          <p className="text-xs text-gray-300 sm:text-sm">
            Selecciona la cantidad de tickets que deseas comprar para participar en el sorteo de millones. El mínimo
            obligatorio de compra es {MINIMUM_TICKETS} tickets.
          </p>
        </div>
      )
    }

    // Verificar si se cumple el mínimo requerido
    const isMinimumMet = selectedTickets >= MINIMUM_TICKETS

    return (
      <div
        className={`text-center p-3 rounded-lg border sm:p-4 ${
          // Estilos condicionales según si se cumple el mínimo
          isMinimumMet ? "bg-yellow-900/20 border-yellow-400" : "bg-red-900/20 border-red-400"
        }`}
      >
        <div className="space-y-2">
          {/* Cantidad de tickets seleccionados */}
          <p className="text-base font-semibold text-white sm:text-lg">
            Tickets seleccionados:{" "}
            <span className={isMinimumMet ? "text-yellow-400" : "text-red-400"}>{selectedTickets}</span>
          </p>

          {/* Advertencia si no se cumple el mínimo */}
          {!isMinimumMet && (
            <p className="text-xs text-red-400 font-medium sm:text-sm">⚠️ Mínimo requerido: {MINIMUM_TICKETS} tickets</p>
          )}

          {/* Detalles del cálculo */}
          <div className="text-xs text-gray-300 space-y-1 sm:text-sm">
            <p>Precio por ticket: {formatCurrency(ticketPrice, currency)}</p>
            <p>
              Cálculo: {selectedTickets} × {formatCurrency(ticketPrice, currency)}
            </p>
          </div>

          {/* Total a pagar */}
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
    <section aria-label="Selección de tickets para sorteo de millones">
      <Card className="border-gray-600 bg-gray-800">
        {/* Encabezado de la sección */}
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿Cuántos tickets quieres?</CardTitle>
          <p className="text-xs text-gray-300 sm:text-sm">Precio por ticket: {formatCurrency(ticketPrice, currency)}</p>
          <p className="text-xs text-yellow-400 font-medium">Haz clic en los botones varias veces para sumar tickets</p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Botones de cantidades preestablecidas */}
          {renderPresetButtons()}

          {/* Campo de entrada personalizada */}
          <div className="space-y-2">
            <Label htmlFor="custom-tickets" className="text-xs font-medium text-white sm:text-sm">
              O ingresa una cantidad personalizada:
            </Label>
            <Input
              id="custom-tickets"
              type="text"
              inputMode="numeric" // Teclado numérico en móviles
              pattern="[0-9]*" // Patrón para validación HTML5
              placeholder={`Mínimo ${MINIMUM_TICKETS} tickets`}
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="h-10 text-center text-base font-semibold bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 sm:h-12 sm:text-lg"
            />
          </div>

          {/* Botón para reiniciar selección */}
          {selectedTickets > 0 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  // Resetear todos los estados relacionados con la selección
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

          {/* Resumen de tickets seleccionados */}
          {renderTicketSummary()}
        </CardContent>
      </Card>
    </section>
  )
}