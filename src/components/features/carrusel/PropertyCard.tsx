import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";
import { useAccommodationTypes } from "@/hooks/use-accommodation-types";
import { memo } from "react";

interface PropertyCardProps {
  accommodation: Accommodation;
}

const PropertyCard = memo(({ accommodation }: PropertyCardProps) => {
  const { nombre, localidad, direccion, paginaWeb, tipo, imagenes } =
    accommodation;
  const { data: tiposAlojamiento } = useAccommodationTypes();

  // Obtener el nombre del tipo de alojamiento
  const tipoNombre =
    tiposAlojamiento?.find((t) => t.id === tipo)?.name || `Tipo ${tipo}`;

  return (
    <Card className="w-full h-full hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col border border-border hover:border-primary/50 bg-card">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
        <img
          src={
            imagenes && imagenes.length > 0
              ? imagenes[0]
              : "/region_centro_texto-1.png"
          }
          alt={nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback a placeholder si la imagen falla
            e.currentTarget.src = "/region_centro_texto-1.png";
          }}
          onLoad={(e) => {
            // Verificar si la imagen cargó correctamente
            const img = e.currentTarget;
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
              img.src = "/region_centro_texto-1.png";
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
