/**
 * Hook Personalizado para Operaciones de Portapapeles
 * -------------------------------------------------------
 * Este hook maneja la funcionalidad de copiar texto al portapapeles
 * con feedback visual y notificaciones para el usuario.
 * NO utiliza alerts del navegador, solo notificaciones toast personalizadas.
 *
 * Funcionalidades:
 * - Copia de texto al portapapeles usando la API moderna
 * - Estado de seguimiento para mostrar feedback visual
 * - Notificaciones toast para confirmar acciones
 * - Auto-reset del estado después de un tiempo determinado
 */

"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/lib/utils"

/**
 * Hook personalizado para manejar operaciones de portapapeles
 * @returns Objeto con función copy y estado copiedField
 */
export function useClipboard() {
  // Estado para rastrear qué campo fue copiado recientemente
  // Se usa para mostrar feedback visual (ej: cambiar icono a check)
  const [copiedField, setCopiedField] = useState<string>("")

  // Hook para mostrar notificaciones toast (NO alerts del navegador)
  const { toast } = useToast()

  /**
   * Función principal para copiar texto al portapapeles
   * Maneja la copia, feedback visual y notificaciones SIN usar alert()
   * @param text - Texto a copiar al portapapeles
   * @param fieldName - Nombre del campo para identificación y feedback
   */
  const copy = async (text: string, fieldName: string) => {
    // Intentar copiar usando la función utilitaria
    const success = await copyToClipboard(text)

    if (success) {
      // Si la copia fue exitosa:

      // 1. Establecer el campo como copiado para feedback visual
      setCopiedField(fieldName)

      // 2. Mostrar notificación de éxito usando toast (NO alert)
      toast({
        title: "Copiado",
        description: `${fieldName} copiado al portapapeles`,
      })

      // 3. Auto-reset del estado después de 2 segundos
      // Esto permite que el icono vuelva a su estado normal
      setTimeout(() => setCopiedField(""), 2000)
    } else {
      // Si la copia falló, mostrar notificación de error usando toast (NO alert)
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  // Retornar función y estado para uso en componentes
  return { copy, copiedField }
}
