import "./App.css";
import Router from "./routing/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ChatWidget from "@/components/features/chat/ChatWidget";
import { ToastProvider } from "@/components/ui/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos por defecto
      gcTime: 15 * 60 * 1000, // 15 minutos en caché por defecto
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Evitar refetch innecesarios
      refetchOnReconnect: true, // Refetch cuando se reconecta la red
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router />
        <ChatWidget />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
