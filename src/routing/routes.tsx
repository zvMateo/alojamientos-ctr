import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import HomePage from "@/components/pages/_Home/HomePage";
import LoginPage from "@/components/pages/_Auth/LoginPage";
import { RoleGuard } from "@/guards/role-guard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RoleGuard>
        <HomePage />
      </RoleGuard>
    ),
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
