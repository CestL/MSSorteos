/**
 * Constantes de la Aplicación
 * -------------------------------------------------------
 * Este archivo centraliza todas las constantes utilizadas en la aplicación.
 * Incluye precios, configuraciones, datos de cuentas y enlaces sociales.
 *
 * Secciones principales:
 * - Precios y configuración de tickets
 * - Métodos de pago disponibles
 * - Detalles de cuentas bancarias
 * - Enlaces sociales y contacto
 * - Rutas de imágenes
 */

/**
 * Precios de tickets por moneda
 * Define el costo de cada ticket según la moneda del método de pago
 */
export const TICKET_PRICES = {
  CLP: 800, // Pesos chilenos por ticket
  USD: 0.8, // Dólares estadounidenses por ticket
} as const

/**
 * Cantidad mínima de tickets que debe comprar un usuario
 * Requerimiento del negocio para participar en el sorteo
 */
export const MINIMUM_TICKETS = 3

/**
 * Configuración de botones de cantidad preestablecida
 * Define las opciones rápidas para selección de tickets
 */
export const TICKET_PRESETS = [
  { label: "+3 tickets", value: 3 },
  { label: "+10 tickets", value: 10 },
  { label: "+20 tickets", value: 20 },
  { label: "+50 tickets", value: 50 },
  { label: "+100 tickets", value: 100 },
] as const

/**
 * Configuración de métodos de pago disponibles
 * Define todos los métodos soportados con sus logos y monedas
 */
export const PAYMENT_METHODS = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    logo: "/images/mercadopago.png",
    currency: "CLP" as const,
  },
  {
    id: "tenpo",
    name: "Cuenta Tenpo",
    logo: "/images/tenpo.jpeg",
    currency: "CLP" as const,
  },
  {
    id: "santander",
    name: "Banco Santander",
    logo: "/images/santander.png",
    currency: "CLP" as const,
  },
  {
    id: "zelle",
    name: "Zelle",
    logo: "/images/zelle-logo.png",
    currency: "USD" as const,
  },
] as const

/**
 * Detalles de cuentas bancarias y de pago
 * Información específica para cada método de pago
 * IMPORTANTE: Esta información es sensible y debe manejarse con cuidado
 */
export const ACCOUNT_DETAILS = {
  // Cuenta de Mercado Pago (Chile)
  mercadopago: {
    accountNumber: "1020788385",
    rut: "261783517",
    bank: "Mercado Pago",
    accountType: "Vista",
    accountHolder: "Miguel Angel Sandoval Silvera",
  },

  // Cuenta Tenpo (Chile)
  tenpo: {
    name: "MIGUEL ANGEL SANDOVAL SILVERA",
    rut: "26178351-7",
    bank: "Banco prepago Tenpo",
    accountType: "Cuenta Vista",
    accountNumber: "111126178351",
    email: "sandovalmiguel888@gmail.com",
  },

  // Cuenta Banco Santander (Chile)
  santander: {
    name: "Miguel Angel Sandoval Silvera",
    rut: "26.178.351-7",
    accountType: "Cuenta Corriente",
    accountNumber: "0 000 81 08954 0",
    bank: "Banco Santander",
    email: "sandovalmiguel888@gmail.com",
  },

  // Cuenta Zelle (Estados Unidos)
  zelle: {
    name: "Jehonadad Samuel Sulbaran Díaz",
    phone: "7208712756",
    service: "Zelle",
  },
} as const

/**
 * Enlaces y configuración de redes sociales
 * Define los canales de contacto y soporte al cliente
 */
export const SOCIAL_LINKS = {
  whatsapp: {
    number: "56949077188", // Número sin el símbolo +
    message: "Hola! Me interesa participar en el sorteo de 3M", // Mensaje predefinido
  },
  instagram: "https://www.instagram.com/sandoval__miguel?igsh=MXVoMjAzMHJ6bW5tdg==",
  facebook: "https://www.facebook.com/share/1CtheYuW2E/",
} as const

/**
 * Rutas de imágenes utilizadas en la aplicación
 * Centraliza las referencias a assets gráficos
 */
export const IMAGES = {
  logo: "/images/logo.png", // Logo principal de la empresa
  heroBackground: "/images/hero-background.jpeg", // Imagen de fondo del hero
} as const
