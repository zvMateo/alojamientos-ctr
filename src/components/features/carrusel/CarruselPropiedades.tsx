import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import PropertyCard from "./PropertyCard";
import { useLazyPopularProperties } from "@/hooks/use-lazy-popular-properties";
import { useFilterStore } from "@/zustand/filter.store";
import { memo, useMemo } from "react";

const CarruselPropiedades = memo(() => {
  // Obtener estado de visibilidad del carrusel
  const { isCarouselVisible } = useFilterStore();

  // Usar el hook lazy para cargar solo cuando sea visible
  const {
    data: destacados,
    isLoading,
    error,
  } = useLazyPopularProperties(isCarouselVisible);

  // Memoizar las cards para evitar re-renders innecesarios
  const cards = useMemo(() => destacados || [], [destacados]);

  // Si el carrusel no está visible, no renderizar nada
  if (!isCarouselVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="absolute bottom-40 left-0 right-0 z-30 h-44">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">
              Cargando propiedades destacadas...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Obteniendo todas las páginas disponibles
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="absolute bottom-40 left-0 right-0 z-30 h-44">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600">
              Error al cargar propiedades destacadas
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Intenta recargar la página
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <section className="absolute bottom-40 left-0 right-0 z-30 h-44">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">🏨</div>
            <p className="text-sm text-gray-500">
              No hay propiedades destacadas disponibles
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="absolute bottom-40 left-0 right-0 z-30 h-32 md:h-52 animate-in slide-in-from-bottom-4 duration-300">
      <div className="container mx-auto px-2 md:px-4 2xl:px-20 h-full flex items-center">
        <div className="w-full">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000, // Aumentar delay para mejor UX
                stopOnInteraction: true,
              }),
            ]}
          >
            <CarouselContent className="-ml-1 md:-ml-2 lg:-ml-4">
              {cards.map((accommodation) => (
                <CarouselItem
                  key={accommodation.id}
                  className="pl-1 md:pl-2 lg:pl-4 basis-[45%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
                >
                  <PropertyCard accommodation={accommodation} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
});

CarruselPropiedades.displayName = "CarruselPropiedades";

export default CarruselPropiedades;
