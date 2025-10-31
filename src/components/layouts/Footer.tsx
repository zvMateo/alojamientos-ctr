import { Mail, Phone, MapPin } from "lucide-react";
import { AiOutlineYoutube } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';

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
              Descubre los mejores alojamientos de Córdoba. Tu guía completa
              para una experiencia turística inolvidable en las Sierras
              Cordobesas.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/turismocba/?hl=es"
                target="_blank"
                data-label="Instagram"
                aria-label="Síguenos en Instagram"
                rel="noopener nofollow"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/discover/c%C3%B3rdoba-turismo"
                target="_blank"
                data-label="TikTok"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Síguenos en TikTok"
                rel="noopener nofollow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M22 6v5q-4 0-6-2v7a7 7 0 1 1-5-6.7m0 6.7a2 2 0 1 0-2 2a2 2 0 0 0 2-2V1h5q2 5 6 5" />
                </svg>
              </a>

              <a
                href="https://twitter.com/turismocba"
                data-label="X"
                target="_blank"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Seguir en X"
                rel="noopener nofollow"
              >
                <BsTwitterX size={24} />
              </a>

              <a
                href="https://www.youtube.com/channel/UCtZRc3h0m29bXR0CACn-VfQ"
                data-label="YouTube"
                target="_blank"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Síguenos en Youtube"
                rel="noopener nofollow"
              >
                <AiOutlineYoutube size={24} />
                
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                  focusable="false"
                > */}
                  {/* <rect x="3" y="7" width="18" height="10" rx="3" />
                  <path d="M11 9l4 3-4 3z" />
                </svg> */}
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
          <a
            href="https://www.cba.gov.ar/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Ir a cba.gov.ar"
          >
            <img
              src="/cba-gob-300x99.png"
              alt="Córdoba Gob"
              className="h-16 w-auto object-contain"
            />
          </a>
          <a
            href="https://www.regioncentro.gob.ar/institucional/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Ir a cba.gov.ar"
          >
            <img
              src="/region_centro_texto-1.png"
              alt="Region Centro"
              className="h-16 w-auto object-contain"
            />
          </a>
          <a
            href="https://www.argentina.gob.ar/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Ir a cba.gov.ar"
          >
            <img
              src="/argentinaministerio-300x85.png"
              alt="Argentina Ministerio"
              className="h-16 w-auto object-contain"
            />
          </a>
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
