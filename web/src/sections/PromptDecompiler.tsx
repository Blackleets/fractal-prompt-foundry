import { useState } from "react";
import { Zap, FileCode, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { decompilePrompt, type DecompiledMission } from "@/lib/decompiler";
import type { BaseModelProvider } from "@/lib/models";

interface PromptDecompilerProps {
  onInject: (mission: DecompiledMission) => void;
  provider: BaseModelProvider | null;
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: { title: "Prompt Decompiler", placeholder: "Paste any prompt here to extract its mission...", decompile: "Decompile", inject: "Inject into Foundry", analyzing: "Analyzing prompt structure...", extracted: "Extracted Mission", summary: "Summary", goal: "Goal", lanes: "Style Lanes", constraints: "Constraints", criteria: "Evaluation Criteria", output: "Output Format", empty: "Paste a prompt above and click Decompile", error: "Could not parse — showing raw extraction", done: "Mission loaded! Scroll to Quick Input to start evolution" },
  es: { title: "Descompilador de Prompts", placeholder: "Pega cualquier prompt aquí para extraer su misión...", decompile: "Descompilar", inject: "Inyectar en Foundry", analyzing: "Analizando estructura del prompt...", extracted: "Misión Extraída", summary: "Resumen", goal: "Objetivo", lanes: "Estilos", constraints: "Restricciones", criteria: "Criterios de Evaluación", output: "Formato de Salida", empty: "Pega un prompt arriba y haz clic en Descompilar", error: "No se pudo analizar — mostrando extracción cruda", done: "¡Misión cargada! Ve a Quick Input para iniciar la evolución" },
  fr: { title: "Décompilateur de Prompts", placeholder: "Collez n'importe quel prompt pour extraire sa mission...", decompile: "Décompiler", inject: "Injecter dans Foundry", analyzing: "Analyse de la structure du prompt...", extracted: "Mission Extraite", summary: "Résumé", goal: "Objectif", lanes: "Styles", constraints: "Contraintes", criteria: "Critères d'Évaluation", output: "Format de Sortie", empty: "Collez un prompt ci-dessus et cliquez sur Décompiler", error: "Analyse impossible — extraction brute affichée", done: "Mission chargée ! Allez dans Quick Input pour démarrer l'évolution" },
  de: { title: "Prompt-Dekompilierer", placeholder: "Fügen Sie hier einen Prompt ein, um seine Mission zu extrahieren...", decompile: "Dekompilieren", inject: "In Foundry einspritzen", analyzing: "Analysiere Prompt-Struktur...", extracted: "Extrahierte Mission", summary: "Zusammenfassung", goal: "Ziel", lanes: "Stilrichtungen", constraints: "Einschränkungen", criteria: "Bewertungskriterien", output: "Ausgabeformat", empty: "Fügen Sie oben einen Prompt ein und klicken Sie auf Dekompilieren", error: "Konnte nicht analysiert — Rohdaten werden angezeigt", done: "Mission geladen! Gehen Sie zu Quick Input, um die Evolution zu starten" },
};

export default function PromptDecompiler({ onInject, provider, language }: PromptDecompilerProps) {
  const u = UI[language] ?? UI.en;
  const [input, setInput] = useState("");
  const [mission, setMission] = useState<DecompiledMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const handleDecompile = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(false);
    setShowDone(false);
    try {
      const result = await decompilePrompt(input, provider);
      setMission(result);
    } catch {
      const result = await decompilePrompt(input, null);
      setMission(result);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInject = () => {
    if (!mission) return;
    onInject(mission);
    setShowDone(true);
    setTimeout(() => setShowDone(false), 3000);
  };

  return (
    <div className="panel-elevated p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileCode className="h-4 w-4 text-[#f59e0b]" />
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={u.placeholder}
        rows={4}
        className="foundry-input mb-3 w-full resize-none p-3 text-sm leading-relaxed"
      />

      <button
        onClick={handleDecompile}
        disabled={loading || !input.trim()}
        className="foundry-button inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {u.analyzing}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {u.decompile}
          </>
        )}
      </button>

      {!mission && !loading && (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-[#64748b]">
          <Zap className="h-8 w-8" />
          <p className="text-xs">{u.empty}</p>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#f87171]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {u.error}
        </div>
      )}

      {showDone && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#00b894]/30 bg-[#00b894]/10 px-3 py-2 text-xs text-[#00b894]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {u.done}
        </div>
      )}

      {mission && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#1b2533] bg-[#050a12] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8bd7ff]">{u.extracted}</p>
            <button
              onClick={handleInject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#00b894]/40 px-2.5 py-1 text-[10px] text-[#00b894] hover:bg-[#00b894]/10"
            >
              <Zap className="h-3 w-3" />
              {u.inject}
            </button>
          </div>

          <div>
            <p className="mb-0.5 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.summary}</p>
            <p className="text-xs text-[#cbd5e1]">{mission.summary}</p>
          </div>
          <div>
            <p className="mb-0.5 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.goal}</p>
            <p className="text-xs text-[#cbd5e1]">{mission.goal}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <p className="mr-1 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.lanes}:</p>
            {mission.style_lanes.map((l) => (
              <span key={l} className="rounded-md border border-[#1b2533] bg-[#0b111c] px-2 py-0.5 text-[10px] text-[#94a3b8]">
                {l}
              </span>
            ))}
          </div>
          {mission.constraints.length > 0 && (
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.constraints}</p>
              {mission.constraints.map((c, i) => (
                <p key={i} className="text-[10px] text-[#94a3b8]">• {c}</p>
              ))}
            </div>
          )}
          {mission.evaluation_criteria.length > 0 && (
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.criteria}</p>
              {mission.evaluation_criteria.map((c, i) => (
                <p key={i} className="text-[10px] text-[#94a3b8]">• {c}</p>
              ))}
            </div>
          )}
          <div>
            <p className="mb-0.5 text-[9px] uppercase tracking-[0.15em] text-[#64748b]">{u.output}</p>
            <p className="text-[10px] text-[#94a3b8]">{mission.output_format}</p>
          </div>
        </div>
      )}
    </div>
  );
}
