/**
 * Componente de Sección de Formulario de Registro
 * -------------------------------------------------------
 * Este componente maneja todo el formulario de registro para el sorteo.
 * Incluye validación completa, subida de archivos, términos y condiciones,
 * y redirección a WhatsApp después del envío exitoso.
 */

"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateWhatsAppUrl, type FormData, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/utils"; // Import from existing utils file
import { v4 as uuidv4 } from "uuid";

export function RegistrationFormSection() {
  // Estados principales del formulario
  const [formData, setFormData] = useState<FormData>({
    buyerName: "",
    email: "",
    phone: "",
    referenceNumber: "",
    ticketCount: "0",
  });

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    },
    [validationErrors.length]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        setProofFile(null);
        return;
      }

      // Updated to use 2MB limit as per database constraint in payment_receipt_files table
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setValidationErrors([`El archivo seleccionado (${fileSizeInMB}MB) supera el límite de ${MAX_FILE_SIZE_MB}MB`]);
        setProofFile(null);
        e.target.value = "";
        toast({
          title: "Archivo demasiado grande",
          description: `El archivo seleccionado (${fileSizeInMB}MB) supera el límite de ${MAX_FILE_SIZE_MB}MB. Por favor, selecciona un archivo más pequeño.`,
          variant: "destructive",
        });
        return;
      }

      setProofFile(file);
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }

      toast({
        title: "Archivo seleccionado",
        description: `${file.name} ha sido seleccionado correctamente.`,
      });
    },
    [validationErrors.length, toast]
  );

  const handleUploadButtonClick = useCallback(() => {
    const fileInput = document.getElementById("proof") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setValidationErrors([]);

      const errors: string[] = [];
      if (!formData.buyerName.trim()) {
        errors.push("Nombre del comprador es requerido");
      }
      if (!formData.email.trim()) {
        errors.push("Email es requerido");
      }
      if (!formData.phone.trim()) {
        errors.push("Número de teléfono es requerido");
      }
      if (!formData.referenceNumber.trim()) {
        errors.push("Número de referencia es requerido");
      }

      // Lógica de validación de tickets mejorada
      const ticketCount = Number.parseInt(formData.ticketCount);
      if (isNaN(ticketCount) || ticketCount < 3) {
        errors.push("Número de tickets es requerido (mínimo 3)");
      }

      if (!proofFile) {
        errors.push("Comprobante de pago es requerido");
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsSubmitting(false);
        return;
      }

      if (!termsAccepted) {
        setValidationErrors(["Debes aceptar los términos y condiciones"]);
        setIsSubmitting(false);
        return;
      }

      const formToSend = new FormData();
      formToSend.append("nombre_comprador", formData.buyerName);
      formToSend.append("email", formData.email);
      formToSend.append("telefono", formData.phone);
      formToSend.append("numero_referencia", formData.referenceNumber);
      formToSend.append("tickets_comprados", formData.ticketCount);
      const fileExtension = proofFile!.name.split(".").pop();
      const newFileName = `${formData.referenceNumber}-${uuidv4()}.${fileExtension}`;
      formToSend.append("comprobante_pago", proofFile!, newFileName);

      try {
        const response = await fetch("/api/submit-form", {
          method: "POST",
          body: formToSend,
        });

        // 👇 FIX: leemos como texto y luego intentamos JSON.parse
        const rawText = await response.text();
        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          console.error("❌ Respuesta no es JSON, recibido:", rawText);
          setValidationErrors([
            "El servidor devolvió una respuesta inesperada. Revisa la consola del navegador para más detalles.",
          ]);
          return;
        }

        if (!response.ok) {
          console.error("Error del servidor:", data.error);
          setValidationErrors([data.error || "Error desconocido al enviar el formulario"]);
          return;
        }

        toast({
          title: "¡Registro enviado exitosamente!",
          description: "Tu participación ha sido registrada. Serás redirigido a WhatsApp para soporte.",
        });

        setFormData({
          buyerName: "",
          email: "",
          phone: "",
          referenceNumber: "",
          ticketCount: "0",
        });
        setProofFile(null);
        setTermsAccepted(false);
        setValidationErrors([]);

        // --- Mensaje dinámico para WhatsApp ---
        const whatsappMessage = `Hola, mi nombre es ${formData.buyerName}. He comprado ${formData.ticketCount} boletos. Entiendo que los tickets serán enviados en un plazo aproximado de 24 horas.`;

        const whatsappUrl = generateWhatsAppUrl("56949077188", whatsappMessage);


        const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        setTimeout(() => {
          if (isMobileOrTablet) {
            window.location.href = whatsappUrl;
          } else {
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          }
        }, 1500);
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        setValidationErrors([error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar tu solicitud."]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, toast, termsAccepted, proofFile]
  );

  const renderFormField = (id: keyof FormData, label: string, type = "text", placeholder = "", required = true) => (
    <div className="space-y-1 sm:space-y-2">
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
            const value = e.target.value.replace(/[^0-9]/g, "");
            handleInputChange(id, value);
          }}
          className="h-10 bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400 text-sm sm:h-12 sm:text-base"
        />
      ) : (
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
  );

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
            Los premios se entregarán personalmente en el lugar designado para cada sorteo. Solo realizará la entrega en la dirección proporcionada por SandovalMiguel.store
          </li>
          <li>
            La compra mínima es de (3) tickets. Los tickets se asignarán aleatoriamente y se enviarán al correo
            electrónico que nos proporciones.
          </li>
          <li>Los ganadores tienen 72 horas para reclamar su premio.</li>
          <li>
            Los ganadores aceptan y autorizan la aparición en el material audiovisual del sorteo de SandovalMiguel.store, incluyendo su presencia en redes sociales y la entrega del premio. Esta condición es obligatoria.
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
  );

  return (
    <section aria-label="Formulario de registro para sorteo de millones">
      <Card className="border-gray-600 bg-gray-800">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">¿Ya transferiste?</CardTitle>
          <p className="text-sm text-gray-300 sm:text-base">Llena este formulario:</p>
        </CardHeader>
        <CardContent>
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-400 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    {validationErrors.length === 1 ? "Error encontrado:" : "Errores encontrados:"}
                  </h4>
                  <ul className="text-xs text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
            {renderFormField("buyerName", "Nombre del comprador", "text", "Ingresa tu nombre completo")}
            {renderFormField("email", "Email", "email", "tu@email.com")}
            {renderFormField("phone", "Número de teléfono", "tel", "+56 9 1234 5678")}
            {renderFormField(
              "referenceNumber",
              "Número de referencia",
              "text",
              "Ingresa el número de referencia de tu transferencia"
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
                <input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
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
                    <span className="truncate max-w-[120px] sm:max-w-[180px]" title={proofFile.name}>
                      {proofFile.name}
                    </span>
                    <span className="text-gray-400 text-xs">({(proofFile.size / (1024 * 1024)).toFixed(1)}MB)</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-red-400">{`Este campo es obligatorio. Tamaño máximo: ${MAX_FILE_SIZE_MB}MB`}</p>
            </div>
            {renderFormField("ticketCount", "Número de tickets", "text", "Mínimo 3 tickets")}
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
  );
}
