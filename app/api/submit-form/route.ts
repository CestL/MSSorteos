/**
 * API Route para Envío de Formulario de Registro
 * -------------------------------------------------------
 * Este endpoint maneja el procesamiento completo del formulario de registro.
 * Incluye validación, subida de archivos y almacenamiento en base de datos.
 *
 * Funcionalidades principales:
 * - Validación exhaustiva de datos del formulario
 * - Subida segura de comprobantes de pago a Supabase Storage
 * - Inserción de datos en la base de datos
 * - Manejo robusto de errores y rollback
 * - Validación de tamaño de archivos (límite 3MB)
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

/**
 * PASO 1: Inicialización del cliente de Supabase
 * Utiliza la clave de rol de servicio para permisos de administrador
 * Es seguro porque solo se ejecuta en el servidor (no expuesto al cliente)
 */
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * Función principal que maneja las solicitudes HTTP POST
 * Procesa el formulario completo desde validación hasta almacenamiento
 * @param request - Objeto NextRequest con los datos del formulario
 * @returns NextResponse con resultado de la operación
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * PASO 2: Extracción y validación inicial de datos del formulario
     * FormData permite manejar tanto texto como archivos en una sola request
     */
    const formData = await request.formData()

    // Extraer todos los campos del formulario
    const nombreComprador = formData.get("nombre_comprador") as string
    const email = formData.get("email") as string
    const telefono = formData.get("telefono") as string
    const numeroReferencia = formData.get("numero_referencia") as string
    const ticketsComprados = formData.get("tickets_comprados") as string
    const comprobantePago = formData.get("comprobante_pago") as File

    /**
     * PASO 3: Validación exhaustiva de campos obligatorios
     * Cada campo se valida individualmente para mensajes de error específicos
     */

    // Validar nombre del comprador
    if (!nombreComprador?.trim()) {
      return NextResponse.json({ error: "Nombre del comprador es requerido." }, { status: 400 })
    }

    // Validar email
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email es requerido." }, { status: 400 })
    }

    // Validar teléfono
    if (!telefono?.trim()) {
      return NextResponse.json({ error: "Número de teléfono es requerido." }, { status: 400 })
    }

    // Validar número de referencia
    if (!numeroReferencia?.trim()) {
      return NextResponse.json({ error: "Número de referencia es requerido." }, { status: 400 })
    }

    // Validar cantidad de tickets
    if (!ticketsComprados || ticketsComprados === "0") {
      return NextResponse.json({ error: "Número de tickets debe ser mayor a 0." }, { status: 400 })
    }

    /**
     * PASO 4: Validación específica del archivo de comprobante
     * Incluye verificación de existencia y límite de tamaño
     */
    const maxFileSize = 3 * 1024 * 1024 // 3 MB en bytes (3 * 1024 * 1024)

    // Verificar que el archivo existe
    if (!comprobantePago || comprobantePago.size === 0) {
      return NextResponse.json({ error: "Comprobante de pago es un campo requerido." }, { status: 400 })
    }

    // Verificar límite de tamaño (validación reforzada en backend)
    if (comprobantePago.size > maxFileSize) {
      return NextResponse.json(
        {
          error: "El comprobante de pago no puede superar los 3 MB. Por favor, selecciona un archivo más pequeño.",
        },
        { status: 400 },
      )
    }

    /**
     * PASO 5: Subida del archivo a Supabase Storage
     * Genera nombre único para evitar conflictos y organizar archivos
     */

    // Extraer extensión del archivo original
    const fileExtension = comprobantePago.name.split(".").pop()

    // Generar nombre único usando UUID + extensión original
    const fileName = `${uuidv4()}.${fileExtension}`

    // Subir archivo al bucket 'comprobantes' en Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(fileName, comprobantePago, {
        cacheControl: "3600", // Cache por 1 hora
        upsert: false, // No sobrescribir si existe
      })

    // Manejar errores de subida
    if (uploadError) {
      console.error("Error al subir archivo:", uploadError.message)
      return NextResponse.json({ error: "Error al subir el comprobante de pago." }, { status: 500 })
    }

    /**
     * PASO 6: Construcción de URL pública del archivo
     * Permite acceso directo al archivo subido desde la aplicación
     */
    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/comprobantes/${fileName}`

    /**
     * PASO 7: Inserción de datos en la base de datos
     * Almacena toda la información del registro incluyendo la URL del comprobante
     */
    const { data: insertData, error: insertError } = await supabase.from("Contactos").insert({
      nombre_comprador: nombreComprador,
      email: email,
      telefono: telefono,
      numero_referencia: numeroReferencia,
      tickets_comprados: Number.parseInt(ticketsComprados), // Convertir a número
      comprobante_pago_url: fileUrl,
    })

    /**
     * PASO 8: Manejo de errores de base de datos con rollback
     * Si falla la inserción, eliminar el archivo subido para mantener consistencia
     */
    if (insertError) {
      console.error("Error al insertar en la base de datos:", insertError.message)

      // Rollback: eliminar archivo subido si falla la inserción
      await supabase.storage.from("comprobantes").remove([fileName])

      return NextResponse.json({ error: "Error al registrar la información del contacto." }, { status: 500 })
    }

    /**
     * PASO 9: Respuesta exitosa
     * Confirmar que todo el proceso se completó correctamente
     */
    return NextResponse.json(
      {
        message: "Formulario enviado y archivo subido con éxito.",
        data: insertData,
      },
      { status: 200 },
    )
  } catch (error) {
    /**
     * PASO 10: Manejo de errores inesperados
     * Captura cualquier error no manejado en el proceso
     */
    console.error("Error inesperado en la API Route:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
