import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, Swords, RotateCw, Ban, ChevronUp, ChevronDown } from "lucide-react";
import type { FortressResult } from "@/lib/adversarial";

interface AdversarialCrackerProps {
  championPrompt: string;
  isRunning: boolean;
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: {
    title: "Adversarial Fortress",
    subtitle: "Stress-test your prompt against real attack vectors",
    run: "Run Fortress Mode",
    running: "Hardening...",
    initialScore: "Initial defense",
    finalScore: "Final defense",
    attacks: "Attack Log",
    attack: "Attack",
    round: "Round",
    vector: "Vector",
    result: "Result",
    blocked: "Blocked",
    breached: "Breached",
    defense: "Defense Added",
    noAttacks: "Run fortress mode to see attack results.",
  },
  es: {
    title: "Fortaleza Adversarial",
    subtitle: "Prueba tu prompt contra vectores de ataque reales",
    run: "Ejecutar modo fortaleza",
    running: "Fortificando...",
    initialScore: "Defensa inicial",
    finalScore: "Defensa final",
    attacks: "Bitácora de ataques",
    attack: "Ataque",
    round: "Ronda",
    vector: "Vector",
    result: "Resultado",
    blocked: "Bloqueado",
    breached: "Penetrado",
    defense: "Defensa agregada",
    noAttacks: "Ejecuta el modo fortaleza para ver resultados.",
  },
  fr: {
    title: "Forteresse Adversariale",
    subtitle: "Testez votre prompt contre des vecteurs d'attaque reels",
    run: "Lancer le mode forteresse",
    running: "Fortification...",
    initialScore: "Defense initiale",
    finalScore: "Defense finale",
    attacks: "Journal d'attaques",
    attack: "Attaque",
    round: "Round",
    vector: "Vecteur",
    result: "Resultat",
    blocked: "Bloque",
    breached: "Penetre",
    defense: "Defense ajoutee",
    noAttacks: "Lancez le mode forteresse pour voir les resultats.",
  },
  de: {
    title: "Adversariale Festung",
    subtitle: "Teste deinen Prompt gegen echte Angriffsvektoren",
    run: "Festungsmodus starten",
    running: "Hartung...",
    initialScore: "Start-Verteidigung",
    finalScore: "End-Verteidigung",
    attacks: "Angriffslog",
    attack: "Angriff",
    round: "Runde",
    vector: "Vektor",
    result: "Ergebnis",
    blocked: "Blockiert",
    breached: "Durchbrochen",
    defense: "Verteidigung hinzugefugt",
    noAttacks: "Starte den Festungsmodus, um Ergebnisse zu sehen.",
  },
};

export default function AdversarialCracker({
  championPrompt,
  isRunning,
  language,
}: AdversarialCrackerProps) {
  const [result, setResult] = useState<FortressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedAttack, setExpandedAttack] = useState<number | null>(null);
  const u = UI[language] ?? UI.en;

  const runFortress = async () => {
    setLoading(true);
    setResult(null);
    const { runAdversarialFortress } = await import("@/lib/adversarial");
    try {
      const res = await runAdversarialFortress(championPrompt, 4, null);
      setResult(res);
    } catch (err) {
      console.warn("Adversarial crack failed", err);
    }
    setLoading(false);
  };

  const beforeScore = result ? Math.round(result.initialScore * 100) : 0;
  const afterScore = result ? Math.round(result.finalScore * 100) : 0;
  const improved = afterScore - beforeScore;

  return (
    <div className="panel-elevated p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-[#ef4444]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        {!loading && !result && (
          <button
            onClick={runFortress}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ef4444] px-4 py-2 text-xs font-medium text-white shadow-[0_0_24px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shield className="h-3.5 w-3.5" />
            {u.run}
          </button>
        )}
        {loading && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#ef4444]/20 px-4 py-2 text-xs text-[#fca5a5]">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            {u.running}
          </span>
        )}
      </div>

      <p className="mb-4 text-xs text-[#64748b]">{u.subtitle}</p>

      {result && (
        <>
          {/* Score comparison */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#2d3436] bg-[#17191c] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">{u.initialScore}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[#f87171]">{beforeScore}</p>
            </div>
            <div className="rounded-xl border border-[#2d3436] bg-[#17191c] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">{u.finalScore}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[#4ade80]">{afterScore}</p>
            </div>
            <div className="rounded-xl border border-[#2d3436] bg-[#17191c] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">Improvement</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[#fbbf24]">
                {improved > 0 ? "+" : ""}{improved}
              </p>
            </div>
          </div>

          {/* Attack log */}
          <p className="mb-2 text-xs font-medium text-white">{u.attacks}</p>
          <div className="space-y-2">
            {result.attacks.map((attack, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-[#2d3436]">
                <button
                  onClick={() => setExpandedAttack(expandedAttack === i ? null : i)}
                  className="flex w-full items-center justify-between bg-[#17191c] px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    {attack.success ? (
                      <ShieldAlert className="h-3.5 w-3.5 text-[#ef4444]" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 text-[#4ade80]" />
                    )}
                    <span className="text-xs text-[#cbd5e1]">
                      {u.round} {attack.round}
                    </span>
                    <span className="rounded bg-[#23262b] px-1.5 py-0.5 text-[10px] text-[#94a3b8]">
                      {attack.attackVector}
                    </span>
                    <span className={`text-[10px] ${attack.success ? "text-[#ef4444]" : "text-[#4ade80]"}`}>
                      {attack.success ? u.breached : u.blocked}
                    </span>
                  </div>
                  {expandedAttack === i ? <ChevronUp className="h-3 w-3 text-[#64748b]" /> : <ChevronDown className="h-3 w-3 text-[#64748b]" />}
                </button>

                <AnimatePresence>
                  {expandedAttack === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#2d3436] bg-[#0d0f10]"
                    >
                      <div className="space-y-2 p-3">
                        <div>
                          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#64748b]">{u.attack}</p>
                          <p className="font-mono text-[11px] leading-5 text-[#cbd5e1] whitespace-pre-wrap">
                            {attack.attackPrompt.slice(0, 200)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#64748b]">{u.defense}</p>
                          <p className="font-mono text-[11px] leading-5 text-[#4ade80]">{attack.defenseAdded}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#64748b]">Score:</span>
                          <span className="font-mono text-[11px] text-white">
                            {Math.round(attack.fortifiedScore * 100)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Fortification log */}
          <div className="mt-4 rounded-xl border border-[#2d3436] bg-[#17191c] p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#64748b]">Fortification Log</p>
            {result.fortificationLog.map((line, i) => (
              <p key={i} className="font-mono text-[10px] leading-5 text-[#94a3b8]">{line}</p>
            ))}
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Ban className="mb-2 h-8 w-8 text-[#ef4444]/30" />
          <p className="text-xs text-[#64748b]">{u.noAttacks}</p>
        </div>
      )}
    </div>
  );
}
