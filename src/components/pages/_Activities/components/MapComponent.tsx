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
              "cursor: pointer; fill: #FE9221; stroke: #fff; stroke-width: 5px; filter: drop-shadow(0 8px 16px rgba(215, 31, 51, 0.5)); transform: translateY(-40px);"
            );
          } else if (isHovered) {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #FE9221; stroke: #fff; stroke-width: 3.02px; opacity: 0.8;"
            );
          } else {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #F1010C; stroke: #fff; stroke-width: 3.02px;"
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
    <div className="pt-5 pb-5 w-full h-full relative bg-gray-50">
      <div ref={svgRef} className="w-full h-full" />

      {tooltip && (
        <div
          className="absolute text-white px-3 py-1 rounded text-sm z-50 shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            backgroundColor: "#B853A7",
          }}
        >
          {tooltip.text}
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
