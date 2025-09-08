/**
 * API Route para Envío de Formulario de Registro
 * -------------------------------------------------------
 * Este endpoint maneja el procesamiento completo del formulario de registro.
 * Incluye validación, subida de archivos y almacenamiento en base de datos.
 *
 * Funcionalidades principales:
 * - Validación exhaustiva de datos del formulario
<<<<<<< Updated upstream
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
=======
 * - Subida segura de comprobantes de pago a Supabase Storage (bucket receipts)
 * - Inserción de datos en las tablas 'forms' y 'form_files' (esquema simplificado de DATABASE_GUIDE.md)
 * - Manejo robusto de errores y rollback
 * - Enforce 2MB file size limit (updated from 3MB)
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { MAX_FILE_SIZE_BYTES } from "@/lib/utils"; // Import from existing utils file

// --- 1. CONFIGURACIÓN INICIAL DEL CLIENTE DE SUPABASE ---
// 🚨 Cambiado: ahora exigimos que SUPABASE_SERVICE_ROLE_KEY esté presente
// para evitar caer en la anon key y recibir "permission denied"
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug logs para verificar qué clave se está usando
console.log("🔍 SUPABASE_URL:", supabaseUrl);
console.log(
  "🔍 SERVICE_ROLE_KEY length:",
  supabaseServiceKey?.length || "MISSING"
);

if (!supabaseServiceKey) {
  throw new Error(
    "❌ SUPABASE_SERVICE_ROLE_KEY no está definida. Verifica tu .env.local"
  );
}

// Crear cliente siempre con service role (nunca con anon)
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
>>>>>>> Stashed changes

/**
 * Función principal que maneja las solicitudes HTTP POST
 * Procesa el formulario completo desde validación hasta almacenamiento
 * @param request - Objeto NextRequest con los datos del formulario
 * @returns NextResponse con resultado de la operación
 */
export async function POST(request: NextRequest) {
<<<<<<< Updated upstream
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
=======
  let uniqueFileName = ""; // Declarado fuera del try para acceso en rollback

  // Check if Supabase credentials are properly configured
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    console.error("Supabase URL not configured properly");
    return NextResponse.json(
      {
        error:
          "Configuración del servidor incompleta. Por favor, contacta al administrador.",
      },
      { status: 500 }
    );
  }

  try {
    // --- 2.1. EXTRACCIÓN Y VALIDACIÓN DE DATOS DEL FORMULARIO ---
    const formData = await request.formData();

    // ✅ Corrección: usamos exactamente los nombres de campos enviados desde el front
    const nombreComprador = formData.get("nombre_comprador") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const numeroReferencia = formData.get("numero_referencia") as string;
    const ticketsCompradosStr = formData.get("tickets_comprados") as string;
    const comprobantePago = formData.get("comprobante_pago") as File;
    const ticketsComprados = Number.parseInt(ticketsCompradosStr);

    // Validación de campos obligatorios
    if (
      !nombreComprador?.trim() ||
      !email?.trim() ||
      !telefono?.trim() ||
      !numeroReferencia?.trim()
    ) {
      return NextResponse.json(
        { error: "Todos los campos de texto son requeridos." },
        { status: 400 }
      );
    }
    if (isNaN(ticketsComprados) || ticketsComprados < 3) {
      return NextResponse.json(
        { error: "Número de tickets debe ser un número válido (mínimo 3)." },
        { status: 400 }
      );
    }
    if (!comprobantePago || comprobantePago.size === 0) {
      return NextResponse.json(
        { error: "Comprobante de pago es un campo requerido." },
        { status: 400 }
      );
    }
    // Updated to use 2MB limit (reduced from 3MB for better performance and future database constraints)
    if (comprobantePago.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El comprobante de pago no puede superar los 2 MB." },
        { status: 400 }
      );
    }

    // --- 2.2. SUBIDA DEL ARCHIVO A SUPABASE STORAGE ---
    // ✅ FIX: Generamos siempre un nombre único para evitar conflictos
    const fileExtension = comprobantePago.name.split(".").pop();
    uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // 🚨 Bucket siempre es "receipts" según DATABASE_GUIDE.md
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(uniqueFileName, comprobantePago, {
        cacheControl: "3600",
        upsert: false, // nunca sobreescribir
      });
>>>>>>> Stashed changes

    // Manejar errores de subida
    if (uploadError) {
<<<<<<< Updated upstream
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
=======
      console.error("Error al subir archivo:", uploadError.message);
      return NextResponse.json(
        { error: `Error al subir el comprobante de pago: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // --- 2.3. INSERCIÓN EN LA BASE DE DATOS ---
    try {
      const { data: insertFormData, error: insertFormError } = await supabase
        .from("forms")
        .insert({
          full_name: nombreComprador,
          email: email,
          phone: telefono,
          receipt_number: numeroReferencia,
          tickets: ticketsComprados,
          validated: false, // Siempre inicia como no validado
        })
        .select("id")
        .single();

      if (insertFormError) {
        console.error("Error al insertar formulario:", insertFormError.message);

        // Check if error is due to duplicate receipt number
        if (
          insertFormError.code === "23505" &&
          insertFormError.message.includes("receipt_number")
        ) {
          throw new Error(
            "Este número de referencia ya existe. Por favor, verifica tu recibo."
          );
        }

        throw new Error(
          `Error al registrar el formulario: ${insertFormError.message}`
        );
      }

      const formId = insertFormData.id;

      // Insertar metadata del archivo en form_files
      // ✅ FIX: Guardamos el nombre original + el path único en bucket
      const { error: fileMetadataError } = await supabase
        .from("form_files")
        .insert({
          form_id: formId,
          file_name: comprobantePago.name, // nombre original
          storage_path: uniqueFileName, // nombre único en bucket
        });

      if (fileMetadataError) {
        console.error(
          "Error al insertar metadata del archivo:",
          fileMetadataError.message
        );
        throw new Error(
          `Error al registrar metadata del archivo: ${fileMetadataError.message}`
        );
      }

      // NOTA: No insertamos manualmente en email_outbox ni generamos tickets.
      // El trigger de la base de datos se encarga de:
      // 1. Generar códigos únicos de tickets (0000-9999) cuando validated=true
      // 2. Insertar tickets en la tabla 'tickets'
      // 3. Insertar email de confirmación en 'email_outbox'

      // --- 2.4. RESPUESTA EXITOSA ---
      return NextResponse.json(
        {
          message: "Formulario enviado y archivo subido con éxito.",
          data: insertFormData,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      // --- 2.5. MANEJO DE ERRORES DE BASE DE DATOS CON ROLLBACK ---
      console.error("Error en la operación de la base de datos:", dbError.message);
      if (uniqueFileName) {
        await supabase.storage.from("receipts").remove([uniqueFileName]);
      }
      return NextResponse.json(
        {
          error: `Error al registrar la información del contacto: ${dbError.message}`,
        },
        { status: 500 }
      );
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    /**
     * PASO 10: Manejo de errores inesperados
     * Captura cualquier error no manejado en el proceso
     */
    console.error("Error inesperado en la API Route:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
=======
    // --- 2.6. MANEJO DE ERRORES INESPERADOS ---
    console.error("Error inesperado en la API Route:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
>>>>>>> Stashed changes
  }
}
