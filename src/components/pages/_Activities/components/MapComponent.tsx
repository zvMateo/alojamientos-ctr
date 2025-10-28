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

          // Agregar definición de gradiente al SVG
          const defs =
            svgElement.querySelector("defs") ||
            document.createElementNS("http://www.w3.org/2000/svg", "defs");
          if (!svgElement.querySelector("defs")) {
            svgElement.insertBefore(defs, svgElement.firstChild);
          }

          // Crear gradiente lineal diagonal con los colores originales
          const gradientId = "mapGradient";
          const existingGradient = defs.querySelector(`#${gradientId}`);
          if (!existingGradient) {
            const gradient = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "linearGradient"
            );
            gradient.setAttribute("id", gradientId);
            // Gradiente diagonal de esquina superior izquierda a inferior derecha
            gradient.setAttribute("x1", "0%");
            gradient.setAttribute("y1", "0%");
            gradient.setAttribute("x2", "100%");
            gradient.setAttribute("y2", "100%");

            // Stops exactos del gradiente que proporcionaste
            const stop1 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", "#F1010C"); // Rojo

            const stop2 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop2.setAttribute("offset", "27.99%");
            stop2.setAttribute("stop-color", "#C34184"); // Morado

            const stop3 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop3.setAttribute("offset", "55.98%");
            stop3.setAttribute("stop-color", "#C34184"); // Morado (transición)

            const stop4 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop4.setAttribute("offset", "73.92%");
            stop4.setAttribute("stop-color", "#FE9221"); // Naranja

            const stop5 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop5.setAttribute("offset", "91.86%");
            stop5.setAttribute("stop-color", "#FE9221"); // Naranja (final)

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            gradient.appendChild(stop4);
            gradient.appendChild(stop5);
            defs.appendChild(gradient);
          }
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
              "cursor: pointer; fill: #d71f33; stroke: #fff; stroke-width: 5px; filter: drop-shadow(0 8px 16px rgba(215, 31, 51, 0.5)); transform: translateY(-40px);"
            );
          } else if (isHovered) {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: #B853A7; stroke: #fff; stroke-width: 3.02px; opacity: 0.8;"
            );
          } else {
            path.setAttribute(
              "style",
              "cursor: pointer; fill: url(#mapGradient); stroke: #fff; stroke-width: 3.02px;"
            );
          }
        };

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

          path.addEventListener("mouseenter", () => {
            const rect = path.getBoundingClientRect();
            setTooltip({
              text: departamentoNombre || "Sin nombre",
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });

            // Solo cambiar el hover si no está seleccionado
            if (selectedDepartamento !== departamentoNombre) {
              updatePathStyle(path, false, true);
            }
          });

          path.addEventListener("mouseleave", () => {
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
      })
      .catch(console.error);
  }, [prestadoresPorDepartamento, onSelectDepartamento, selectedDepartamento]);

  return (
    <div className="pt-5 pb-5 w-full h-full relative bg-gray-50">
      <div ref={svgRef} className="w-full h-full" />

      {tooltip && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-1 rounded text-sm z-50"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {selectedDepartamento && (
        <button
          onClick={onDeselectDepartamento}
          className="absolute top-4 left-4 z-50 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-lg"
        >
          ← Volver
        </button>
      )}
    </div>
  );
});

MapComponent.displayName = "MapComponent";

export default MapComponent;
