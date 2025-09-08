/**
 * Componente de Sección de Pie de Página
 * -------------------------------------------------------
 * Este componente renderiza el footer del sitio web con enlaces sociales
 * y información de copyright. Incluye botones para WhatsApp, Instagram y Facebook.
 *
 * Funcionalidades principales:
 * - Botones de redes sociales con iconos
 * - Generación automática de URLs de WhatsApp con mensaje predefinido
 * - Diseño responsivo para móvil y desktop
 * - Información de copyright y branding
 */

"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Instagram } from "lucide-react"
import { SOCIAL_LINKS, generateWhatsAppUrl } from "@/lib/utils"

export function FooterSection() {
  /**
   * Función helper para abrir enlaces sociales en nueva pestaña
   * Utiliza window.open con parámetros de seguridad
   * @param url - URL del enlace social a abrir
   */
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  /**
   * Configuración de botones sociales
   * Array con información de cada red social: etiqueta, icono y función onClick
   */
  const socialButtons = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: () =>
        // Generar URL de WhatsApp con número y mensaje predefinidos
        handleSocialClick(generateWhatsAppUrl(SOCIAL_LINKS.whatsapp.number, SOCIAL_LINKS.whatsapp.message)),
    },
    {
      label: "Instagram",
      icon: Instagram,
      onClick: () => handleSocialClick(SOCIAL_LINKS.instagram),
    },
    {
      label: "Facebook",
      // Icono personalizado de Facebook usando SVG
      icon: (props: any) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      onClick: () => handleSocialClick(SOCIAL_LINKS.facebook),
    },
  ]

  return (
    <footer className="bg-black text-yellow-400 py-8 mt-12 sm:py-12 sm:mt-16">
      <div className="mx-auto max-w-4xl px-3 sm:px-4">
        {/* Sección principal con botones sociales */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Título de la sección */}
          <h2 className="text-xl font-bold mb-4 text-yellow-400 sm:text-2xl sm:mb-6">CONÉCTATE CON NOSOTROS</h2>

          {/* Contenedor responsivo de botones sociales */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 sm:flex-wrap">
            {socialButtons.map(({ label, icon: Icon, onClick }) => (
              <Button
                key={label}
                onClick={onClick}
                className="bg-yellow-400 text-black hover:bg-yellow-500 px-4 py-2 rounded-full font-semibold text-sm sm:px-6 sm:text-base"
              >
                {/* Icono con tamaño responsivo */}
                <Icon className="h-3 w-3 mr-2 sm:h-4 sm:w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sección de copyright */}
        <div className="text-center border-t border-yellow-400 pt-6 sm:pt-8">
          {/* Información de copyright principal */}
          <p className="text-xs text-yellow-400 sm:text-sm">
            © 2025 Sorteos Miguel Sandoval - Todos los derechos reservados
          </p>

          {/* Tagline adicional para SEO */}
          <p className="text-xs text-yellow-300 mt-1 sm:text-sm">Sorteos millonarios seguros y confiables</p>
        </div>
      </div>
    </footer>
  )
}