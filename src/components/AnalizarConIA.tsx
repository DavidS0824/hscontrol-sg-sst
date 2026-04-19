import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export function AnalizarConIA({ contexto, label = "Analizar con IA", datosExtra }: { contexto: string; label?: string; datosExtra?: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analisis, setAnalisis] = useState("");

  const ejecutar = async () => {
    setLoading(true);
    setAnalisis("");
    try {
      const { data, error } = await supabase.functions.invoke("analisis-predictivo-sgsst", {
        body: { contexto, datosExtra },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalisis(data.analisis);
    } catch (e: any) {
      toast.error(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !analisis) ejecutar(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Sparkles className="h-4 w-4 mr-1.5" />{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Análisis IA · {contexto}</DialogTitle>
        </DialogHeader>
        {loading && <p className="text-sm text-muted-foreground">Analizando con IA…</p>}
        {analisis && (
          <article className="prose prose-sm max-w-none dark:prose-invert
            prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
            <ReactMarkdown>{analisis}</ReactMarkdown>
          </article>
        )}
        {analisis && <Button variant="outline" size="sm" onClick={ejecutar} disabled={loading}>Volver a analizar</Button>}
      </DialogContent>
    </Dialog>
  );
}
