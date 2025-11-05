import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
      {/* Logo PNG por encima del footer */}
      <div className="bg-[#FDFDFE] w-full overflow-hidden -mb-px">
        <img
          src="/footercba.png"
          alt="Agencia Córdoba Turismo Logo"
          className="w-full h-full object-cover block"
        />
      </div>
      <Footer />
    </div>
  );
}
