import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getAlojamientoDetalle } from "@/services/alojamientos.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Building,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Share2,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useAccommodationTypes } from "@/hooks/use-accommodation-types";

export default function AccommodationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const { data: tiposAlojamiento } = useAccommodationTypes();

  const {
    data: accommodation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accommodation-detail", id],
    queryFn: () => getAlojamientoDetalle(Number(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: accommodation?.nombre || "Alojamiento",
          text: `Mira este alojamiento: ${accommodation?.nombre}`,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Cargando alojamiento...
          </h2>
          <p className="text-gray-600">
            Obteniendo información detallada del alojamiento
          </p>
        </div>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-8xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar el alojamiento
          </h2>
          <p className="text-gray-600 mb-8">
            No se pudo cargar la información del alojamiento.
            {error && " Verifica tu conexión a internet."}
          </p>
          <div className="space-x-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al mapa
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header mejorado */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              asChild
              className="hover:bg-gray-100 shrink-0"
            >
              <Link
                to="/"
                className="flex items-center gap-1 sm:gap-2 text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al mapa</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
              <Badge
                variant="secondary"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary text-white border-0 shrink-0 hidden sm:block"
              >
                {tiposAlojamiento?.find((t) => t.id === accommodation.tipo)
                  ?.name || `Tipo ${accommodation.tipo}`}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1 sm:gap-2 border-primary text-primary hover:bg-primary hover:text-white shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Compartir</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <Card className="mb-4 sm:mb-8 overflow-hidden shadow-xl border-0">
            <CardContent className="p-0">
              {/* Imagen principal con overlay */}
              <div className="relative">
                <AspectRatio ratio={21 / 9} className="overflow-hidden">
                  <img
                    src={
                      accommodation.imagenes &&
                        accommodation.imagenes.length > 0
                        ? accommodation.imagenes[0]
                        : "/imagenpordefeto.jpg"
                    }
                    alt={accommodation.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback a imagen por defecto si la imagen falla
                      e.currentTarget.src = "/imagenpordefeto.jpg";
                    }}
                    onLoad={(e) => {
                      // Verificar si la imagen cargó correctamente
                      const img = e.currentTarget;
                      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                        img.src = "/imagenpordefeto.jpg";
                      }
                    }}
                  />
                </AspectRatio>

                {/* Overlay con gradiente - ajustado para móvil */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                {/* Información sobre la imagen - responsive */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                  <div className="max-w-4xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight line-clamp-2">
                      {accommodation.nombre}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base md:text-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="line-clamp-1">
                          {accommodation.localidad}, {accommodation.region}
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        <span className="line-clamp-1">
                          {accommodation.direccion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de información */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Información principal */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Información de contacto */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <span className="text-lg sm:text-2xl">
                      Información de Contacto
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Teléfono */}
                    {accommodation.telefono && (
                      <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            Teléfono
                          </h3>
                        </div>
                        <a
                          href={`tel:${accommodation.telefono}`}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          {accommodation.telefono}
                        </a>
                      </div>
                    )}

                    {/* Email */}
                    {accommodation.email && (
                      <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Email</h3>
                        </div>
                        <a
                          href={`mailto:${accommodation.email}`}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          {accommodation.email}
                        </a>
                      </div>
                    )}

                    {/* Sitio web */}
                    {accommodation.paginaWeb && (
                      <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            Sitio web
                          </h3>
                        </div>
                        <a
                          href={
                            accommodation.paginaWeb.startsWith("http")
                              ? accommodation.paginaWeb
                              : `https://${accommodation.paginaWeb}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                        >
                          Visitar sitio web
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Propietario */}
                    {accommodation.nombreTitular && (
                      <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            Propietario
                          </h3>
                        </div>
                        <p className="text-gray-700 font-medium">
                          {accommodation.nombreTitular}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <span className="text-lg sm:text-2xl">Ubicación</span>
                  </h2>

                  <div className="bg-linear-to-r from-primary/5 to-primary/10 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${accommodation.coordenadas.lat},${accommodation.coordenadas.lng}`;
                          window.open(url, "_blank");
                        }}
                        className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white shrink-0 w-full sm:w-auto"
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Ver en Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
                      <div className="bg-white/50 rounded-lg p-3">
                        <span className="font-medium text-gray-600">
                          Dirección:
                        </span>
                        <p className="text-gray-800 mt-1">
                          {accommodation.direccion}
                        </p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <span className="font-medium text-gray-600">
                          Localidad:
                        </span>
                        <p className="text-gray-800 mt-1">
                          {accommodation.localidad}
                        </p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <span className="font-medium text-gray-600">
                          Región:
                        </span>
                        <p className="text-gray-800 mt-1">
                          {accommodation.region}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Información del alojamiento */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Información del Alojamiento
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Tipo:</span>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-white border-0"
                      >
                        {tiposAlojamiento?.find(
                          (t) => t.id === accommodation.tipo
                        )?.name || `Tipo ${accommodation.tipo}`}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Estado:</span>
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {accommodation.estado}
                      </span>
                    </div>

                    {accommodation.categoria && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">
                          Categoría:
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {accommodation.nombreCategoria ||
                            `Categoría ${accommodation.categoria}`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Acciones rápidas */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Acciones Rápidas
                  </h3>

                  <div className="space-y-2 sm:space-y-3">
                    <Button
                      onClick={handleShare}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          ¡Enlace copiado!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartir alojamiento
                        </>
                      )}
                    </Button>

                    {accommodation.telefono && (
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() =>
                          window.open(`tel:${accommodation.telefono}`)
                        }
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar ahora
                      </Button>
                    )}

                    {accommodation.email && (
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() =>
                          window.open(`mailto:${accommodation.email}`)
                        }
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar email
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
