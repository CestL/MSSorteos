/**
 * Definiciones de Tipos TypeScript
 * -------------------------------------------------------
 * Este archivo centraliza todas las definiciones de tipos para la aplicación.
 * Proporciona type safety y autocompletado en todo el proyecto.
 *
 * Tipos principales:
 * - PaymentMethodId: Identificadores de métodos de pago
 * - Currency: Tipos de moneda soportados
 * - Interfaces para datos de formulario y configuración
 */

// Tipo union para identificadores de métodos de pago disponibles
export type PaymentMethodId = "mercadopago" | "tenpo" | "santander" | "zelle"

// Tipo union para monedas soportadas en la aplicación
export type Currency = "CLP" | "USD"

/**
 * Interfaz para configuración de tickets preestablecidos
 * Define la estructura de los botones de cantidad rápida
 */
export interface TicketPreset {
  readonly label: string // Texto mostrado en el botón (ej: "+3 tickets")
  readonly value: number // Cantidad de tickets que agrega
}

/**
 * Interfaz para información de métodos de pago
 * Define la estructura completa de cada método disponible
 */
export interface PaymentMethod {
  readonly id: PaymentMethodId // Identificador único
  readonly name: string // Nombre mostrado al usuario
  readonly logo: string // Ruta del logo del método
  readonly currency: Currency // Moneda que maneja este método
}

/**
 * Interfaz para detalles de cuenta bancaria/pago
 * Estructura flexible para diferentes tipos de cuentas
 */
export interface AccountDetail {
  readonly accountNumber?: string // Número de cuenta bancaria
  readonly rut?: string // RUT del titular (Chile)
  readonly bank?: string // Nombre del banco
  readonly accountType?: string // Tipo de cuenta (Vista, Corriente, etc.)
  readonly accountHolder?: string // Nombre del titular
  readonly name?: string // Nombre alternativo
  readonly email?: string // Email asociado
  readonly phone?: string // Teléfono (para Zelle)
  readonly service?: string // Nombre del servicio (para Zelle)
}

/**
 * Interfaz para datos del formulario de registro
 * Define la estructura exacta de los datos que recopila el formulario
 */
export interface FormData {
  buyerName: string // Nombre completo del comprador
  email: string // Dirección de correo electrónico
  phone: string // Número de teléfono
  referenceNumber: string // Número de referencia de la transferencia
  ticketCount: string // Cantidad de tickets (como string para el input)
}

/**
 * Interfaz para configuración de enlaces sociales
 * Define la estructura de los enlaces a redes sociales
 */
export interface SocialLinks {
  readonly whatsapp: {
    readonly number: string // Número de WhatsApp (formato internacional)
    readonly message: string // Mensaje predefinido
  }
  readonly instagram: string // URL de Instagram
  readonly facebook: string // URL de Facebook
}
