/**
 * Registration Form Section Component
 * -------------------------------------------------------
 * Clean registration form with updated terms and conditions
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
import { AlertTriangle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { validateFormData } from "@/lib/utils"
import type { FormData } from "@/lib/types"

export function RegistrationFormSection() {
  const [formData, setFormData] = useState<FormData>({
    buyerName: "",
    email: "",
    phone: "",
    referenceNumber: "",
    ticketCount: "0",
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const maxFileSize = 3 * 1024 * 1024; // 3 MB en bytes

    // Validación de tamaño en el frontend
    if (file && file.size > maxFileSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El comprobante de pago no puede superar los 3 MB.",
        variant: "destructive",
      })
      setProofFile(null)
      e.target.value = ''
      return
    }

    setProofFile(file || null)
  }, [toast])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      // Paso 1: Validaciones del formulario.
      const errors = validateFormData(formData)
      if (errors.length > 0) {
        toast({
          title: "Campos requeridos",
          description: errors.join(", "),
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!proofFile) {
        toast({
          title: "Comprobante requerido",
          description: "Debes subir un comprobante de pago para continuar",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!termsAccepted) {
        toast({
          title: "Términos y condiciones",
          description: "Debes aceptar los términos y condiciones para continuar",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      
      // Lógica de envío real al backend.
      const formToSend = new FormData()
      
      // Paso 2: Asegúrate de que los nombres de los campos coincidan con los de tu backend.
      // Aquí mapeamos los nombres del estado a los nombres de las columnas en Supabase.
      formToSend.append('nombre_comprador', formData.buyerName)
      formToSend.append('email', formData.email)
      formToSend.append('telefono', formData.phone)
      formToSend.append('numero_referencia', formData.referenceNumber)
      formToSend.append('tickets_comprados', formData.ticketCount)
      
      // El nombre del campo 'comprobante_pago' debe coincidir con el del backend.
      formToSend.append('comprobante_pago', proofFile)

      try {
        // Paso 3: Realizamos la llamada a la API Route.
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          body: formToSend,
        })
        
        const data = await response.json()

        if (!response.ok) {
          // Si la respuesta no es OK, significa que hubo un error.
          throw new Error(data.error || 'Error desconocido al enviar el formulario.')
        }

        // Paso 4: Si la respuesta es exitosa, mostramos un mensaje de éxito
        // y reseteamos el formulario.
        toast({
          title: "Registro enviado",
          description: "Tu participación ha sido registrada exitosamente",
        })
        
        setFormData({
          buyerName: "",
          email: "",
          phone: "",
          referenceNumber: "",
          ticketCount: "0",
        })
        setProofFile(null)
        setTermsAccepted(false)

      } catch (error) {
        // Paso 5: Manejamos cualquier error que ocurra durante la llamada.
        console.error('Error al enviar el formulario:', error)
        toast({
          title: "Error en el registro",
          description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
          variant: "destructive",
        })
      } finally {
        // Paso 6: Independientemente del resultado, desactivamos el estado de envío.
        setIsSubmitting(false)
      }
    },
    [formData, toast, termsAccepted, proofFile],
  )

  const renderFormField = (id: keyof FormData, label: string, type = "text", placeholder = "", required = true) => (
    <div className="space-y-1 sm:space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-white sm:text-sm">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={formData[id]}
        onChange={(e) => handleInputChange(id, e.target.value)}
        required={required}
        className="h-10 bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 text-sm sm:h-12 sm:text-base"
      />
    </div>
  )

  const renderTermsAndConditions = () => (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base font-bold text-white sm:text-lg">Términos y Condiciones</h3>
      <div className="text-xs text-gray-300 space-y-2 sm:text-sm sm:space-y-3">
        <p className="font-semibold text-red-400">DEBES TENER MÁS DE 18 AÑOS PARA PARTICIPAR</p>
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
    <section aria-label="Formulario de registro">
      <Card className="border-gray-600 bg-gray-800">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿Ya transferiste?</CardTitle>
          <p className="text-sm text-gray-300 sm:text-base">Llena este formulario:</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {renderFormField("buyerName", "Nombre del comprador", "text", "Ingresa tu nombre completo")}
            {renderFormField("email", "Email", "email", "tu@email.com")}
            {renderFormField("phone", "Número de teléfono", "tel", "+56 9 1234 5678")}
            {renderFormField(
              "referenceNumber",
              "Número de referencia",
              "text",
              "Ingresa el número de referencia de tu transferencia",
            )}

            <div className="flex items-start gap-2 p-2 bg-yellow-900/20 border border-yellow-400 rounded-lg sm:p-3">
              <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0 sm:h-4 sm:w-4" />
              <p className="text-xs text-yellow-100 sm:text-sm">
                Número de referencia que no coincida con el comprobante será rechazado. Debe agregar la referencia
                completa.
              </p>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="proof" className="text-xs font-medium text-white sm:text-sm">
                Comprobante de pago <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-2 sm:gap-3">
                <Input id="proof" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("proof")?.click()}
                  className="flex items-center gap-1 border-gray-600 text-white hover:bg-gray-700 bg-transparent text-xs sm:gap-2 sm:text-sm"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  Subir comprobante
                </Button>
                {proofFile && <span className="text-xs text-green-400 truncate sm:text-sm">✓ {proofFile.name}</span>}
              </div>
              <p className="text-xs text-red-400">Este campo es obligatorio</p>
            </div>

            {renderFormField("ticketCount", "Número de tickets", "number", "0")}

            <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 border border-yellow-400 rounded-lg sm:space-x-3 sm:p-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-0.5 sm:mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="terms" className="text-xs text-white cursor-pointer sm:text-sm">
                  Acepto los{" "}
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
                      <ScrollArea className="h-[60vh] pr-2 sm:pr-4">{renderTermsAndConditions()}</ScrollArea>
                    </DialogContent>
                  </Dialog>{" "}
                  <span className="text-red-400">*</span>
                </Label>
              </div>
            </div>

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