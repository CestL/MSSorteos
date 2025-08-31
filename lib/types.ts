/**
 * TypeScript Type Definitions
 * -------------------------------------------------------
 * Centralized type definitions for the raffle platform
 */

export type PaymentMethodId = "mercadopago" | "tenpo" | "santander" | "zelle"
export type Currency = "CLP" | "USD"

export interface TicketPreset {
  readonly label: string
  readonly value: number
}

export interface PaymentMethod {
  readonly id: PaymentMethodId
  readonly name: string
  readonly logo: string
  readonly currency: Currency
}

export interface AccountDetail {
  readonly accountNumber?: string
  readonly rut?: string
  readonly bank?: string
  readonly accountType?: string
  readonly accountHolder?: string
  readonly name?: string
  readonly email?: string
  readonly phone?: string
  readonly service?: string
}

export interface FormData {
  buyerName: string
  email: string
  phone: string
  referenceNumber: string
  ticketCount: string
}

export interface SocialLinks {
  readonly whatsapp: {
    readonly number: string
    readonly message: string
  }
  readonly instagram: string
  readonly facebook: string
}
