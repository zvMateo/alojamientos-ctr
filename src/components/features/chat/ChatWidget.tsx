import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/zustand/chat.store";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const BRAND_GRADIENT =
  "bg-[linear-gradient(135deg,_#F1010C_0%,_#C34184_40%,_#FE9221_80%)]";

const SESSION_KEY = "chat_session_cba";
const HISTORY_PREFIX = "chat_history_cba_";
const SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 días
const SEND_TIMEOUT_MS = 180_000; // 120 segundos
const makeMessage = (role: "user" | "assistant", content: string) => ({
  id: crypto.randomUUID(),
  role,
  content,
});

const ChatWidget = memo(function ChatWidget() {
  const {
    isOpen,
    inputMessage,
    accommodationId,
    openChat,
    closeChat,
    clearInput,
  } = useChatStore();
  // Posición del botón (por defecto bottom-right)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<HTMLButtonElement | null>(null);
  const dragging = useRef(false);
  const startOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef(false); // Para detectar si hubo movimiento durante el arrastre
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // Posición inicial del arrastre
  const dragStartTime = useRef<number>(0); // Tiempo cuando empezó el arrastre
  const lastMoveTime = useRef<number>(0); // Última vez que hubo movimiento
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Referencia para guardar el accommodationId temporalmente
  const pendingAccommodationIdRef = useRef<string | number | null>(null);

  // Sincronizar inputMessage del store con el input local
  useEffect(() => {
    if (inputMessage) {
      setInput(inputMessage);
      // Guardar el accommodationId en la ref antes de limpiar el store
      pendingAccommodationIdRef.current = accommodationId;
      clearInput(); // Limpiar el store después de leer
      if (!isOpen) openChat();
    }
  }, [inputMessage, accommodationId, clearInput, isOpen, openChat]);

  // Calcular posición óptima del panel cuando se abre
  useEffect(() => {
    if (!isOpen) return;

    const calculatePanelPosition = () => {
      const panel = panelRef.current;
      if (!panel) return;

      // Usar getBoundingClientRect para obtener dimensiones reales
      const rect = panel.getBoundingClientRect();
      // Si las dimensiones son 0, usar valores por defecto basados en las clases CSS
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const panelWidth =
        rect.width > 0
          ? rect.width
          : isMobile
          ? window.innerWidth - 32 // w-[calc(100vw-32px)]
          : Math.min(window.innerWidth * 0.92, 384); // w-[92vw] max-w-sm
      const panelHeight =
        rect.height > 0
          ? rect.height
          : isMobile
          ? Math.min(window.innerHeight * 0.85, window.innerHeight - 32) // h-[85vh] en mobile
          : Math.min(window.innerHeight * 0.7, 620); // h-[70vh] max-h-[620px]
      const margin = 16;
      const btnSize = 48;

      // Calcular posición basada en la posición del botón
      let panelX = pos.x;
      let panelY = pos.y - panelHeight - 8; // 8px de gap entre botón y panel

      // Si el panel sale por la parte superior, ponerlo debajo del botón
      if (panelY < margin) {
        panelY = pos.y + btnSize + 8;
      }

      // Ajustar horizontalmente si se sale por los bordes
      if (panelX + panelWidth > window.innerWidth - margin) {
        panelX = window.innerWidth - panelWidth - margin;
      }
      if (panelX < margin) {
        panelX = margin;
      }

      // Ajustar verticalmente si se sale por la parte inferior
      if (panelY + panelHeight > window.innerHeight - margin) {
        panelY = window.innerHeight - panelHeight - margin;
      }
      if (panelY < margin) {
        panelY = margin;
      }

      setPanelPos({ x: panelX, y: panelY });
    };

    // Usar requestAnimationFrame para asegurar que el DOM se haya renderizado y pintado
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(calculatePanelPosition);
    });

    // Recalcular en resize
    window.addEventListener("resize", calculatePanelPosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculatePanelPosition);
    };
  }, [isOpen, pos]);

  // Session init (persistente por 3 días) - encapsulado para claridad
  const initSession = useCallback(() => {
    try {
      const now = Date.now();
      const raw = localStorage.getItem(SESSION_KEY);
      let id: string | null = null;
      let expiresAt: number | null = null;
      let isNew = false;

      if (raw) {
        const parsed = JSON.parse(raw) as { id: string; expiresAt: number };
        if (parsed?.id && parsed?.expiresAt && parsed.expiresAt > now) {
          id = parsed.id;
          expiresAt = parsed.expiresAt;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      if (!id) {
        id = crypto.randomUUID();
        expiresAt = now + SESSION_TTL_MS;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id, expiresAt }));
        isNew = true;
      }

      setSessionId(id);
      setSessionExpiresAt(expiresAt);

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as
        | string
        | undefined;
      if (isNew && webhookUrl) {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "session_start",
            sessionId: id,
            source: "alojamientos-ctr",
            context: {
              route: window.location.pathname,
              locale: navigator.language,
              tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }),
        }).catch(() => {
          /* no-op */
        });
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const restoreHistory = useCallback(
    (sid: string | null) => {
      if (!sid) {
        // Si no hay sesión, mostrar mensaje de bienvenida
        setMessages([
          makeMessage(
            "assistant",
            "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
          ),
        ]);
        return;
      }
      try {
        const sRaw = localStorage.getItem(SESSION_KEY);
        const sessionData = sRaw
          ? (JSON.parse(sRaw) as { id: string; expiresAt: number })
          : null;
        const expiresAt = sessionData?.expiresAt ?? sessionExpiresAt ?? 0;
        if (expiresAt && expiresAt < Date.now()) {
          // Sesión expirada, limpiar y mostrar mensaje de bienvenida
          localStorage.removeItem(HISTORY_PREFIX + sid);
          setMessages([
            makeMessage(
              "assistant",
              "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
            ),
          ]);
          return;
        }

        const raw = localStorage.getItem(HISTORY_PREFIX + sid);
        if (!raw) {
          // No hay historial, mostrar mensaje de bienvenida
          setMessages([
            makeMessage(
              "assistant",
              "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
            ),
          ]);
          return;
        }
        const parsed = JSON.parse(raw) as {
          messages: ChatMessage[];
          expiresAt?: number;
        };

        // Verificar si el historial está expirado
        if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
          localStorage.removeItem(HISTORY_PREFIX + sid);
          setMessages([
            makeMessage(
              "assistant",
              "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
            ),
          ]);
          return;
        }

        if (
          parsed?.messages &&
          Array.isArray(parsed.messages) &&
          parsed.messages.length > 0
        ) {
          setMessages(parsed.messages);
        } else {
          // Si no hay mensajes en el historial, mostrar mensaje de bienvenida
          setMessages([
            makeMessage(
              "assistant",
              "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
            ),
          ]);
        }
      } catch {
        // Si hay error al parsear, mostrar mensaje de bienvenida
        setMessages([
          makeMessage(
            "assistant",
            "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
          ),
        ]);
      }
    },
    [sessionExpiresAt]
  );

  // Guardar historial en cada cambio
  useEffect(() => {
    if (!sessionId || !messages || messages.length === 0) return;
    try {
      const trimmed = messages.slice(-200); // límite de seguridad
      const payload = {
        messages: trimmed,
        updatedAt: Date.now(),
        expiresAt: sessionExpiresAt ?? Date.now() + SESSION_TTL_MS,
      };
      localStorage.setItem(HISTORY_PREFIX + sessionId, JSON.stringify(payload));
    } catch {
      // almacenamiento lleno o deshabilitado
    }
  }, [messages, sessionId, sessionExpiresAt]);

  // Auto-scroll to last message
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  // init session + restore history
  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (sessionId) restoreHistory(sessionId);
  }, [sessionId, restoreHistory]);

  // Posicionar por defecto (bottom-right) y reajustar en resize
  useEffect(() => {
    const updateDefault = () => {
      const margin = 20; // equivalente a right-4 bottom-4
      const btn = dragRef.current;
      const width = btn?.offsetWidth || 48;
      const height = btn?.offsetHeight || 48;
      setPos({
        x: window.innerWidth - width - margin,
        y: window.innerHeight - height - margin,
      });
    };
    updateDefault();
    window.addEventListener("resize", updateDefault);
    return () => window.removeEventListener("resize", updateDefault);
  }, []);

  // Drag: mouse y touch
  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      if (!dragging.current) return;

      // Detectar si hubo movimiento significativo (más de 8px para balancear precisión)
      const deltaX = Math.abs(clientX - startPos.current.x);
      const deltaY = Math.abs(clientY - startPos.current.y);
      const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Si hay movimiento significativo, marcar inmediatamente
      // 8px es suficiente para distinguir click accidental vs arrastre intencional
      if (totalDistance > 8) {
        hasMoved.current = true;
        lastMoveTime.current = Date.now();
      }

      const margin = 8;
      const btn = dragRef.current;
      const width = btn?.offsetWidth || 48;
      const height = btn?.offsetHeight || 48;
      const x = Math.min(
        Math.max(clientX - startOffset.current.x, margin),
        window.innerWidth - width - margin
      );
      const y = Math.min(
        Math.max(clientY - startOffset.current.y, margin),
        window.innerHeight - height - margin
      );
      setPos({ x, y });
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleMouseUp = (e: MouseEvent) => {
      // Si hubo movimiento, prevenir cualquier click subsecuente
      if (hasMoved.current) {
        // Cancelar el evento para prevenir el click
        e.preventDefault?.();
      }
      dragging.current = false;
      // hasMoved se mantiene hasta el siguiente onMouseDown para prevenir el click
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      // Si hubo movimiento, prevenir cualquier click subsecuente
      if (hasMoved.current) {
        e.preventDefault();
      }
      dragging.current = false;
      // hasMoved se mantiene hasta el siguiente onTouchStart para prevenir el click
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // El tipo de EventListener para touchmove difiere; realizamos un cast controlado
      window.removeEventListener(
        "touchmove",
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

  // Send message (POST)
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setErrorText(null);
    const userMsg = makeMessage("user", text);
    const typingMsg = makeMessage("assistant", "Escribiendo…");

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput("");
    setIsSending(true);

    if (!webhookUrl) {
      const err = "Falta VITE_N8N_WEBHOOK_URL en el entorno (.env).";
      setErrorText(err);
      setMessages((prev) =>
        prev.map((m) => (m.id === typingMsg.id ? { ...m, content: err } : m))
      );
      setIsSending(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

    let sidFromAgent: string | undefined = undefined;

    // Capturar el accommodationId pendiente y limpiar la ref
    const currentAccommodationId = pendingAccommodationIdRef.current;
    pendingAccommodationIdRef.current = null;

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          source: "alojamientos-ctr",
          sessionId: sessionId ?? "unknown",
          ...(currentAccommodationId && {
            accommodationId: currentAccommodationId,
          }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Error ${res.status}: ${body || res.statusText}`);
      }

      const contentType = res.headers.get("content-type") || "";
      let replyText = "";

      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        // Extraer texto de respuesta
        replyText = (
          data?.reply ||
          data?.text ||
          data?.message ||
          ""
        ).toString();

        // Si el agente responde con un sessionId (ej: cuando n8n crea/normaliza sesión), persistirlo
        sidFromAgent = (data?.sessionId ||
          data?.session_id ||
          data?.session ||
          data?.cookie) as string | undefined;
        if (sidFromAgent) {
          try {
            const expiresAt = Date.now() + SESSION_TTL_MS;
            // Actualizar SESSION_KEY y estado
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ id: sidFromAgent, expiresAt })
            );
            setSessionId(sidFromAgent);
            setSessionExpiresAt(expiresAt);
          } catch {
            // ignore storage failures
          }
        }
      } else {
        replyText = await res.text();
      }

      // Actualizar el mensaje de "Escribiendo…" y persistir el historial inmediatamente
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === typingMsg.id ? { ...m, content: replyText || "" } : m
        );

        // Persistir bajo la session correcta: preferir sidFromAgent si fue devuelta
        const sidToUse = sidFromAgent ?? sessionId;
        if (sidToUse) {
          try {
            const trimmed = next.slice(-200);
            const newExpiresAt = Date.now() + SESSION_TTL_MS;
            const payload = {
              messages: trimmed,
              updatedAt: Date.now(),
              expiresAt: newExpiresAt,
            };
            localStorage.setItem(
              HISTORY_PREFIX + sidToUse,
              JSON.stringify(payload)
            );
          } catch {
            // ignore storage failures
          }
        }

        return next;
      });
    } catch {
      clearTimeout(timeout);
      const friendly = "Ocurrió un error al contactar el asistente.";

      setErrorText(friendly);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingMsg.id ? { ...m, content: friendly } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, webhookUrl, sessionId]);

  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          ref={dragRef}
          onClick={(e) => {
            // Prevenir la apertura si hubo arrastre
            const timeSinceLastMove = Date.now() - lastMoveTime.current;
            const dragDuration = Date.now() - dragStartTime.current;

            // Verificaciones múltiples para detectar arrastre vs click:
            // 1. Si hubo movimiento detectado (>10px)
            // 2. Si el drag duró más de 150ms (tiempo típico de arrastre vs click rápido)
            // 3. Si hubo movimiento muy reciente (dentro de los últimos 400ms)
            if (
              hasMoved.current ||
              (dragDuration > 150 && timeSinceLastMove < 400)
            ) {
              e.preventDefault();
              e.stopPropagation();
              // Forzar reset para el próximo ciclo
              setTimeout(() => {
                if (!isOpen) {
                  hasMoved.current = false;
                }
              }, 300);
              return;
            }
            // Solo abrir si fue un click legítimo (sin arrastre)
            openChat();
          }}
          onMouseDown={(e) => {
            dragging.current = true;
            hasMoved.current = false; // Resetear antes de empezar
            dragStartTime.current = Date.now();
            lastMoveTime.current = Date.now();
            startOffset.current = {
              x: e.clientX - pos.x,
              y: e.clientY - pos.y,
            };
            startPos.current = { x: e.clientX, y: e.clientY }; // Guardar posición inicial
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            dragging.current = true;
            hasMoved.current = false; // Resetear antes de empezar
            dragStartTime.current = Date.now();
            lastMoveTime.current = Date.now();
            startOffset.current = {
              x: t.clientX - pos.x,
              y: t.clientY - pos.y,
            };
            startPos.current = { x: t.clientX, y: t.clientY }; // Guardar posición inicial
          }}
          aria-label="Abrir chat"
          className={cn(
            "fixed z-50 h-12 w-12 rounded-full shadow-xl text-white flex items-center justify-center overflow-hidden",
            "hover:opacity-95 active:opacity-90 transition-opacity"
          )}
          style={{
            left: pos.x,
            top: pos.y,
            background:
              "linear-gradient(135deg, #F1010C 0%, #C34184 40%, #FE9221 80%)",
          }}
        >
          {/* Efecto de nebulosa animada - Capa 1 */}
          <div
            className="absolute inset-0 chat-button-nebula"
            style={{
              opacity: 0.7,
              background: `
                radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 45%),
                radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(193, 65, 132, 0.7) 0%, transparent 55%)
              `,
            }}
          />
          {/* Efecto de nebulosa animada - Capa 2 (con delay) */}
          <div
            className="absolute inset-0 chat-button-nebula"
            style={{
              opacity: 0.6,
              animationDelay: "2.5s",
              background: `
                radial-gradient(circle at 50% 50%, rgba(254, 146, 33, 0.7) 0%, transparent 60%),
                radial-gradient(circle at 70% 20%, rgba(241, 1, 12, 0.6) 0%, transparent 45%),
                radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.5) 0%, transparent 50%)
              `,
            }}
          />
          {/* Efecto de nebulosa animada - Capa 3 (más sutil) */}
          <div
            className="absolute inset-0 chat-button-nebula"
            style={{
              opacity: 0.4,
              animationDelay: "5s",
              background: `
                radial-gradient(circle at 60% 40%, rgba(193, 65, 132, 0.5) 0%, transparent 65%)
              `,
            }}
          />
          <Bot className="h-6 w-6 relative z-10" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-50 w-[calc(100vw-32px)] sm:w-[92vw] max-w-sm h-[85vh] sm:h-[70vh] max-h-[620px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          style={{ left: panelPos.x, top: panelPos.y }}
        >
          {/* Header */}
          <div
            className={cn(
              "px-4 py-3 text-white flex items-center justify-between",
              BRAND_GRADIENT
            )}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  Asistente CBA Turismo
                </p>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="h-[calc(100%-112px)] overflow-y-auto p-3 space-y-3 bg-gray-50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-primary/10 text-gray-900 border border-primary/20"
                      : "bg-white text-gray-900 border border-gray-200"
                  )}
                >
                  {m.content === "Escribiendo…" ? (
                    <div className="flex items-center gap-1">
                      <span>Escribiendo</span>
                      <span className="flex gap-0.5">
                        <span
                          className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                          style={{
                            animationDelay: "0ms",
                            animationDuration: "1s",
                          }}
                        ></span>
                        <span
                          className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                          style={{
                            animationDelay: "200ms",
                            animationDuration: "1s",
                          }}
                        ></span>
                        <span
                          className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                          style={{
                            animationDelay: "400ms",
                            animationDuration: "1s",
                          }}
                        ></span>
                      </span>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            {errorText && (
              <div className="mb-2 text-xs text-red-600">{errorText}</div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSend && !isSending) handleSend();
                }}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Escribe tu mensaje..."
              />
              <button
                onClick={handleSend}
                disabled={!canSend || isSending}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white disabled:opacity-60",
                  BRAND_GRADIENT
                )}
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {isSending ? "Enviando" : "Enviar"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ChatWidget.displayName = "ChatWidget";

export default ChatWidget;
