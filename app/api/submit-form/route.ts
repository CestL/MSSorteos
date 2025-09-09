/**
 * API Route para Envío de Formulario de Registro
 * -------------------------------------------------------
 * Este endpoint maneja el procesamiento completo del formulario de registro.
 * Incluye validación, subida de archivos y almacenamiento en base de datos.
 *
 * Funcionalidades principales:
 * - Validación de datos del formulario
 * - Subida segura de comprobantes de pago a Supabase Storage (bucket receipts)
 * - Inserción de datos en las tablas 'forms' y 'form_files'
 * - Manejo robusto de errores y rollback
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { MAX_FILE_SIZE_BYTES } from "@/lib/utils";

// 👇 Parche: forzar node-fetch en entorno Next.js
import nodeFetch from "node-fetch";
(global as any).fetch = nodeFetch;

// (Opcional pero recomendado) asegura entorno Node, necesario para Buffer y este patch.
// Si no lo quieres, puedes quitar esta línea.
export const runtime = "nodejs";

// --- 1. CONFIGURACIÓN DEL CLIENTE SUPABASE ---
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY no está definida. Verifica tu .env.local");
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// --- 2. FUNCIÓN PRINCIPAL DEL ENDPOINT ---
export async function POST(request: NextRequest) {
  let uniqueFileName = "";

  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    console.error("❌ Supabase URL not configured properly");
    return NextResponse.json(
      { error: "Configuración del servidor incompleta." },
      { status: 500 }
    );
  }

  try {
    // --- 2.1. EXTRAER DATOS DEL FORMULARIO ---
    const formData = await request.formData();

    const nombreComprador = formData.get("nombre_comprador") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const numeroReferencia = formData.get("numero_referencia") as string;
    const ticketsCompradosStr = formData.get("tickets_comprados") as string;
    const comprobantePago = formData.get("comprobante_pago") as File;
    const ticketsComprados = Number.parseInt(ticketsCompradosStr);

    // --- 2.1.1 VALIDACIONES ---
    if (!nombreComprador?.trim() || !email?.trim() || !telefono?.trim() || !numeroReferencia?.trim()) {
      return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
    }
    if (isNaN(ticketsComprados) || ticketsComprados < 3) {
      return NextResponse.json({ error: "Número de tickets inválido (mínimo 3)." }, { status: 400 });
    }
    if (!comprobantePago || comprobantePago.size === 0) {
      return NextResponse.json({ error: "Comprobante de pago requerido." }, { status: 400 });
    }
    if (comprobantePago.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El comprobante de pago no puede superar los 2 MB." },
        { status: 400 }
      );
    }

    // --- 2.2. SUBIDA DEL ARCHIVO ---
    const fileExtension = comprobantePago.name.split(".").pop();
    uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // ✅ Convertir File a Buffer para entorno Node
    const arrayBuffer = await comprobantePago.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    console.log("📂 Subiendo archivo:", uniqueFileName, "size:", fileBuffer.length);

    // ⚡ OPTIMIZACIÓN: subir archivo e insertar en `forms` EN PARALELO
    const uploadPromise = supabase.storage
      .from("receipts")
      .upload(uniqueFileName, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: comprobantePago.type || "application/octet-stream",
      });

    const insertPromise = supabase
      .from("forms")
      .insert({
        full_name: nombreComprador,
        email: email,
        phone: telefono,
        receipt_number: numeroReferencia,
        tickets: ticketsComprados,
        validated: false,
      })
      .select("id")
      .single();

    const [uploadResult, insertFormResult] = await Promise.all([uploadPromise, insertPromise]);

    // Manejo de errores con rollback cruzado
    if (uploadResult.error) {
      console.error("❌ Error al subir archivo:", uploadResult.error.message);
      // Si el insert de `forms` sí se alcanzó a crear, lo revertimos
      if (insertFormResult?.data?.id) {
        await supabase.from("forms").delete().eq("id", insertFormResult.data.id);
      }
      return NextResponse.json(
        { error: `Error al subir el comprobante de pago: ${uploadResult.error.message}` },
        { status: 500 }
      );
    }

    if (insertFormResult.error) {
      console.error("❌ Error al insertar formulario:", insertFormResult.error.message);

      // Si el archivo se subió bien, lo eliminamos
      if (uniqueFileName) {
        await supabase.storage.from("receipts").remove([uniqueFileName]);
      }

      // Mensaje más claro si es duplicado de receipt_number
      const isDuplicate =
        insertFormResult.error.code === "23505" &&
        insertFormResult.error.message?.toLowerCase().includes("receipt_number");
      const msg = isDuplicate
        ? "Este número de referencia ya existe. Por favor, verifica tu recibo."
        : `Error al registrar el formulario: ${insertFormResult.error.message}`;

      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Si llegamos aquí, ambas operaciones (upload + forms) salieron OK
    const formId = insertFormResult.data.id;

    // Registrar metadata del archivo en `form_files` (depende de formId y uniqueFileName)
    const { error: fileMetadataError } = await supabase.from("form_files").insert({
      form_id: formId,
      file_name: comprobantePago.name,
      storage_path: uniqueFileName,
    });

    if (fileMetadataError) {
      console.error("❌ Error al registrar metadata:", fileMetadataError.message);

      // Mantenemos tu comportamiento original: limpiar el archivo si falla metadata
      if (uniqueFileName) {
        await supabase.storage.from("receipts").remove([uniqueFileName]);
      }

      return NextResponse.json(
        { error: `Error al registrar metadata del archivo: ${fileMetadataError.message}` },
        { status: 500 }
      );
    }

    // --- 2.4. RESPUESTA EXITOSA ---
    return NextResponse.json(
      { message: "Formulario enviado y archivo subido con éxito.", data: insertFormResult.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error inesperado en la API:", error);
    if (uniqueFileName) {
      await supabase.storage.from("receipts").remove([uniqueFileName]);
    }
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
