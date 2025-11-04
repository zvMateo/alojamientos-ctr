import { useEffect, useRef, useState, memo } from "react";
import type { Prestador } from "../types";

interface MapComponentProps {
  prestadoresPorDepartamento: Map<string, Prestador[]>;
  selectedDepartamento: string | null;
  onSelectDepartamento: (departamento: string) => void;
  onDeselectDepartamento: () => void;
}

// Mapeo aproximado de paths del SVG a departamentos de Córdoba
// Basado en el orden y posición geográfica
const PATH_TO_DEPARTAMENTO: Record<string, string> = {
  path162: "Capital",
  path72: "Tulumba",
  path142: "Colón",
  path70: "Sobremonte",
  path180: "Calamuchita",
  path98: "Cruz del Eje",
  path188: "San Javier",
  path132: "Punilla",
  path80: "Río Seco",
  path100: "Ischilin",
  path110: "Totoral",
  path108: "San Justo",
  path134: "Minas",
  path158: "Pocho",
  path166: "San Alberto",
  path214: "Rio Cuarto",
  path282: "General Roca",
  path268: "Presidente Roque Sáenz Peña",
  path232: "Juárez Celman",
  path192: "Unión",
  path204: "Marcos Juárez",
  path202: "General San Martín",
  path190: "Tercero Arriba",
  path160: "Rio Segundo",
  path118: "Rio Primero",
  path164: "Santa María",
};

const MapComponent = memo(function MapComponent({
  prestadoresPorDepartamento,
  selectedDepartamento,
  onSelectDepartamento,
  onDeselectDepartamento,
}: MapComponentProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const hoveredPathRef = useRef<SVGPathElement | null>(null);

  // Cargar SVG de Córdoba (interactivo)
  useEffect(() => {
    if (!svgRef.current) return;

    fetch("/Resultados_por_departamento_Córdoba,_Argentina,_2019.svg")
      .then((response) => response.text())
      .then((svgText) => {
        if (!svgRef.current) return;
        svgRef.current.innerHTML = svgText;

        const svgElement = svgRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "100%");
          svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }

        const paths = svgRef.current.querySelectorAll("path");

        // Función para actualizar el estilo del path
        const updatePathStyle = (
          path: SVGPathElement,
          isSelected: boolean,
          isHovered: boolean
        ) => {
          if (isSelected) {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #FF6B35; stroke: #fff; stroke-width: 6px; filter: drop-shadow(0 12px 24px rgba(255, 107, 53, 0.4)) drop-shadow(0 6px 12px rgba(215, 31, 51, 0.3)); transform: scale(1.02);"
            );
          } else if (isHovered) {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #FF8C42; stroke: #fff; stroke-width: 4px; transition: all 0.3s ease; filter: drop-shadow(0 4px 12px rgba(255, 107, 53, 0.3));"
            );
          } else {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #E63946; stroke: #fff; stroke-width: 2.5px; transition: all 0.3s ease;"
            );
          }
        };
        //

        // Guardar referencia al path seleccionado
        let selectedPathId: string | null = null;

        paths.forEach((path) => {
          const pathId = path.getAttribute("id") || "";
          const departamentoNombreRaw = PATH_TO_DEPARTAMENTO[pathId] || pathId;
          // Normalizar nombre del departamento (remover números al final)
          const departamentoNombre = departamentoNombreRaw.replace(/\d+$/, "");

          // Si el departamento del path coincide con el seleccionado, guardar este pathId
          if (selectedDepartamento === departamentoNombre && !selectedPathId) {
            selectedPathId = pathId;
          }

          // Estilo inicial
          updatePathStyle(path, pathId === selectedPathId, false);

          const updateTooltipPosition = () => {
            if (!svgRef.current) return;
            const rect = path.getBoundingClientRect();
            const containerRect = svgRef.current.getBoundingClientRect();
            setTooltip({
              text: departamentoNombre || "Sin nombre",
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top - 12,
            });
          };

          path.addEventListener("mouseenter", () => {
            hoveredPathRef.current = path;
            updateTooltipPosition();

            // Solo cambiar el hover si no está seleccionado
            if (selectedDepartamento !== departamentoNombre) {
              updatePathStyle(path, false, true);
            }
          });

          path.addEventListener("mousemove", () => {
            updateTooltipPosition();
          });

          path.addEventListener("mouseleave", () => {
            hoveredPathRef.current = null;
            setTooltip(null);

            // Restaurar estilo según si está seleccionado o no
            updatePathStyle(path, pathId === selectedPathId, false);
          });

          path.addEventListener("click", () => {
            // Seleccionar siempre el departamento clickeado, aunque no tenga datos
            onSelectDepartamento(departamentoNombre);

            // Actualizar estilos de todos los paths - solo marcar el path clickeado
            paths.forEach((p) => {
              const pId = p.getAttribute("id") || "";
              updatePathStyle(p, pId === pathId, false);
            });
          });
        });

        // Reposicionar tooltip en scroll/resize (para evitar drift)
        const handleReposition = () => {
          if (hoveredPathRef.current) {
            const p = hoveredPathRef.current;
            const rect = p.getBoundingClientRect();
            const containerRect = svgRef.current!.getBoundingClientRect();
            setTooltip((t) =>
              t
                ? {
                    text: t.text,
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top - 12,
                  }
                : t
            );
          }
        };
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);
        return () => {
          window.removeEventListener("scroll", handleReposition, true);
          window.removeEventListener("resize", handleReposition);
        };
      })
      .catch(console.error);
  }, [prestadoresPorDepartamento, onSelectDepartamento, selectedDepartamento]);

  return (
    <div className="pt-5 pb-5 w-full h-full relative overflow-hidden bg-linear-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Imagen de fondo (mapa.jpg) - fondo de Argentina responsive */}
      <img
        src="/public/mapa.jpg"
        className="absolute pointer-events-none w-full h-full object-cover md:object-contain"
        style={{
          zIndex: 0,
          opacity: 0.5,
          filter: "brightness(1.2) saturate(0.75) blur(0.2px)",
          left: "48%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Overlay degradado para dar profundidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.3) 100%)",
        }}
      />

      {/* SVG de Córdoba (interactivo) - con sombras pronunciadas para elevar sobre el fondo */}
      <div
        ref={svgRef}
        className="absolute pointer-events-auto"
        style={{
          zIndex: 1,
          width: "95%",
          height: "95%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          filter:
            "drop-shadow(0 20px 5px rgba(0, 0, 0, 0.35)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.25)) drop-shadow(0 5px 15px rgba(215, 31, 51, 0.3)) drop-shadow(0 0 2px rgba(0, 0, 0, 0.4))",
        }}
      />

      {tooltip && (
        <div
          className="absolute text-white px-4 py-2 rounded-lg text-sm font-medium z-50 pointer-events-none backdrop-blur-sm"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            backgroundColor: "#AE65BE",
            boxShadow:
              "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2">{tooltip.text}</div>
        </div>
      )}

      {selectedDepartamento && (
        <button
          onClick={onDeselectDepartamento}
          className="hidden lg:inline-flex absolute top-4 left-4 z-50 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-lg"
        >
          ← Volver
        </button>
      )}
    </div>
  );
});

MapComponent.displayName = "MapComponent";

export default MapComponent;
