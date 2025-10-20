import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { z } from "zod";
import { useAuthStore } from "@/zustand/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (status === "authenticated") {
      navigate("/");
    }
  }, [status, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  });

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full opacity-10 animate-pulse delay-500"></div>
        {/* Elementos adicionales para pantallas grandes */}
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-blue-100 rounded-full opacity-15 animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-indigo-100 rounded-full opacity-15 animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header con logo mejorado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Córdoba Turismo
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Panel de Administración
          </p>
          <div className="mt-4 w-24 h-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
        </div>

        {/* Formulario mejorado */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600 text-base">
                Accede a tu cuenta de administrador
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cordobaturismo.com"
                  className="h-14 text-base border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl"
                  {...register("email")}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 text-base border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl"
                  {...register("password")}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Iniciar Sesión</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </Button>
            </form>

            {/* Footer mejorado */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">© 2024 Córdoba Turismo</p>
                <p className="text-xs text-gray-400">
                  Todos los derechos reservados
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sistema seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
