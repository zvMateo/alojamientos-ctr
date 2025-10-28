import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#D81930]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la Empresa */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/logcbanew.png"
                alt="Agencia Córdoba Turismo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-primary-foreground/80 max-w-xs">
              🌟 Descubre los mejores alojamientos de Córdoba. Tu guía completa
              para una experiencia turística inolvidable en las Sierras
              Cordobesas.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-foreground">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Alojamientos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Hoteles
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Hosterías
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Cabañas
                </a>
              </li>
            </ul>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-foreground">
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-white" />
                <span className="text-sm text-primary-foreground/80">
                  Córdoba, Argentina
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-white" />
                <span className="text-sm text-primary-foreground/80">
                  +54 351 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-white" />
                <span className="text-sm text-primary-foreground/80">
                  info@cordobaturismo.com
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full py-8 flex justify-center items-center gap-8 flex-wrap">
          <img
            src="/cba-gob-300x99.png"
            alt="Córdoba Gob"
            className="h-16 w-auto object-contain"
          />
          <img
            src="/region_centro_texto-1.png"
            alt="Region Centro"
            className="h-16 w-auto object-contain"
          />
          <img
            src="/argentinaministerio-300x85.png"
            alt="Argentina Ministerio"
            className="h-16 w-auto object-contain"
          />
        </div>
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-primary-foreground/80">
              © 2024 Córdoba Turismo. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
