import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "@/components/pages/_Home/HomePage";
import PublicLayout from "@/components/layouts/PublicLayout";

// Lazy loading para la página de detalle
const AccommodationDetailPage = lazy(
  () => import("@/components/pages/_Home/AccommodationDetailPage")
);

// Lazy loading para la página de actividades
const ActivitiesPage = lazy(
  () => import("@/components/pages/_Activities/ActivitiePage.tsx")
);

// Componente de loading para Suspense
const PageLoading = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-lg font-medium text-muted-foreground">
        Cargando página...
      </p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/accommodation/:id",
        element: (
          <Suspense fallback={<PageLoading />}>
            <AccommodationDetailPage />
          </Suspense>
        ),
      },
      {
        path: "/activities",
        element: (
          <Suspense fallback={<PageLoading />}>
            <ActivitiesPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
