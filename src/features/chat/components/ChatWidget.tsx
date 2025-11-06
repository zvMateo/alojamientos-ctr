import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "../store/chat.store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMapStore } from "@/features/accommodations/store/map.store";

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
  const { isOpen, inputMessage, openChat, closeChat } = useChatStore();

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
  const inputRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const pendingAccommodationIdsRef = useRef<(string | number)[]>([]);
  const setSelectedAccommodationId = useMapStore(
    (s) => s.setSelectedAccommodationId
  );
  // Contador para detectar doble backspace/delete adyacente a un span de alojamiento
  const deleteIntentRef = useRef<{
    span: HTMLElement | null;
    count: number;
    ts: number;
    dir: "back" | "del" | null;
  }>({ span: null, count: 0, ts: 0, dir: null });

  // Función para renderizar mensajes con alojamientos clicables y links de Google Maps
  const renderMessageContent = useCallback(
    (content: string) => {
      // Detectar formato: **ACCOMMODATION:id:nombre**
      const accommodationRegex = /\*\*ACCOMMODATION:([^:]+):([^*]+)\*\*/g;
      // Detectar URLs de Google Maps
      const googleMapsRegex =
        /(https?:\/\/(?:www\.)?google\.com\/maps\/[^\s]+)/g;

      const hasAccommodations = accommodationRegex.test(content);
      const hasGoogleMaps = googleMapsRegex.test(content);

      // Resetear regex
      accommodationRegex.lastIndex = 0;
      googleMapsRegex.lastIndex = 0;

      if (!hasAccommodations && !hasGoogleMaps) {
        // Si no hay alojamientos ni links, renderizar normal con markdown
        return (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ children }) => (
                  <strong className="font-bold">{children}</strong>
                ),
                p: ({ children }) => (
                  <p className="mb-1 last:mb-0">{children}</p>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        );
      }

      // Dividir el contenido en partes
      const parts: React.JSX.Element[] = [];
      let lastIndex = 0;

      // Primero, reemplazar links de Google Maps
      let processedContent = content;
      const mapsMatches = [...content.matchAll(googleMapsRegex)];

      mapsMatches.forEach((match, index) => {
        const placeholder = `___GOOGLE_MAPS_${index}___`;
        processedContent = processedContent.replace(match[0], placeholder);
      });

      // Procesar alojamientos en el contenido procesado
      let match;
      while ((match = accommodationRegex.exec(processedContent)) !== null) {
        const [fullMatch, id, nombre] = match;
        const matchIndex = match.index;

        // Agregar texto antes del match (procesando placeholders de maps)
        if (matchIndex > lastIndex) {
          const beforeText = processedContent.slice(lastIndex, matchIndex);
          parts.push(
            ...processTextWithMaps(beforeText, mapsMatches, lastIndex)
          );
        }

        // Agregar el alojamiento como botón clicable
        parts.push(
          <button
            key={`accommodation-${id}-${matchIndex}`}
            onClick={() => {
              setSelectedAccommodationId(id);
            }}
            className="font-bold text-primary hover:text-primary/80 underline decoration-primary hover:decoration-primary/80 transition-colors cursor-pointer"
          >
            {nombre}
          </button>
        );

        lastIndex = matchIndex + fullMatch.length;
      }

      // Agregar texto después del último match
      if (lastIndex < processedContent.length) {
        const afterText = processedContent.slice(lastIndex);
        parts.push(...processTextWithMaps(afterText, mapsMatches, lastIndex));
      }

      // Función helper para procesar texto con placeholders de Google Maps
      function processTextWithMaps(
        text: string,
        mapsMatches: RegExpMatchArray[],
        keyOffset: number
      ): React.JSX.Element[] {
        const textParts: React.JSX.Element[] = [];
        let textLastIndex = 0;

        mapsMatches.forEach((mapMatch, index) => {
          const placeholder = `___GOOGLE_MAPS_${index}___`;
          const placeholderIndex = text.indexOf(placeholder, textLastIndex);

          if (placeholderIndex >= 0) {
            // Texto antes del placeholder
            if (placeholderIndex > textLastIndex) {
              const before = text.slice(textLastIndex, placeholderIndex);
              textParts.push(
                <span key={`text-${keyOffset}-${textLastIndex}`}>{before}</span>
              );
            }

            // Link de Google Maps
            textParts.push(
              <a
                key={`maps-${index}-${keyOffset}`}
                href={mapMatch[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 transition-colors"
              >
                TU RUTA 🛣️
              </a>
            );

            textLastIndex = placeholderIndex + placeholder.length;
          }
        });

        // Texto restante
        if (textLastIndex < text.length) {
          const remaining = text.slice(textLastIndex);
          textParts.push(
            <span key={`text-${keyOffset}-${textLastIndex}-end`}>
              {remaining}
            </span>
          );
        }

        return textParts;
      }

      return (
        <div
          className="whitespace-pre-wrap"
          style={{ wordBreak: "break-word" }}
        >
          {parts}
        </div>
      );
    },
    [setSelectedAccommodationId]
  );

  // Sincronizar inputMessage del store con el input local
  useEffect(() => {
    if (!inputRef.current) return;

    const storeMessage = inputMessage;
    const currentText = inputRef.current.textContent || "";

    if (storeMessage !== currentText) {
      const { accommodationIds, lastAccommodationName } =
        useChatStore.getState();
      const lastId = accommodationIds[accommodationIds.length - 1];

      // Si se agregó un alojamiento y tenemos el nombre exacto
      if (
        lastId &&
        lastAccommodationName &&
        storeMessage.length > currentText.length
      ) {
        // Usar el nombre exacto del store, no calcular con substring
        const newName = lastAccommodationName;

        // Agregar espacio antes si es necesario
        const needsSpace =
          inputRef.current.textContent &&
          !inputRef.current.textContent.endsWith(" ");
        if (needsSpace) {
          inputRef.current.appendChild(document.createTextNode(" "));
        }

        // Crear span con estilos para el alojamiento
        const span = document.createElement("span");
        span.className =
          "font-bold text-primary underline decoration-primary accommodation-name";
        span.contentEditable = "false";
        span.setAttribute("data-accommodation-id", String(lastId));
        span.setAttribute("data-original-name", newName);
        span.textContent = newName;
        // Hacer el span COMPLETAMENTE inmutable
        span.style.userSelect = "none";
        span.style.cursor = "default";
        span.style.display = "inline-block";
        span.style.whiteSpace = "nowrap";
        // Prevenir que el span sea editable de cualquier forma
        span.setAttribute("unselectable", "on");
        span.setAttribute("role", "button");
        span.setAttribute("tabindex", "-1");

        // Evitar que el cursor entre al span: moverlo inmediatamente después del span
        const placeCaretAfter = () => {
          const range = document.createRange();
          range.setStartAfter(span);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          inputRef.current?.focus();
        };
        span.addEventListener("mousedown", (e) => {
          e.preventDefault();
          placeCaretAfter();
        });
        span.addEventListener("touchstart", (e) => {
          e.preventDefault();
          placeCaretAfter();
        });
        span.addEventListener("click", (e) => {
          e.preventDefault();
          placeCaretAfter();
        });

        inputRef.current.appendChild(span);
        inputRef.current.appendChild(document.createTextNode(" "));

        // Actualizar el estado local
        setInput(inputRef.current.textContent || "");

        // Mover cursor al final
        setTimeout(() => {
          const range = document.createRange();
          const sel = window.getSelection();
          if (inputRef.current) {
            range.selectNodeContents(inputRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
            inputRef.current.focus();
          }
        }, 0);
      }

      if (!isOpen && storeMessage) openChat();
    }
  }, [inputMessage, isOpen, openChat]);

  // Detectar cuando se intenta borrar un span de alojamiento
  useEffect(() => {
    if (!inputRef.current) return;

    const inputElement = inputRef.current;

    // Observer para detectar CUALQUIER cambio en el DOM
    const observer = new MutationObserver(() => {
      // Verificar todos los spans después de cualquier mutación
      const accommodationSpans = inputElement.querySelectorAll(
        ".accommodation-name[data-original-name]"
      );

      accommodationSpans.forEach((span) => {
        const originalName = span.getAttribute("data-original-name") || "";
        const currentText = span.textContent || "";

        // Si el texto cambió, eliminar el span completo
        if (originalName !== currentText) {
          span.remove();
          setInput(inputElement.textContent || "");
        }
      });
    });

    observer.observe(inputElement, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Manejar Backspace/Delete adyacente a un nombre de alojamiento: borra todo el nombre tras 2 pulsaciones
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const resetIntent = () => {
      deleteIntentRef.current = { span: null, count: 0, ts: 0, dir: null };
    };

    const isAccommodationSpan = (n: Node | null): n is HTMLElement => {
      return !!(
        n &&
        n.nodeType === Node.ELEMENT_NODE &&
        (n as HTMLElement).classList?.contains("accommodation-name")
      );
    };

    const findAdjacentAccommodationSpan = (
      range: Range,
      dir: "back" | "del"
    ): HTMLElement | null => {
      const node = range.startContainer;
      const offset = range.startOffset;

      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        if (dir === "back") {
          if (offset !== 0) return null;
          const cand = textNode.previousSibling;
          return isAccommodationSpan(cand) ? (cand as HTMLElement) : null;
        } else {
          if (offset !== (textNode.textContent?.length || 0)) return null;
          const cand = textNode.nextSibling;
          return isAccommodationSpan(cand) ? (cand as HTMLElement) : null;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elNode = node as Element;
        const idx = offset;
        if (dir === "back") {
          const cand = elNode.childNodes[idx - 1] ?? null;
          return isAccommodationSpan(cand) ? (cand as HTMLElement) : null;
        } else {
          const cand = elNode.childNodes[idx] ?? null;
          return isAccommodationSpan(cand) ? (cand as HTMLElement) : null;
        }
      }
      return null;
    };

    const removeSpanAndCleanup = (span: HTMLElement, dir: "back" | "del") => {
      // También limpiar un espacio adyacente (el que insertamos al crear el span)
      if (dir === "back") {
        const next = span.nextSibling;
        if (
          next &&
          next.nodeType === Node.TEXT_NODE &&
          (next as Text).textContent === " "
        ) {
          next.parentNode?.removeChild(next);
        }
      } else {
        const prev = span.previousSibling;
        if (prev && prev.nodeType === Node.TEXT_NODE) {
          const t = (prev as Text).textContent || "";
          if (t === " ") {
            prev.parentNode?.removeChild(prev);
          }
        }
      }
      span.remove();
      // Actualizar estado y mantener el foco/cursor
      setInput(el.textContent || "");
      el.focus();
      const sel = window.getSelection?.();
      if (sel) {
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        sel.addRange(r);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const sel = window.getSelection?.();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) {
        resetIntent();
        return;
      }
      const range = sel.getRangeAt(0);

      if (e.key === "Backspace" || e.key === "Delete") {
        const dir = e.key === "Backspace" ? "back" : "del";
        const span = findAdjacentAccommodationSpan(range, dir);
        if (span) {
          e.preventDefault();
          const now = Date.now();
          const prev = deleteIntentRef.current;
          if (
            prev.span === span &&
            prev.dir === dir &&
            now - prev.ts < 1200 &&
            prev.count >= 1
          ) {
            removeSpanAndCleanup(span, dir);
            resetIntent();
            return;
          } else {
            deleteIntentRef.current = { span, count: 1, ts: now, dir };
            return;
          }
        } else {
          resetIntent();
        }
      } else {
        // Cualquier otra tecla cancela la intención
        resetIntent();
      }
    };

    const onSelectionChange = () => {
      const sel = window.getSelection?.();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      // Si el caret cayó dentro de un span de alojamiento, muévelo afuera
      let node: Node | null = r.startContainer;
      while (node && node !== el) {
        if (isAccommodationSpan(node)) {
          const range = document.createRange();
          range.setStartAfter(node);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          el.focus();
          resetIntent();
          break;
        }
        node = (node as Node).parentNode;
      }
    };

    el.addEventListener("keydown", onKeyDown as EventListener);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      el.removeEventListener("keydown", onKeyDown as EventListener);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [setInput]);

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

    // Extraer IDs de los spans con data-accommodation-id
    const accommodationElements =
      inputRef.current?.querySelectorAll("[data-accommodation-id]") || [];
    const accommodationIds = Array.from(accommodationElements)
      .map((el) => el.getAttribute("data-accommodation-id"))
      .filter(Boolean) as string[];

    // Construir el mensaje de texto plano para el backend (solo nombres sin formato)
    let plainMessage = "";
    // Construir el mensaje para mostrar en el chat (con formato para renderizar)
    let displayMessage = "";

    if (inputRef.current) {
      inputRef.current.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent || "";
          plainMessage += textContent;
          displayMessage += textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const id = element.getAttribute("data-accommodation-id");
          const name = element.textContent || "";
          if (id && name) {
            // Para el mensaje plano: solo el nombre
            plainMessage += name;
            // Para mostrar en el chat: formato especial
            displayMessage += `**ACCOMMODATION:${id}:${name}**`;
          } else {
            plainMessage += element.textContent;
            displayMessage += element.textContent;
          }
        }
      });
    }

    const userMsg = makeMessage("user", displayMessage);
    const typingMsg = makeMessage("assistant", "Escribiendo…");

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput("");

    // Limpiar el contentEditable
    if (inputRef.current) {
      inputRef.current.innerHTML = "";
    }

    // Limpiar el store
    useChatStore.getState().clearInput();

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
    pendingAccommodationIdsRef.current = [];

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: plainMessage, // Enviar el mensaje de texto plano
          source: "alojamientos-ctr",
          sessionId: sessionId ?? "unknown",
          ...(accommodationIds.length > 0 && {
            accommodationIds: accommodationIds,
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
          className="fixed z-50 w-[calc(100vw-16px)] sm:w-[calc(100vw-32px)] md:w-96 h-[calc(100vh-80px)] sm:h-[85vh] md:h-[70vh] max-h-[680px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeChat();
              }}
              className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
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
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-primary/10 text-gray-900 border border-primary/20"
                      : "bg-white text-gray-900 border border-gray-200"
                  )}
                  style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
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
                    renderMessageContent(m.content)
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white shrink-0">
            {errorText && (
              <div
                className="mb-2 text-xs text-red-600"
                style={{ wordBreak: "break-word" }}
              >
                {errorText}
              </div>
            )}
            <div className="flex items-end gap-2">
              <div
                ref={inputRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const text = e.currentTarget.textContent || "";
                  setInput(text);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    canSend &&
                    !isSending
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onPaste={(e) => {
                  // Evitar que se pegue HTML formateado
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
                className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 overflow-y-auto max-h-24 transition-all duration-200 ease-in-out hover:border-gray-400 bg-white empty:bg-gray-50/50"
                data-placeholder="Escribe tu mensaje..."
                style={{
                  minHeight: "2.5rem",
                  maxHeight: "6rem",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                role="textbox"
                aria-label="Escribe tu mensaje"
                aria-multiline="true"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSend();
                }}
                disabled={!canSend || isSending}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 h-10 px-4 py-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 whitespace-nowrap transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 disabled:active:scale-100",
                  BRAND_GRADIENT
                )}
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">
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
