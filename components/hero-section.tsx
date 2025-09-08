/**
 * Componente de Sección Hero
 * -------------------------------------------------------
 * Hero responsivo con logo fijo en desktop y que desaparece en móvil/tablet al hacer scroll
 */

"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { IMAGES } from "@/lib/utils"

export function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Solo rastrear scroll en móvil/tablet (< 1024px)
      if (window.innerWidth < 1024) {
        setIsScrolled(window.scrollY > 0)
      }
    }

    const handleResize = () => {
      // Resetear estado de scroll cuando se redimensiona a desktop
      if (window.innerWidth >= 1024) {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)

    // Verificación inicial
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de Fondo Responsiva */}
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.heroBackground || "/images/placeholder.jpg"}
          alt="Fondo de billetes chilenos para sorteo de millones - Sorteos Miguel Sandoval"
          fill
          className="object-cover object-center opacity-30"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 sm:from-black/40 sm:to-black/60" />
      </div>

      {/* Logo - Fijo en desktop, desaparece al hacer scroll en móvil/tablet */}
      <div
        className={`fixed top-4 left-4 z-50 transition-opacity duration-300 ${
          isScrolled ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto" : "opacity-100"
        }`}
      >
        <Image
          src={IMAGES.logo || "/images/placeholder-logo.png"}
          alt="Logo Sorteos Miguel Sandoval - Participa y gana millones en sorteos VIP"
          width={200}
          height={80}
          className="drop-shadow-lg"
          priority
        />
      </div>

      {/* Contenido Principal - Escalado responsivo */}
      <div className="relative z-10 text-center px-4 max-w-xs mx-auto sm:max-w-2xl sm:px-4 md:max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-2xl sm:text-4xl sm:mb-4 md:text-6xl lg:text-7xl">
          <span className="block text-yellow-400">Sorteo de 3M</span>
        </h1>
        <p className="text-lg font-semibold drop-shadow-lg text-white sm:text-xl md:text-2xl lg:text-3xl">
          ¡Participa y gana Millones!
        </p>
      </div>
    </header>
  )
}