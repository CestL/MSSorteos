/**
 * Application Constants
 * -------------------------------------------------------
 * Centralized constants for the raffle platform
 */

export const TICKET_PRICES = {
  CLP: 800,
  USD: 0.8,
} as const

export const MINIMUM_TICKETS = 3

export const TICKET_PRESETS = [
  { label: "+3 tickets", value: 3 },
  { label: "+10 tickets", value: 10 },
  { label: "+20 tickets", value: 20 },
  { label: "+50 tickets", value: 50 },
  { label: "+100 tickets", value: 100 },
] as const

export const PAYMENT_METHODS = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mercadopago-Hqqtm73Lq74aNJuOY1iqnbv4PoceR9.png",
    currency: "CLP" as const,
  },
  {
    id: "tenpo",
    name: "Cuenta Tenpo",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tenpo-onv5QI8vE5PHYV5IbT11zYovQ8WQHe.jpeg",
    currency: "CLP" as const,
  },
  {
    id: "santander",
    name: "Banco Santander",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/santender-rPNUptQynNBbehKO3xBvkhbWMskT7k.png",
    currency: "CLP" as const,
  },
  {
    id: "zelle",
    name: "Zelle",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/zelle-6xhIMTILYHUyKMAU6zD7rj16DUbVwy.png",
    currency: "USD" as const,
  },
] as const

export const ACCOUNT_DETAILS = {
  mercadopago: {
    accountNumber: "1020788385",
    rut: "261783517",
    bank: "Mercado Pago",
    accountType: "Vista",
    accountHolder: "Miguel Angel Sandoval Silvera",
  },
  tenpo: {
    name: "MIGUEL ANGEL SANDOVAL SILVERA",
    rut: "26178351-7",
    bank: "Banco prepago Tenpo",
    accountType: "Cuenta Vista",
    accountNumber: "111126178351",
    email: "sandovalmiguel888@gmail.com",
  },
  santander: {
    name: "Miguel Angel Sandoval Silvera",
    rut: "26.178.351-7",
    accountType: "Cuenta Corriente",
    accountNumber: "0 000 81 08954 0",
    bank: "Banco Santander",
    email: "sandovalmiguel888@gmail.com",
  },
  zelle: {
    name: "Jehonadad Samuel Sulbaran Díaz",
    phone: "7208712756",
    service: "Zelle",
  },
} as const

export const SOCIAL_LINKS = {
  whatsapp: {
    number: "56949077188",
    message: "Hola! Me interesa participar en el sorteo de 3M",
  },
  instagram: "https://www.instagram.com/sandoval__miguel?igsh=MXVoMjAzMHJ6bW5tdg==",
  facebook: "https://www.facebook.com/share/1CtheYuW2E/",
} as const

export const IMAGES = {
  logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20png-K6MgLq4HrMDBNmPEKRft0ouHsqWtqx.png",
  heroBackground: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/foto-tNmAxQ1SATuftThSZGaCDJezVLdBkJ.jpeg",
} as const
