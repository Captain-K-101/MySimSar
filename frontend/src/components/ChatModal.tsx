"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, useAuth } from "@/lib/auth";

interface Participant {
  id: string;
  name?: string | null;
  photoUrl?: string | null;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  readAt?: string | null;
}

interface Conversation {
  id: string;
  simsar: Participant;
  user: Participant;
  messages: Message[];
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  simsarId?: string; // for starting new convo
  existingConversationId?: string;
}

export function ChatModal({ isOpen, onClose, simsarId, existingConversationId }: ChatModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (existingConversationId) {
      loadConversation(existingConversationId);
    }
    if (simsarId && !existingConversationId) {
      // prepare new conversation, nothing to fetch yet
      setConversation(null);
    }
  }, [isOpen, existingConversationId, simsarId]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [conversation, isOpen]);

  async function loadConversation(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/messages/conversations/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load conversation");
      }
      const data = await res.json();
      setConversation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      if (conversation) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/messages/conversations/${conversation.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }
        const msg = await res.json();
        setConversation((prev) =>
          prev ? { ...prev, messages: [...prev.messages, msg] } : prev
        );
        setText("");
      } else if (simsarId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/messages/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ simsarId, text }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to start conversation");
        }
        const convo = await res.json();
        setConversation(convo);
        setText("");
      }
      scrollToBottom();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm text-gray-500">Messaging</p>
            <p className="text-lg font-semibold text-gray-900">{conversation?.simsar?.name || "Broker"}</p>
          </div>
          <button onClick={onClose} aria-label="Close chat" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">×</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {conversation?.messages?.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-4 py-2 text-sm ${mine ? "bg-amber-500 text-white" : "bg-white text-gray-900 border"}`}>
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-amber-100" : "text-gray-500"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Write a message..."
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 order-2 sm:order-1">Close</button>
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


