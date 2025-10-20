import MapContainer from "./components/MapContainer";
import AdminNavbar from "./components/AdminNavbar";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/zustand/filter.store";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

export default function HomePage() {
  const { selectedFilters, searchTerm } = useFilterStore();

  const { data } = useQuery({
    queryKey: ["alojamientos"],
    queryFn: async () => {
      // Datos simulados basados en la estructura real de Córdoba
      const mockData: Accommodation[] = [
        // Datos basados en la tabla real que me mostraste
        {
          id: "1",
          nombre: "Hotel Aymara",
          direccion: "Centenario 336",
          region: "De los Grandes Lagos",
          nombreArea: "Sierras del Sur",
          localidad: "Achiras",
          telefono: "03582 495730",
          email: "aymarahotel@hotmail.com",
          paginaWeb: "www.hotelaymara.com.ar",
          clase: "NO CATEGORIZADO",
          categoria: "",
          nombreTitular: "Teresita Clelia Arias",
          coordenadas: { lat: -33.1667, lng: -64.9833 }, // Achiras
          estado: "Activo",
        },
        {
          id: "2",
          nombre: "Hostal de las Sierras",
          direccion: "24 de Septiembre 358",
          region: "De los Grandes Lagos",
          nombreArea: "Sierras del Sur",
          localidad: "Achiras",
          telefono: "03582 495085",
          email: "delassierras@hotmail.com",
          paginaWeb: "www.hostaldelassierras.com",
          clase: "HOSTERIA Y/O POSADA",
          categoria: "1E",
          nombreTitular: "Raquel Susana Orozco",
          coordenadas: { lat: -33.1667, lng: -64.9833 }, // Achiras
          estado: "Activo",
        },
        {
          id: "3",
          nombre: "Hotel Di Martino",
          direccion: "Juan Bautista Bustos S/N",
          region: "De los Grandes Lagos",
          nombreArea: "Sierras del Sur",
          localidad: "Achiras",
          telefono: "03582 495612",
          email: "",
          paginaWeb: "",
          clase: "HOSTERIA Y/O POSADA",
          categoria: "1E",
          nombreTitular: "Juan Carlos Di Martino",
          coordenadas: { lat: -33.1667, lng: -64.9833 }, // Achiras
          estado: "Activo",
        },
        {
          id: "4",
          nombre: "La Casona de Doña Pabla",
          direccion: "Gral. Paz S/N",
          region: "De los Grandes Lagos",
          nombreArea: "Sierras del Sur",
          localidad: "Achiras",
          telefono: "0358 154244462",
          email: "lacasonadedonapabla@hotmail.com",
          paginaWeb: "www.lacasonadedonapabla.com.ar",
          clase: "NO CATEGORIZADO",
          categoria: "",
          nombreTitular: "Jose Victor Hugo Tello",
          coordenadas: { lat: -33.1667, lng: -64.9833 }, // Achiras
          estado: "Activo",
        },

        // Algunos alojamientos en otras localidades para diversificar
        {
          id: "5",
          nombre: "Hotel Plaza",
          direccion: "Av. Colón 123",
          region: "Capital",
          nombreArea: "Centro",
          localidad: "Córdoba Capital",
          telefono: "0351 1234567",
          email: "info@hotelplaza.com",
          paginaWeb: "www.hotelplaza.com.ar",
          clase: "HOTEL",
          categoria: "3E",
          nombreTitular: "María González",
          coordenadas: { lat: -31.4167, lng: -64.1833 },
          estado: "Activo",
        },
        {
          id: "6",
          nombre: "Hostel Carlos Paz",
          direccion: "Av. San Martín 123",
          region: "De los Grandes Lagos",
          nombreArea: "Valle de Punilla",
          localidad: "Villa Carlos Paz",
          telefono: "03541 123456",
          email: "info@hostelcarlospaz.com",
          paginaWeb: "www.hostelcarlospaz.com.ar",
          clase: "HOSTEL",
          categoria: "1E",
          nombreTitular: "Carlos Rodríguez",
          coordenadas: { lat: -31.4244, lng: -64.4978 },
          estado: "Activo",
        },
        {
          id: "7",
          nombre: "Cabañas La Cumbre",
          direccion: "Ruta 38 Km 45",
          region: "De los Grandes Lagos",
          nombreArea: "Valle de Punilla",
          localidad: "La Cumbre",
          telefono: "03548 123456",
          email: "info@cabanaslacumbre.com",
          paginaWeb: "www.cabanaslacumbre.com.ar",
          clase: "CABAÑAS",
          categoria: "2E",
          nombreTitular: "Ana Martínez",
          coordenadas: { lat: -30.9833, lng: -64.4833 },
          estado: "Activo",
        },
        {
          id: "8",
          nombre: "Camping San Roque",
          direccion: "Costanera del Lago",
          region: "De los Grandes Lagos",
          nombreArea: "Valle de Punilla",
          localidad: "Villa Carlos Paz",
          telefono: "03541 987654",
          email: "info@campingsanroque.com",
          paginaWeb: "www.campingsanroque.com.ar",
          clase: "CAMPING",
          categoria: "1E",
          nombreTitular: "Roberto Silva",
          coordenadas: { lat: -31.4, lng: -64.5 },
          estado: "Activo",
        },
      ];

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockData;
    },
  });

  // Filtrar datos basado en los filtros seleccionados y búsqueda
  const filteredData =
    data?.filter((alojamiento) => {
      const tipoMatch =
        !selectedFilters.tipo || alojamiento.clase === selectedFilters.tipo;
      const localidadMatch =
        !selectedFilters.localidad ||
        alojamiento.localidad === selectedFilters.localidad;
      const estadoMatch =
        !selectedFilters.estado ||
        alojamiento.estado === selectedFilters.estado;

      // Búsqueda por nombre (case insensitive)
      const searchMatch =
        !searchTerm ||
        alojamiento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alojamiento.localidad
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        alojamiento.direccion.toLowerCase().includes(searchTerm.toLowerCase());

      return tipoMatch && localidadMatch && estadoMatch && searchMatch;
    }) || [];

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Navbar flotante */}
      <AdminNavbar data={data} filteredData={filteredData} />

      {/* Mapa ocupando toda la pantalla */}
      <div className="absolute inset-0 w-full h-full">
        <MapContainer data={data} filteredData={filteredData} />
      </div>
    </div>
  );
}
