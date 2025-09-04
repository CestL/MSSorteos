/**
 * Componente de Sección de Formulario de Registro
 * -------------------------------------------------------
 * Este componente maneja todo el formulario de registro para el sorteo.
 * Incluye validación completa, subida de archivos, términos y condiciones,
 * y redirección a WhatsApp después del envío exitoso.
 *
 * Funcionalidades principales:
 * - Validación de campos obligatorios en tiempo real
 * - Subida y validación de comprobantes de pago (máximo 3MB)
 * - Aceptación de términos y condiciones
 * - Envío de datos a la API y manejo de respuestas
 * - Redirección automática a WhatsApp tras envío exitoso
 * - Sistema de notificaciones personalizado (sin alerts del navegador)
 */

"use client"

import type React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateWhatsAppUrl } from "@/lib/utils"
import type { FormData } from "@/lib/types"

export function RegistrationFormSection() {
  // Estados principales del formulario
  // Almacena todos los datos del formulario en un objeto
  const [formData, setFormData] = useState<FormData>({
    buyerName: "",
    email: "",
    phone: "",
    referenceNumber: "",
    ticketCount: "0",
  })

  // Estado para el archivo de comprobante de pago
  const [proofFile, setProofFile] = useState<File | null>(null)

  // Estado para controlar si los términos y condiciones fueron aceptados
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Estado para controlar la visibilidad del modal de términos y condiciones
  const [showTermsDialog, setShowTermsDialog] = useState(false)

  // Estado para controlar el estado de envío del formulario (loading)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para almacenar errores de validación específicos
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Hook para mostrar notificaciones toast
  const { toast } = useToast()

  /**
   * Función para manejar cambios en los campos de entrada del formulario
   * Se ejecuta cada vez que el usuario escribe en cualquier campo
   * @param field - El campo específico que está siendo modificado
   * @param value - El nuevo valor del campo
   */
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      // Actualizar el estado del formulario con el nuevo valor
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Limpiar errores de validación cuando el usuario empiece a escribir
      // Esto mejora la experiencia del usuario al dar feedback inmediato
      if (validationErrors.length > 0) {
        setValidationErrors([])
      }
    },
    [validationErrors.length],
  )

  /**
   * Función para manejar la selección y validación de archivos
   * Valida el tamaño del archivo y muestra errores apropiados
   * @param e - Evento de cambio del input de archivo
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Obtener el primer archivo seleccionado
      const file = e.target.files?.[0]

      // Definir el tamaño máximo permitido (3 MB en bytes)
      const maxFileSize = 3 * 1024 * 1024 // 3 MB = 3 * 1024 * 1024 bytes

      if (file && file.size > maxFileSize) {
        // Calcular el tamaño del archivo en MB para mostrar al usuario
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2)

        // Crear mensaje de error detallado y agregarlo a la lista de errores
        const errorMessage = `El archivo seleccionado (${fileSizeInMB}MB) supera el límite de 3MB`
        setValidationErrors([errorMessage])

        // Limpiar el archivo seleccionado para prevenir envío
        setProofFile(null)

        // Resetear el valor del input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = ""

        // Mostrar notificación toast para mejor experiencia de usuario
        toast({
          title: "Archivo demasiado grande",
          description: `El archivo seleccionado (${fileSizeInMB}MB) supera el límite de 3MB. Por favor, selecciona un archivo más pequeño.`,
          variant: "destructive",
        })
        return
      }

      // Si el archivo es válido, guardarlo en el estado
      setProofFile(file || null)

      if (validationErrors.length > 0) {
        setValidationErrors([])
      }

      if (file) {
        toast({
          title: "Archivo seleccionado",
          description: `${file.name} ha sido seleccionado correctamente.`,
        })
      }
    },
    [validationErrors.length, toast],
  )

  /**
   * Función para activar el input de archivo oculto cuando se hace clic en el botón
   * Garantiza que la selección de archivos funcione correctamente
   */
  const handleUploadButtonClick = useCallback(() => {
    const fileInput = document.getElementById("proof") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }, [])

  /**
   * Función principal para manejar el envío del formulario
   * Realiza validación completa, envía datos al servidor y maneja respuestas
   * @param e - Evento de envío del formulario
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      // Prevenir el comportamiento por defecto del formulario
      e.preventDefault()

      // Activar estado de envío (loading)
      setIsSubmitting(true)

      // Limpiar errores previos
      setValidationErrors([])

      const errors: string[] = []

      // Validación de campos de texto obligatorios específicos
      if (!formData.buyerName.trim()) {
        errors.push("Nombre del comprador es requerido")
      }
      if (!formData.email.trim()) {
        errors.push("Email es requerido")
      }
      if (!formData.phone.trim()) {
        errors.push("Número de teléfono es requerido")
      }
      if (!formData.referenceNumber.trim()) {
        errors.push("Número de referencia es requerido")
      }

      const ticketCount = Number.parseInt(formData.ticketCount) || 0
      if (ticketCount < 3) {
        errors.push("Número de tickets es requerido (mínimo 3)")
      }

      // Validación del archivo de comprobante
      if (!proofFile) {
        errors.push("Comprobante de pago es requerido")
      }

      // Si hay errores, mostrarlos y detener el envío
      if (errors.length > 0) {
        // Establecer errores en el estado para mostrar en la UI
        setValidationErrors(errors)

        // Desactivar estado de envío
        setIsSubmitting(false)
        return
      }

      if (!termsAccepted) {
        setValidationErrors(["Debes aceptar los términos y condiciones"])
        setIsSubmitting(false)
        return
      }

      // Preparar datos para envío al servidor
      // Crear FormData para envío multipart (necesario para archivos)
      const formToSend = new FormData()

      // Mapear los nombres del estado a los nombres esperados por el backend
      formToSend.append("nombre_comprador", formData.buyerName)
      formToSend.append("email", formData.email)
      formToSend.append("telefono", formData.phone)
      formToSend.append("numero_referencia", formData.referenceNumber)
      formToSend.append("tickets_comprados", formData.ticketCount)

      // Agregar el archivo de comprobante
      formToSend.append("comprobante_pago", proofFile!)

      try {
        // Realizar llamada HTTP al endpoint de la API
        const response = await fetch("/api/submit-form", {
          method: "POST",
          body: formToSend,
        })

        // Parsear la respuesta JSON
        const data = await response.json()

        // Manejar respuesta del servidor
        if (!response.ok) {
          if (
            data.error &&
            data.error.includes('duplicate key value violates unique constraint "Formularios_email_key"')
          ) {
            setValidationErrors(["Este email ya está registrado. Por favor, utiliza un email diferente."])
          } else {
            // Si la respuesta no es exitosa, mostrar error en la caja de notificación
            setValidationErrors([data.error || "Error desconocido al enviar el formulario"])
          }
          setIsSubmitting(false)
          return
        }

        // Envío exitoso - mostrar mensaje y resetear formulario
        toast({
          title: "¡Registro enviado exitosamente!",
          description: "Tu participación ha sido registrada. Serás redirigido a WhatsApp para soporte.",
        })

        // Resetear todos los estados del formulario
        setFormData({
          buyerName: "",
          email: "",
          phone: "",
          referenceNumber: "",
          ticketCount: "0",
        })
        setProofFile(null)
        setTermsAccepted(false)
        setValidationErrors([])

        const whatsappMessage =
          "Gracias por comunicarte con Soporte de Sorteo de Sandoval Miguel; En el transcurso de la próximas 24 horas recibirás los números hacia el correo registrado Gracias por su compra, le deseamos MUCHA SUERTE..."
        const whatsappUrl = generateWhatsAppUrl("56949077188", whatsappMessage)

        // Detectar si es dispositivo móvil o tablet para redirección directa
        const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )

        // Delay para que el usuario vea el mensaje de éxito antes de la redirección
        setTimeout(() => {
          if (isMobileOrTablet) {
            // En dispositivos móviles/tablets, usar window.location.href para redirección directa
            window.location.href = whatsappUrl
          } else {
            // En desktop, mantener comportamiento original con nueva pestaña
            window.open(whatsappUrl, "_blank", "noopener,noreferrer")
          }
        }, 1500)
      } catch (error) {
        // Manejo de errores durante el envío
        console.error("Error al enviar el formulario:", error)
        setValidationErrors([
          error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar tu solicitud.",
        ])
      } finally {
        // Siempre desactivar el estado de envío al final
        setIsSubmitting(false)
      }
    },
    [formData, toast, termsAccepted, proofFile],
  )

  /**
   * Función helper para renderizar campos de formulario de manera consistente
   * IMPORTANTE: noValidate desactiva la validación HTML5 del navegador
   * @param id - Identificador único del campo
   * @param label - Etiqueta visible del campo
   * @param type - Tipo de input HTML
   * @param placeholder - Texto de placeholder
   * @param required - Si el campo es obligatorio
   */
  const renderFormField = (id: keyof FormData, label: string, type = "text", placeholder = "", required = true) => (
    <div className="space-y-1 sm:space-y-2">
      {/* Etiqueta del campo con indicador de obligatorio */}
      <Label htmlFor={id} className="text-xs font-medium text-white sm:text-sm">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>

      {id === "ticketCount" ? (
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={formData[id]}
          onChange={(e) => {
            // Solo permitir números en el campo de tickets
            const value = e.target.value.replace(/[^0-9]/g, "")
            handleInputChange(id, value)
          }}
          className="h-10 bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 text-sm sm:h-12 sm:text-base"
        />
      ) : (
        /* Campo de entrada con estilos responsivos y validación desactivada */
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={formData[id]}
          onChange={(e) => handleInputChange(id, e.target.value)}
          className="h-10 bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 text-sm sm:h-12 sm:text-base"
        />
      )}
    </div>
  )

  /**
   * Función para renderizar el contenido completo de términos y condiciones
   * Contiene todas las reglas y condiciones del sorteo
   */
  const renderTermsAndConditions = () => (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base font-bold text-white sm:text-lg">Términos y Condiciones</h3>
      <div className="text-xs text-gray-300 space-y-2 sm:text-sm sm:space-y-3">
        {/* Advertencia principal sobre edad mínima */}
        <p className="font-semibold text-red-400">DEBES TENER MÁS DE 18 AÑOS PARA PARTICIPAR</p>

        {/* Lista numerada de términos y condiciones */}
        <ol className="list-decimal list-inside space-y-1 sm:space-y-2">
          <li>La cantidad de números disponibles se detallan en la página de información específica de cada sorteo.</li>
          <li>Los tickets se enviarán en un plazo máximo de 24 horas.</li>
          <li>Solo pueden participar personas naturales mayores de 18 años.</li>
          <li>
            Los premios se entregarán personalmente en el lugar designado para cada sorteo. Solo realizará la entrega en
            la dirección proporcionada por rifasmiguelsandoval.com
          </li>
          <li>
            La compra mínima es de (3) tickets. Los tickets se asignarán aleatoriamente y se enviarán al correo
            electrónico que nos proporciones.
          </li>
          <li>Los ganadores tienen 72 horas para reclamar su premio.</li>
          <li>
            Los ganadores aceptan y autorizan la aparición en el material audiovisual del sorteo de
            Rifasmiguelsandoval.com, incluyendo su presencia en redes sociales y la entrega del premio. Esta condición
            es obligatoria.
          </li>
          <li>
            Debe transferir el monto exacto, no se realizan reembolsos por montos erróneos; de haber una diferencia, se
            realizará el reembolso solamente con tickets.
          </li>
          <li>
            Me comprometo a poner el número correcto de tickets comprados sino tendrá que volver a generar un
            formulario.
          </li>
        </ol>
      </div>
    </div>
  )

  return (
    <section aria-label="Formulario de registro para sorteo de millones">
      <Card className="border-gray-600 bg-gray-800">
        {/* Encabezado de la sección */}
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿Ya transferiste?</CardTitle>
          <p className="text-sm text-gray-300 sm:text-base">Llena este formulario:</p>
        </CardHeader>

        <CardContent>
          {/* Mostrar errores de validación si existen - REEMPLAZA TODOS LOS ALERTS */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-400 rounded-lg">
              <div className="flex items-start gap-2">
                {/* Icono de alerta */}
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  {/* Título del error */}
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    {validationErrors.length === 1 ? "Error encontrado:" : "Errores encontrados:"}
                  </h4>
                  {/* Lista de errores específicos */}
                  <ul className="text-xs text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Formulario principal con validación HTML5 desactivada */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
            {/* Campos del formulario usando la función helper */}
            {renderFormField("buyerName", "Nombre del comprador", "text", "Ingresa tu nombre completo")}
            {renderFormField("email", "Email", "email", "tu@email.com")}
            {renderFormField("phone", "Número de teléfono", "tel", "+56 9 1234 5678")}
            {renderFormField(
              "referenceNumber",
              "Número de referencia",
              "text",
              "Ingresa el número de referencia de tu transferencia",
            )}

            {/* Advertencia sobre número de referencia */}
            <div className="flex items-start gap-2 p-2 bg-yellow-900/20 border border-yellow-400 rounded-lg sm:p-3">
              <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0 sm:h-4 sm:w-4" />
              <p className="text-xs text-yellow-100 sm:text-sm">
                Número de referencia que no coincida con el comprobante será rechazado. Debe agregar la referencia
                completa.
              </p>
            </div>

            {/* Sección de subida de comprobante de pago */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="proof" className="text-xs font-medium text-white sm:text-sm">
                Comprobante de pago <span className="text-red-400">*</span>
              </Label>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Input de archivo oculto */}
                <Input id="proof" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadButtonClick}
                  className="flex items-center gap-1 border-gray-600 text-white hover:bg-gray-700 bg-transparent text-xs sm:gap-2 sm:text-sm"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  Subir comprobante
                </Button>

                {proofFile && (
                  <div className="flex items-center gap-1 text-xs text-green-400 sm:text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="truncate max-w-[150px] sm:max-w-[200px]" title={proofFile.name}>
                      {proofFile.name}
                    </span>
                    <span className="text-gray-400">({(proofFile.size / (1024 * 1024)).toFixed(2)}MB)</span>
                  </div>
                )}
              </div>

              {/* Información sobre requisitos del archivo */}
              <p className="text-xs text-red-400">Este campo es obligatorio. Tamaño máximo: 3MB</p>
            </div>

            {/* Campo de número de tickets */}
            {renderFormField("ticketCount", "Número de tickets", "text", "Mínimo 3 tickets")}

            {/* Sección de términos y condiciones */}
            <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 border border-yellow-400 rounded-lg sm:space-x-3 sm:p-4">
              {/* Checkbox para aceptar términos */}
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-0.5 sm:mt-1"
              />

              <div className="flex-1 min-w-0">
                <Label htmlFor="terms" className="text-xs text-white cursor-pointer sm:text-sm">
                  Acepto los {/* Modal de términos y condiciones */}
                  <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="underline text-yellow-400 hover:text-yellow-300 font-medium"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        términos y condiciones
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[85vh] bg-gray-800 border-gray-600 sm:max-w-2xl sm:max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="text-white text-base sm:text-lg">Términos y Condiciones</DialogTitle>
                      </DialogHeader>
                      {/* Área scrolleable para términos largos */}
                      <ScrollArea className="h-[60vh] pr-2 sm:pr-4">{renderTermsAndConditions()}</ScrollArea>
                    </DialogContent>
                  </Dialog>{" "}
                  <span className="text-red-400">*</span>
                </Label>
              </div>
            </div>

            {/* Botón de envío del formulario */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 text-sm sm:py-3 sm:text-base"
            >
              {isSubmitting ? "Enviando..." : "Prueba tu suerte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
