import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "../store/chat.store";

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
const SEND_TIMEOUT_MS = 180_000; // 180 segundos
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
  const hasMoved = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartTime = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
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

  const pendingAccommodationIdRef = useRef<string | number | null>(null);

  // Sincronizar inputMessage del store con el input local
  useEffect(() => {
    if (inputMessage) {
      setInput(inputMessage);
      pendingAccommodationIdRef.current = accommodationId;
      clearInput();
      if (!isOpen) openChat();
    }
  }, [inputMessage, accommodationId, clearInput, isOpen, openChat]);

  // Calcular posición óptima del panel cuando se abre
  useEffect(() => {
    if (!isOpen) return;

    const calculatePanelPosition = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const panelWidth =
        rect.width > 0
          ? rect.width
          : isMobile
          ? window.innerWidth - 32
          : Math.min(window.innerWidth * 0.92, 384);
      const panelHeight =
        rect.height > 0
          ? rect.height
          : isMobile
          ? Math.min(window.innerHeight * 0.85, window.innerHeight - 32)
          : Math.min(window.innerHeight * 0.7, 620);
      const margin = 16;
      const btnSize = 48;

      let panelX = pos.x;
      let panelY = pos.y - panelHeight - 8;

      if (panelY < margin) {
        panelY = pos.y + btnSize + 8;
      }

      if (panelX + panelWidth > window.innerWidth - margin) {
        panelX = window.innerWidth - panelWidth - margin;
      }
      if (panelX < margin) {
        panelX = margin;
      }

      if (panelY + panelHeight > window.innerHeight - margin) {
        panelY = window.innerHeight - panelHeight - margin;
      }
      if (panelY < margin) {
        panelY = margin;
      }

      setPanelPos({ x: panelX, y: panelY });
    };

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(calculatePanelPosition);
    });

    window.addEventListener("resize", calculatePanelPosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculatePanelPosition);
    };
  }, [isOpen, pos]);

  // Session init (persistente por 3 días)
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
          setMessages([
            makeMessage(
              "assistant",
              "¡Hola! Soy tu asistente de la Agencia Córdoba Turismo. ¿En qué puedo ayudarte?"
            ),
          ]);
        }
      } catch {
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
      const trimmed = messages.slice(-200);
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

  // Posicionar por defecto (bottom-right)
  useEffect(() => {
    const updateDefault = () => {
      const margin = 20;
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

      const deltaX = Math.abs(clientX - startPos.current.x);
      const deltaY = Math.abs(clientY - startPos.current.y);
      const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

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
      if (hasMoved.current) {
        e.preventDefault?.();
      }
      dragging.current = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (hasMoved.current) {
        e.preventDefault();
      }
      dragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
        replyText = (
          data?.reply ||
          data?.text ||
          data?.message ||
          ""
        ).toString();

        sidFromAgent = (data?.sessionId ||
          data?.session_id ||
          data?.session ||
          data?.cookie) as string | undefined;
        if (sidFromAgent) {
          try {
            const expiresAt = Date.now() + SESSION_TTL_MS;
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

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === typingMsg.id ? { ...m, content: replyText || "" } : m
        );

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
            const timeSinceLastMove = Date.now() - lastMoveTime.current;
            const dragDuration = Date.now() - dragStartTime.current;

            if (
              hasMoved.current ||
              (dragDuration > 150 && timeSinceLastMove < 400)
            ) {
              e.preventDefault();
              e.stopPropagation();
              setTimeout(() => {
                if (!isOpen) {
                  hasMoved.current = false;
                }
              }, 300);
              return;
            }
            openChat();
          }}
          onMouseDown={(e) => {
            dragging.current = true;
            hasMoved.current = false;
            dragStartTime.current = Date.now();
            lastMoveTime.current = Date.now();
            startOffset.current = {
              x: e.clientX - pos.x,
              y: e.clientY - pos.y,
            };
            startPos.current = { x: e.clientX, y: e.clientY };
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            dragging.current = true;
            hasMoved.current = false;
            dragStartTime.current = Date.now();
            lastMoveTime.current = Date.now();
            startOffset.current = {
              x: t.clientX - pos.x,
              y: t.clientY - pos.y,
            };
            startPos.current = { x: t.clientX, y: t.clientY };
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
          {/* Efecto de nebulosa animada */}
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
