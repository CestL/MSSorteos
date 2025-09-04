/**
 * API Route para Envío de Formulario de Registro
 * -------------------------------------------------------
 * Este endpoint maneja el procesamiento completo del formulario de registro.
 * Incluye validación, subida de archivos y almacenamiento en base de datos.
 *
 * Funcionalidades principales:
 * - Validación exhaustiva de datos del formulario
 * - Subida segura de comprobantes de pago a Supabase Storage
 * - Inserción de datos en las tablas 'usuarios' y 'compras'
 * - Manejo robusto de errores y rollback
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// --- 1. CONFIGURACIÓN INICIAL DEL CLIENTE DE SUPABASE ---
// Utiliza la clave de rol de servicio para permisos de administrador.
// Es seguro porque solo se ejecuta en el servidor (no expuesto al cliente).
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// --- 2. FUNCIÓN PRINCIPAL DEL ENDPOINT ---
export async function POST(request: NextRequest) {
  let fileName = ""; // Declara fileName fuera del try para que esté disponible en el catch

  try {
    // --- 2.1. EXTRACCIÓN Y VALIDACIÓN DE DATOS DEL FORMULARIO ---
    const formData = await request.formData();

    const nombreComprador = formData.get("nombre_comprador") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const numeroReferencia = formData.get("numero_referencia") as string;
    const ticketsCompradosStr = formData.get("tickets_comprados") as string;
    const comprobantePago = formData.get("comprobante_pago") as File;
    const ticketsComprados = Number.parseInt(ticketsCompradosStr);

    // Validación de campos obligatorios
    if (!nombreComprador?.trim() || !email?.trim() || !telefono?.trim() || !numeroReferencia?.trim()) {
      return NextResponse.json({ error: "Todos los campos de texto son requeridos." }, { status: 400 });
    }
    if (isNaN(ticketsComprados) || ticketsComprados < 3) {
      return NextResponse.json({ error: "Número de tickets debe ser un número válido (mínimo 3)." }, { status: 400 });
    }
    if (!comprobantePago || comprobantePago.size === 0) {
      return NextResponse.json({ error: "Comprobante de pago es un campo requerido." }, { status: 400 });
    }
    const maxFileSize = 3 * 1024 * 1024;
    if (comprobantePago.size > maxFileSize) {
      return NextResponse.json({ error: "El comprobante de pago no puede superar los 3 MB." }, { status: 400 });
    }

    // --- 2.2. VALIDACIÓN DE DUPLICADOS EN LA BASE DE DATOS ---
    // Verificar si el numero de referencia ya existe
    const { data: existingPurchase, error: existingPurchaseError } = await supabase
      .from("compras")
      .select("id")
      .eq("numero_referencia", numeroReferencia);

    if (existingPurchaseError) {
      console.error("Error al verificar la referencia de pago:", existingPurchaseError.message);
      return NextResponse.json({ error: "Error al verificar la referencia de pago." }, { status: 500 });
    }

    if (existingPurchase && existingPurchase.length > 0) {
      return NextResponse.json({ error: "Este número de referencia ya ha sido utilizado. Por favor, revisa tu información o contacta a soporte." }, { status: 409 });
    }

    // --- 2.3. SUBIDA DEL ARCHIVO A SUPABASE STORAGE ---
    const fileExtension = comprobantePago.name.split(".").pop();
    fileName = `${uuidv4()}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(fileName, comprobantePago, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError.message);
      return NextResponse.json({ error: "Error al subir el comprobante de pago." }, { status: 500 });
    }

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/comprobantes/${fileName}`;

    // --- 2.4. INSERCIÓN EN LA BASE DE DATOS ---
    try {
      // Intentar encontrar si el usuario ya existe por su email
      const { data: userData, error: userFetchError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", email)
        .single();

      let usuarioId: string | null = null;
      if (userFetchError && userFetchError.code === "PGRST116") {
        // Si el usuario no existe (código 116), lo insertamos
        const { data: insertUserData, error: insertUserError } = await supabase
          .from("usuarios")
          .insert({
            nombre_comprador: nombreComprador,
            email: email,
            telefono: telefono,
          })
          .select("id")
          .single();

        if (insertUserError) {
          console.error("Error al insertar un nuevo usuario:", insertUserError.message);
          throw new Error("Error al procesar los datos del usuario.");
        }
        usuarioId = insertUserData.id;
      } else if (userFetchError) {
        console.error("Error al verificar la existencia del usuario:", userFetchError.message);
        throw new Error("Error al procesar los datos del usuario.");
      } else if (userData) {
        // Si el usuario ya existe, usamos su ID
        usuarioId = userData.id;
      }
      // *** VERIFICACIÓN CRÍTICA DEL ID DEL USUARIO ***
      if (!usuarioId) {
        console.error("No se pudo obtener un ID de usuario válido después de la operación.");
        throw new Error("No se pudo obtener un ID de usuario válido.");
      }

      console.log("ID de usuario obtenido:", usuarioId); // Log de depuración

      // Con el ID del usuario, insertamos la compra en la tabla 'compras'
      const { data: insertPurchaseData, error: insertPurchaseError } = await supabase.from("compras").insert({
        usuario_id: usuarioId,
        numero_referencia: numeroReferencia,
        tickets_comprados: ticketsComprados,
        url_comprobante: fileUrl,
        status_pago: false, // Esto activa el trigger y la Edge Function
      });

      if (insertPurchaseError) {
        console.error("Error al insertar la compra:", insertPurchaseError.message);
        throw new Error("Error al registrar los datos de la compra.");
      }

      // --- 2.5. RESPUESTA EXITOSA ---
      return NextResponse.json(
        {
          message: "Formulario enviado y archivo subido con éxito.",
          data: insertPurchaseData,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      // --- 2.6. MANEJO DE ERRORES DE BASE DE DATOS CON ROLLBACK ---
      // Si la inserción en 'usuarios' o 'compras' falla, eliminamos el archivo de Storage
      // para evitar datos huérfanos.
      console.error("Error en la operación de la base de datos:", dbError.message);
      if (fileName) {
        await supabase.storage.from("comprobantes").remove([fileName]);
      }
      return NextResponse.json({ error: "Error al registrar la información del contacto." }, { status: 500 });
    }
  } catch (error) {
    // --- 2.7. MANEJO DE ERRORES INESPERADOS ---
    console.error("Error inesperado en la API Route:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}