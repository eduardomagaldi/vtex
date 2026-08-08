"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          DeepSeek Chat
        </h1>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950 min-h-[60vh]">
          {messages.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400">
              Say something to start the conversation.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-black text-white dark:bg-zinc-50 dark:text-black"
                  : "self-start bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-50"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="self-start rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Thinking…
            </div>
          )}

          {error && (
            <div className="self-start rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-white/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
