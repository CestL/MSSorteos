// supabase/functions/send-codes/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

// --- 1. CONFIGURACIÓN INICIAL ---
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

// --- 2. LÓGICA PRINCIPAL (CONTROLADOR DE SOLICITUD) ---
Deno.serve(async (req) => {
  try {
    const { compra_id } = await req.json();

    // 2.1. VALIDACIÓN DE ENTRADA
    if (!compra_id) {
      return new Response(JSON.stringify({ error: 'ID de compra no recibido del disparador.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2.2. OBTENER DATOS DE LA COMPRA Y DEL USUARIO EN UNA SOLA CONSULTA
    const { data: compraData, error: compraError } = await supabase
      .from('compras')
      .select(`
        id,
        tickets_comprados,
        codigos_unicos,
        usuarios(
          email,
          nombre_comprador
        )
      `)
      .eq('id', compra_id)
      .single();

    if (compraError || !compraData) {
      console.error('Error al obtener los datos de la compra:', compraError?.message);
      return new Response(JSON.stringify({ error: 'Fallo al obtener los datos de la compra.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { tickets_comprados: numTickets, usuarios: { email, nombre_comprador } } = compraData;

    // 2.3. GENERACIÓN Y VERIFICACIÓN DE CÓDIGOS ÚNICOS (MÉTODO OPTIMIZADO)
    const codesToGenerate = new Set<string>();
    const MAX_TICKETS = 10000;
    
    // Primero, obtener todos los códigos existentes de la base de datos
    const { data: existingCodesData, error: fetchError } = await supabase
      .from('compras')
      .select('codigos_unicos');

    if (fetchError) {
      console.error('Error al obtener códigos existentes:', fetchError.message);
      return new Response(JSON.stringify({ error: 'Fallo al verificar códigos existentes.' }), { status: 500 });
    }
    
    // Unir todos los códigos existentes en un solo Set para una búsqueda rápida
    const allExistingCodes = new Set<string>();
    existingCodesData.forEach(row => {
      // jsonb se lee como un array, así que iteramos sobre él
      if (Array.isArray(row.codigos_unicos)) {
        row.codigos_unicos.forEach(code => allExistingCodes.add(code));
      }
    });

    if (allExistingCodes.size + numTickets > MAX_TICKETS) {
        return new Response(JSON.stringify({ error: `Límite total de ${MAX_TICKETS} boletos alcanzado.` }), { status: 403 });
    }

    // Generar nuevos códigos
    while (codesToGenerate.size < numTickets) {
        const code = String(Math.floor(Math.random() * MAX_TICKETS)).padStart(4, '0');
        if (!allExistingCodes.has(code)) {
            codesToGenerate.add(code);
            allExistingCodes.add(code); // Agregar al set de existentes para evitar duplicados en la misma ejecución
        }
    }

    const newCodes = Array.from(codesToGenerate);

    // 2.4. ACTUALIZACIÓN DE LA FILA DE LA COMPRA CON LOS NUEVOS CÓDIGOS
    const { error: updateError } = await supabase
      .from('compras')
      .update({ codigos_unicos: newCodes })
      .eq('id', compra_id);

    if (updateError) {
      console.error('Error al actualizar códigos:', updateError.message);
      return new Response(JSON.stringify({ error: 'Fallo al actualizar la base de datos.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 2.5. ENVÍO DEL CORREO ELECTRÓNICO
    const sendEmailPromise = resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: `¡Tus ${newCodes.length} nuevos códigos para el sorteo!`,
      html: `
        <p>Hola ${nombre_comprador},</p>
        <p>Gracias por tu compra. Aquí están tus **${newCodes.length}** nuevos códigos:</p>
        <ul>
          ${newCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
        <p>¡Mucha suerte!</p>
      `,
    });
    
    // Manejar el envío de correo de forma asíncrona
    sendEmailPromise.catch(err => console.error('Error al enviar correo:', err));

    return new Response(JSON.stringify({
      message: 'Códigos generados y correo en camino.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error inesperado en la función:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});