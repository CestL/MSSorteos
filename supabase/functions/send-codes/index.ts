import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

// --- 1. CONFIGURACIÓN INICIAL (USANDO VARIABLES DE ENTORNO) ---
// El cliente de Supabase se inicializa de forma segura con variables de entorno.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// El cliente de Resend también usa una variable de entorno.
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

// Función para generar un código numérico aleatorio.
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

    const numTickets = parseInt(tickets_comprados, 10);
    const MAX_TICKETS = 10000;

    // 2.2. VERIFICAR EL LÍMITE TOTAL DE TICKETS GENERADOS
    const { count: totalTickets, error: countError } = await supabase
      .from('Contactos')
      .select('*', { count: 'exact' });

    if (countError) {
      return new Response(JSON.stringify({ error: 'Fallo al verificar el límite de tickets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (totalTickets! + numTickets > MAX_TICKETS) {
      return new Response(JSON.stringify({ error: `El límite total de ${MAX_TICKETS} boletos ha sido alcanzado.` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 3. GENERACIÓN DE CÓDIGOS ÚNICOS ---
    const uniqueCodes: string[] = [];
    let attempts = 0;
    const MAX_ATTEMPTS = numTickets * 5;

    while (uniqueCodes.length < numTickets && attempts < MAX_ATTEMPTS) {
      const newCode = generateNumericalCode();
      const { data, error } = await supabase
        .from('Contactos')
        .select('id')
        .contains('codigos_unicos', [newCode]);
      
      if (error) {
        attempts++;
        continue;
      }
      
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
      .update({ codigos_unicos: uniqueCodes })
      .eq('id', id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Fallo al actualizar la base de datos.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Se envía el correo electrónico a través de Resend.
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Reemplaza esto con tu dominio verificado
      to: [email],
      subject: '¡Tus códigos para el sorteo!',
      html: `
        <p>Hola ${nombre_comprador},</p>
        <p>Aquí están tus ${numTickets} códigos para participar en el sorteo:</p>
        <ul>
          ${uniqueCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
        <p>¡Mucha suerte!</p>
      `,
    });
    
    return new Response(JSON.stringify({
      message: 'Códigos generados y correo enviado con éxito.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error inesperado en la función:', error);
    return new Response(JSON.stringify({ error: `Error interno del servidor: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});