import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, BotMessageSquareIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";
import { useAccommodationTypes } from "@/hooks/use-accommodation-types";
import { useChat } from "@/hooks/use-chat";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  accommodation: Accommodation;
}

const PropertyCard = memo(({ accommodation }: PropertyCardProps) => {
  const { nombre, localidad, direccion, paginaWeb, tipo, imagenes } =
    accommodation;
  const { data: tiposAlojamiento } = useAccommodationTypes();
  const { addAccommodationToChat } = useChat();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Obtener el nombre del tipo de alojamiento
  const tipoNombre =
    tiposAlojamiento?.find((t) => t.id === tipo)?.name || `Tipo ${tipo}`;

  const handleAddToChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      addAccommodationToChat(nombre, direccion || "Sin dirección");
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full h-full hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col border border-border hover:border-primary/50 bg-card">
      <AspectRatio
        ratio={16 / 9}
        className="overflow-hidden rounded-t-lg bg-gray-100"
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        <img
          src={
            imagenes && imagenes.length > 0
              ? imagenes[0]
              : "/imagenpordefeto.jpg"
          }
          alt={nombre}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onError={(e) => {
            e.currentTarget.src = "/imagenpordefeto.jpg";
            setImageLoading(false);
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
              img.src = "/imagenpordefeto.jpg";
            } else {
              setImageLoading(false);
            }
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {paginaWeb && (
          <a
            href={
              paginaWeb.startsWith("http") ? paginaWeb : `https://${paginaWeb}`
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir sitio web del alojamiento"
            className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow"
            title="Sitio web"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-label="Sitio web"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a15 15 0 010 18" />
              <path d="M12 3a15 15 0 000 18" />
            </svg>
          </a>
        )}
      </AspectRatio>
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <h3
            className="font-bold text-sm text-card-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2"
            title={nombre} // Tooltip para mostrar nombre completo
          >
            {nombre}
          </h3>

          {/* Información de ubicación - responsive */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="shrink-0">📍</span>
              <span className="truncate" title={localidad}>
                {localidad}
              </span>
            </div>
            {direccion ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="shrink-0">🏠</span>
                <span className="truncate" title={direccion}>
                  {direccion}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="shrink-0">🏠</span>
                <span className="truncate" title="Sin dirección disponible">
                  Sin dirección disponible
                </span>
              </div>
            )}
          </div>
          <div className="mt-auto space-y-2">
            {/* Badge del tipo - responsive */}
            <div className="w-full">
              <div
                className="text-xs font-medium w-full py-2 px-3 leading-snug min-h-12 flex items-center justify-center text-center bg-secondary text-secondary-foreground rounded-md"
                title={tipoNombre} // Tooltip para texto completo
              >
                <span className="wrap-break-word hyphens-auto">
                  {tipoNombre}
                </span>
              </div>
            </div>

            {/* Botón Agregar al chat - responsive */}
            <motion.button
              onClick={handleAddToChat}
              disabled={isAdding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-white transition-all py-1.5 px-2.5 rounded-md hover:shadow-md active:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/40 disabled:opacity-70 disabled:cursor-not-allowed bg-[linear-gradient(135deg,#F1010C_0%,#C34184_40%,#FE9221_80%)] mb-1"
              )}
              aria-label="Agregar alojamiento al chat"
              aria-busy={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <span>Agregar al chat</span>
                  <BotMessageSquareIcon className="w-3 h-3 " />
                </>
              )}
            </motion.button>

            {/* Botón Ver detalles - responsive */}
            <Link
              to={`/accommodation/${accommodation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary group-hover:underline hover:text-primary/80 transition-colors py-1 px-2 rounded-md hover:bg-primary/5"
            >
              Ver detalles
              <ExternalLink className="w-3 h-3 shrink-0" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PropertyCard.displayName = "PropertyCard";

export default PropertyCard;
