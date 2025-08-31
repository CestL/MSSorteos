/**
 * Custom Hook for Clipboard Operations
 * -------------------------------------------------------
 * Manages clipboard copy operations with state
 */

"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/lib/utils"

export function useClipboard() {
  const [copiedField, setCopiedField] = useState<string>("")
  const { toast } = useToast()

  const copy = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text)

    if (success) {
      setCopiedField(fieldName)
      toast({
        title: "Copiado",
        description: `${fieldName} copiado al portapapeles`,
      })
      setTimeout(() => setCopiedField(""), 2000)
    } else {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  return { copy, copiedField }
}
