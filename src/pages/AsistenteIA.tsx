import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "¿Qué obligaciones tengo según la Resolución 0312 si tengo 8 trabajadores?",
  "Resume mis hallazgos abiertos en el plan de mejoramiento",
  "¿Cómo conformo el COPASST en mi empresa?",
  "¿Qué controles aplican para trabajo en alturas según la Res. 1409?",
];

export default function AsistenteIA() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asistente-sgsst`;
      const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next }),
      });
      if (resp.status === 429) { toast({ title: "Demasiadas solicitudes", description: "Espera un momento", variant: "destructive" }); setLoading(false); return; }
      if (resp.status === 402) { toast({ title: "Créditos IA agotados", description: "Recarga tu workspace", variant: "destructive" }); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Error iniciando stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo conectar con el asistente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Asistente IA SG-SST">
      <div className="flex flex-col h-[calc(100vh-9rem)] max-w-4xl mx-auto w-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-xl bg-card shadow-card p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Asistente IA SG-SST</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">Pregúntame sobre normativa colombiana de SST o sobre tus propios datos (riesgos, capacitaciones, hallazgos).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {SUGERENCIAS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-left text-sm rounded-lg border bg-background hover:bg-muted p-3 transition-colors">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`rounded-xl px-4 py-2.5 max-w-[80%] text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-headings:my-2">
                    <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3"><div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><Bot className="h-4 w-4" /></div><div className="rounded-xl bg-muted px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin" /></div></div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Escribe tu pregunta sobre SG-SST..." rows={2} className="resize-none" disabled={loading} />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} size="icon" className="h-auto w-12 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
