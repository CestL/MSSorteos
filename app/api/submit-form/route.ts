import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// PASO 1: Inicialización del cliente de Supabase
// Este cliente utiliza la clave de rol de servicio (SUPABASE_SERVICE_ROLE_KEY)
// para tener permisos de administrador. Es seguro porque solo se ejecuta en el servidor.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define la función que maneja las solicitudes HTTP de tipo POST.
export async function POST(request: NextRequest) {
  try {
    // PASO 2: Obtener y validar los datos del formulario.
    const formData = await request.formData();
    
    // Se extraen los valores de los campos del formulario.
    const nombreComprador = formData.get('nombre_comprador') as string;
    const email = formData.get('email') as string;
    const telefono = formData.get('telefono') as string;
    const numeroReferencia = formData.get('numero_referencia') as string;
    const ticketsComprados = formData.get('tickets_comprados') as string;
    const comprobantePago = formData.get('comprobante_pago') as File;

    // Validación de tamaño del archivo en el backend.
    const maxFileSize = 3 * 1024 * 1024; // 3 MB en bytes
    if (comprobantePago.size > maxFileSize) {
      return NextResponse.json({ error: 'El comprobante de pago no puede superar los 3 MB.' }, { status: 400 });
    }
    
    // Validación básica que ya tenías
    if (!comprobantePago || comprobantePago.size === 0) {
      return NextResponse.json({ error: 'Comprobante de pago es un campo requerido.' }, { status: 400 });
    }

    // PASO 3: Subir el archivo a Supabase Storage.
    const fileExtension = comprobantePago.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(fileName, comprobantePago, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError.message);
      return NextResponse.json({ error: 'Error al subir el comprobante de pago.' }, { status: 500 });
    }

    // Se construye la URL pública para el archivo subido.
    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/comprobantes/${fileName}`;

    // PASO 4: Insertar los datos en la base de datos.
    const { data: insertData, error: insertError } = await supabase
      .from('Contactos')
      .insert({
        nombre_comprador: nombreComprador,
        email: email,
        telefono: telefono,
        numero_referencia: numeroReferencia,
        tickets_comprados: ticketsComprados,
        comprobante_pago_url: fileUrl,
      });

    if (insertError) {
      console.error('Error al insertar en la base de datos:', insertError.message);
      await supabase.storage.from('comprobantes').remove([fileName]);
      return NextResponse.json({ error: 'Error al registrar la información del contacto.' }, { status: 500 });
    }

    // PASO 5: Devolver una respuesta exitosa al frontend.
    return NextResponse.json({
      message: 'Formulario enviado y archivo subido con éxito.',
      data: insertData,
    }, { status: 200 });

  } catch (error) {
    console.error('Error inesperado en la API Route:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}