/**
 * Componente de Sección de Métodos de Pago
 * -------------------------------------------------------
 * Este componente maneja la selección de métodos de pago y muestra
 * los detalles de cuenta correspondientes para cada método.
 *
 * Funcionalidades principales:
 * - Selección visual de métodos de pago disponibles
 * - Mostrar detalles de cuenta según el método seleccionado
 * - Funcionalidad de copiar al portapapeles para datos de cuenta
 * - Diseño responsivo para móvil y desktop
 * - Integración con el contexto de pago global
 */

"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useClipboard } from "@/hooks/use-clipboard"
import { usePayment } from "@/contexts/payment-context"
import { PAYMENT_METHODS, ACCOUNT_DETAILS, type PaymentMethod } from "@/lib/utils"

export function PaymentMethodsSection() {
  // Obtener estado y funciones del contexto de pago
  const { selectedPaymentMethod, setSelectedPaymentMethod } = usePayment()

  // Hook personalizado para manejar copia al portapapeles
  const { copy, copiedField } = useClipboard()

  /**
   * Función para renderizar cada botón de método de pago
   * Crea un botón interactivo con logo y nombre del método
   * @param method - Objeto con datos del método de pago
   */
  const renderPaymentMethodButton = (method: PaymentMethod) => (
    <button
      key={method.id}
      onClick={() => setSelectedPaymentMethod(method.id)}
      className={`p-3 rounded-lg border-2 transition-all w-full sm:w-auto sm:p-4 ${
        // Estilos condicionales basados en si está seleccionado
        selectedPaymentMethod === method.id
          ? "border-yellow-400 bg-yellow-900/20" // Estilo activo
          : "border-gray-600 hover:border-yellow-400 bg-gray-800" // Estilo inactivo
      }`}
      aria-pressed={selectedPaymentMethod === method.id} // Accesibilidad
    >
      {/* Contenedor del logo con tamaño responsivo */}
      <div className="w-12 h-12 mb-2 relative mx-auto sm:w-16 sm:h-16">
        <Image
          src={method.logo || "/images/placeholder.jpg"}
          alt={`Logo de ${method.name} para sorteos millonarios`}
          fill
          className="object-contain" // Mantener proporción del logo
        />
      </div>

      {/* Nombre del método de pago */}
      <div className="text-xs font-medium text-white sm:text-sm">{method.name}</div>
    </button>
  )

  /**
   * Función para renderizar botón de copiar al portapapeles
   * Muestra icono de copia o check según el estado
   * @param text - Texto a copiar
   * @param fieldName - Nombre del campo para identificación
   */
  const renderCopyButton = (text: string, fieldName: string) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => copy(text, fieldName)}
      className="h-6 w-6 p-0 text-white hover:text-yellow-400 hover:bg-gray-700 flex-shrink-0"
    >
      {/* Mostrar check si se copió recientemente, sino mostrar icono de copia */}
      {copiedField === fieldName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )

  /**
   * Función para renderizar un campo de información de cuenta
   * Crea una fila con etiqueta, valor y botón de copia opcional
   * @param label - Etiqueta del campo
   * @param value - Valor del campo
   * @param fieldName - Nombre para identificar el campo
   * @param showCopy - Si mostrar botón de copia
   */
  const renderAccountField = (label: string, value: string, fieldName: string, showCopy = true) => (
    <div className="flex justify-between items-start gap-2 py-1">
      {/* Etiqueta del campo */}
      <span className="text-xs text-gray-300 flex-shrink-0 sm:text-sm">{label}:</span>

      {/* Contenedor del valor y botón de copia */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Valor del campo con break-all para textos largos */}
        <span className="font-medium text-white text-xs break-all sm:text-sm">{value}</span>

        {/* Botón de copia condicional */}
        {showCopy && renderCopyButton(value, fieldName)}
      </div>
    </div>
  )

  /**
   * Función principal para renderizar los detalles de cuenta
   * Muestra información específica según el método de pago seleccionado
   */
  const renderAccountDetails = () => {
    // Obtener detalles de cuenta para el método seleccionado
    const accountDetail = ACCOUNT_DETAILS[selectedPaymentMethod]
    if (!accountDetail) return null

    // Obtener información del método de pago
    const method = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)
    if (!method) return null

    return (
      <Card className="border-gray-600 bg-gray-800">
        {/* Encabezado con logo y nombre del método */}
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2 sm:text-lg">
            {/* Logo pequeño del método */}
            <div className="w-6 h-6 relative flex-shrink-0 sm:w-8 sm:h-8">
              <Image
                src={method.logo || "/images/placeholder.jpg"}
                alt={`Logo de ${method.name}`}
                fill
                className="object-contain"
              />
            </div>
            {/* Nombre truncado para espacios pequeños */}
            <span className="truncate">{method.name}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3">
          <div className="grid gap-2 sm:gap-3">
            {/* Campos específicos para Zelle (USD) */}
            {selectedPaymentMethod === "zelle" && (
              <>
                {renderAccountField("Nombre", accountDetail.name!, "Nombre")}
                {renderAccountField("Teléfono", accountDetail.phone!, "Teléfono")}
                {renderAccountField("Servicio", accountDetail.service!, "Servicio", false)}
              </>
            )}

            {/* Campos para métodos de pago chilenos (CLP) */}
            {selectedPaymentMethod !== "zelle" && (
              <>
                {/* Renderizar campos solo si existen en los datos */}
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
    <section aria-label="Métodos de pago para sorteos millonarios">
      <Card className="border-gray-600 bg-gray-800">
        {/* Encabezado de la sección */}
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿A dónde quieres transferir?</CardTitle>
          <p className="text-sm text-gray-300 sm:text-base">Selecciona una cuenta:</p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Grid responsivo de botones de métodos de pago */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-center sm:gap-4 sm:flex-wrap">
            {PAYMENT_METHODS.map(renderPaymentMethodButton)}
          </div>

          {/* Detalles de cuenta del método seleccionado */}
          {renderAccountDetails()}
        </CardContent>
      </Card>
    </section>
  )
}