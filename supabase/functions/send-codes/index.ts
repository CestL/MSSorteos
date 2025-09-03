// supabase/functions/enviar-codigos/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3.2.0'

// --- 1. CONFIGURACIÓN INICIAL ---
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

// Función para generar un número aleatorio de 4 dígitos (0000-9999)
const generateNumericalCode = (): string => {
  const number = Math.floor(Math.random() * 10000);
  return String(number).padStart(4, '0');
};

// --- 2. LÓGICA PRINCIPAL (CONTROLADOR DE SOLICITUD) ---
Deno.serve(async (req) => {
  try {
    const { email, nombre_comprador, tickets_comprados, id } = await req.json();

    // 2.1. VALIDACIÓN DE ENTRADA
    if (!id || !email || !nombre_comprador || !tickets_comprados) {
      return new Response(JSON.stringify({ error: 'Datos del disparador incompletos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const numTickets = parseInt(tickets_comprados);
    const MAX_TICKETS = 10000;

    // 2.2. VERIFICAR EL LÍMITE TOTAL DE TICKETS GENERADOS
    const { count: totalTickets, error: countError } = await supabase
      .from('Contactos')
      .select('tickets_comprados', { count: 'exact' });

    if (countError) {
      console.error('Error al contar tickets:', countError.message);
      return new Response(JSON.stringify({ error: 'Fallo al verificar el límite de tickets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Se suma la cantidad de tickets_comprados para cada fila para obtener el total.
    const totalTicketsGenerated = totalTickets.reduce((sum, row) => sum + row.tickets_comprados, 0);

    if (totalTicketsGenerated + numTickets > MAX_TICKETS) {
      return new Response(JSON.stringify({ error: 'El límite total de 10,000 boletos ha sido alcanzado.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 3. GENERACIÓN DE CÓDIGOS ÚNICOS ---
    const uniqueCodes = [];
    let attempts = 0;
    const MAX_ATTEMPTS = numTickets * 2; // Para evitar bucles infinitos en caso de alta colisión.

    while (uniqueCodes.length < numTickets && attempts < MAX_ATTEMPTS) {
      const newCode = generateNumericalCode();
      
      // 3.1. VERIFICAR SI EL CÓDIGO YA EXISTE EN LA BASE DE DATOS
      const { data, error } = await supabase
        .from('Contactos')
        .select('id')
        .contains('codigos_unicos', [newCode]);

      if (error) {
        console.error('Error al verificar código duplicado:', error.message);
        attempts++;
        continue;
      }
      
      // Si el código no existe en la base de datos, lo añadimos a la lista
      if (data.length === 0) {
        uniqueCodes.push(newCode);
      }
      attempts++;
    }

    if (uniqueCodes.length !== numTickets) {
      return new Response(JSON.stringify({ error: 'No se pudieron generar códigos únicos suficientes.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 4. ACTUALIZACIÓN Y ENVÍO DEL CORREO ---
    const { error: updateError } = await supabase
      .from('Contactos')
      .update({ codigos_unicos: JSON.stringify(uniqueCodes) })
      .eq('id', id);

    if (updateError) {
      console.error('Error al actualizar códigos:', updateError.message);
      return new Response(JSON.stringify({ error: 'Fallo al actualizar la base de datos.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // ... (El resto del código para enviar el correo con Resend es el mismo)
    
    return new Response(JSON.stringify({
      message: 'Códigos generados y correo enviado con éxito.',
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
