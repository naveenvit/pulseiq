"use client";

import { useState, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
  isStreaming?: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Must match the key used in AuthContext / api-client
  return localStorage.getItem("access_token");
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadSession = useCallback(async (sessionId: string) => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load session");
      const data = await res.json();
      setCurrentSessionId(sessionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMessages(data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        isEmergency: m.is_emergency,
        createdAt: m.created_at,
      })));
    } catch {
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSessions(data.map((s: any) => ({
        id: s.id,
        title: s.title,
        messageCount: s.message_count,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })));
    } catch {
      // non-critical
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const token = getToken();
    if (!token) { setError("Please log in to continue"); return; }

    setError(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      createdAt: new Date().toISOString(),
    }]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          session_id: currentSessionId || undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let sessionExtracted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (!sessionExtracted && chunk.startsWith("SESSION_ID:")) {
          const lines = chunk.split("\n");
          const newSessionId = lines[0].replace("SESSION_ID:", "").trim();
          setCurrentSessionId(newSessionId);
          sessionExtracted = true;
          const rest = lines.slice(1).join("\n");
          if (rest) {
            accumulated += rest;
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            ));
          }
        } else {
          accumulated += chunk;
          setMessages((prev) => prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          ));
        }
      }

      setMessages((prev) => prev.map((m) =>
        m.id === assistantId ? { ...m, isStreaming: false } : m
      ));
      await loadSessions();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, [currentSessionId, loadSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch {
      setError("Failed to delete conversation");
    }
  }, [currentSessionId]);

  const startNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages, sessions, currentSessionId,
    isLoading, isStreaming, error,
    sendMessage, loadSession, loadSessions,
    deleteSession, startNewSession, clearError,
  };
}
