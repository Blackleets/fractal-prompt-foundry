import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Cpu,
  GitBranch,
  History,
  Orbit,
  PenLine,
  Rocket,
  RotateCcw,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import DNAFractal from "@/components/DNAFractal";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navigation from "@/sections/Navigation";
import Telemetry from "@/sections/Telemetry";
import EvolutionRounds from "@/sections/EvolutionRounds";
import { clearShareFromUrl, readShareFromLocation } from "@/lib/share";

const MissionInput = lazy(() => import("@/sections/MissionInput"));
const GenomeProfileSection = lazy(() => import("@/sections/GenomeProfile"));
const ScoreComparison = lazy(() => import("@/sections/ScoreComparison"));
const SettingsPanel = lazy(() => import("@/sections/SettingsPanel"));
const AdversarialCracker = lazy(() => import("@/sections/AdversarialCracker"));
const EvolutionSlider = lazy(() => import("@/sections/EvolutionSlider"));
const DNAFingerprintCard = lazy(() => import("@/sections/DNAFingerprintCard"));
const PromptDecompiler = lazy(() => import("@/sections/PromptDecompiler"));
const ConstellationMap = lazy(() => import("@/sections/ConstellationMap"));
const EvolutionTree = lazy(() => import("@/sections/EvolutionTree"));
const ExportBar = lazy(() => import("@/sections/ExportBar"));
import {
  createMissionFromIdea,
  detectLanguage,
  getQuickExamples,
  getUiCopy,
  inferPresetFromIdea,
  presetMeta,
} from "@/lib/content";
import { FractalPromptFoundry, createDefaultMission, nextLoopRequirements } from "@/lib/foundry-lite";
import { createModelProvider, loadModelConfig } from "@/lib/models";
import type { ModelConfig } from "@/lib/models";
import { DEFAULT_EVOLUTION_CONFIG } from "@/lib/types";
import { addRun } from "@/lib/run-history";
import type { DecompiledMission } from "@/lib/decompiler";
import type {
  Evaluation,
  EvolutionConfig,
  FoundryResult,
  InputMode,
  LanguageCode,
  LeaderboardEntry,
  Mission,
  RoundCandidate,
  RoundDetail,
  RoundSummary,
  SavedRun,
  UserPresetId,
} from "@/lib/types";

type AppState = "idle" | "running" | "complete";

type LabCopy = {
  shellTitleA: string;
  shellTitleB: string;
  inputReady: string;
  liveLog: string;
};

const STORAGE_KEY = "fractal-foundry-preferences";
const HISTORY_KEY = "fractal-foundry-history-v1";

interface StoredPreferences {
  language?: LanguageCode;
  preset?: UserPresetId;
  mission?: Mission;
  inputMode?: InputMode;
  quickInput?: string;
}

function loadStoredPreferences(): StoredPreferences | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPreferences;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function loadStoredHistory(): SavedRun[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedRun[];
  } catch {
    window.localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

function App() {
  const [storedPreferences] = useState(loadStoredPreferences);
  const initialLanguage = storedPreferences?.language ?? detectLanguage();
  const initialPreset = storedPreferences?.preset ?? "founder";
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);
  const [preset, setPreset] = useState<UserPresetId>(initialPreset);
  const [mission, setMission] = useState<Mission>(
    () => storedPreferences?.mission ?? createDefaultMission(initialLanguage, initialPreset)
  );
  const [inputMode, setInputMode] = useState<InputMode>(storedPreferences?.inputMode ?? "quick");
  const [quickInput, setQuickInput] = useState(storedPreferences?.quickInput ?? "");
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<FoundryResult | null>(null);
  const [revealedRounds, setRevealedRounds] = useState<RoundDetail[]>([]);
  const [livePhase, setLivePhase] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>(loadStoredHistory);

  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>(DEFAULT_EVOLUTION_CONFIG);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(loadModelConfig);
  const providerMemo = useMemo(
    () => (modelConfig && modelConfig.provider !== "local" ? createModelProvider(modelConfig) : null),
    [modelConfig]
  );

  const [loopCount, setLoopCount] = useState(0);
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [loopRequirements, setLoopRequirements] = useState<string[]>([]);
  const [chainMission, setChainMission] = useState<Mission | null>(null);
  const [chainInput, setChainInput] = useState("");

  const abortRef = useRef(false);
  const ui = getUiCopy(language);
  const lab = getLabCopy(language);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, preset, mission, inputMode, quickInput })
    );
  }, [language, preset, mission, inputMode, quickInput]);

  // Shared run via ?run= (no apiKey inside, capped + validated)
  useEffect(() => {
    const shared = readShareFromLocation();
    if (!shared) return;
    try {
      setLanguage(shared.lang);
      setPreset(shared.preset);
      setQuickInput(shared.original_input);
      setChainInput(shared.original_input);
      setInputMode("quick");
      setResult({
        mission: shared.original_input.slice(0, 120),
        best_candidate: {
          candidate_id: "shared-champion",
          style: `${shared.preset}+shared`,
          lineage: ["shared-link"],
          prompt: shared.prompt,
          notes: ["restored from share link"],
        },
        best_evaluation: {
          total_score: shared.score,
          metrics: {
            coverage: shared.score,
            structure: shared.score,
            actionability: shared.score,
            novelty: shared.score,
            anti_vague: shared.score,
          },
          missing_terms: [],
          critique: [],
          result_summary: "",
        },
        leaderboard: [],
        round_summaries: [],
        rounds: [],
        initial_score: shared.score,
        final_score: shared.score,
        improvement: 0,
        genome_profile: {
          genome_id: "shared",
          prompt_checksum: "shared",
          lineage_depth: 1,
          lane_mix: [shared.preset],
          bullet_density: 0,
          imperative_density: 0,
          control_density: 0,
          domain_saturation: 0,
          pressure_balance: {
            coverage: shared.score,
            structure: shared.score,
            actionability: shared.score,
            novelty: shared.score,
            anti_vague: shared.score,
          },
        },
        lineage_mermaid: "",
        uniqueness_thesis: ["Shared run — full evolution trail lives in the author's browser."],
        report_markdown: shared.report_markdown,
      } as unknown as FoundryResult);
      setBaselineScore(shared.score);
      setLoopCount(1);
      setAppState("complete");
    } finally {
      clearShareFromUrl();
    }
    // run once on mount
  }, []);

  const canRun =
    mission.name.trim() !== "" &&
    mission.goal.trim() !== "" &&
    mission.constraints.some((item) => item.trim() !== "") &&
    mission.success_criteria.some((item) => item.trim() !== "") &&
    mission.deliverables.some((item) => item.trim() !== "");

  const addLog = useCallback((message: string) => {
    setLogs((previous) => [...previous.slice(-11), message]);
  }, []);

  const resetChain = useCallback(() => {
    setResult(null);
    setRevealedRounds([]);
    setCurrentRound(0);
    setLivePhase(0);
    setLogs([]);
    setLoopCount(0);
    setBaselineScore(null);
    setLoopRequirements([]);
    setChainMission(null);
    setChainInput("");
    setAppState("idle");
  }, []);

  const applyLanguage = useCallback(
    (nextLanguage: LanguageCode) => {
      setLanguage(nextLanguage);
      setMission(createDefaultMission(nextLanguage, preset));
      resetChain();
      setQuickInput("");
    },
    [preset, resetChain]
  );

  const applyPreset = useCallback(
    (nextPreset: UserPresetId) => {
      setPreset(nextPreset);
      setMission(createDefaultMission(language, nextPreset));
      resetChain();
      setQuickInput("");
    },
    [language, resetChain]
  );

  const persistRun = useCallback((run: SavedRun) => {
    setSavedRuns((previous) => {
      const next = [run, ...previous.filter((item) => item.id !== run.id)].slice(0, 8);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleDecompiledMission = useCallback((dm: DecompiledMission) => {
    setQuickInput(dm.summary.slice(0, 500));
    setMission((prev) => ({
      ...prev,
      goal: dm.goal.slice(0, 280),
      constraints: dm.constraints.length > 0 ? dm.constraints : prev.constraints,
      success_criteria: dm.evaluation_criteria.length > 0 ? dm.evaluation_criteria : prev.success_criteria,
    }));
    setInputMode("quick");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFork = useCallback((prompt: string) => {
    setQuickInput(prompt.slice(0, 2000));
    setInputMode("quick");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRollback = useCallback((prompt: string) => {
    setQuickInput(prompt.slice(0, 2000));
    setInputMode("quick");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearHistory = useCallback(() => {
    setSavedRuns([]);
    window.localStorage.removeItem(HISTORY_KEY);
  }, []);

  const executeRun = useCallback(
    async (
      activeMission: Mission,
      originalInput: string,
      requirements: string[],
      loopIndex: number,
      baseline: number | null,
      parentPrompt = ""
    ) => {
      abortRef.current = false;
      setAppState("running");
      setResult(null);
      setRevealedRounds([]);
      setCurrentRound(0);
      setLivePhase(0);
      setLogs([]);

      addLog(`[LOOP ${loopIndex}] ${activeMission.name}`);
      addLog(`[PROFILE] ${activeMission.preset}`);
      await delay(220);

      const provider = modelConfig && modelConfig.provider !== "local"
        ? createModelProvider(modelConfig)
        : null;
      const foundry = new FractalPromptFoundry(
        activeMission,
        evolutionConfig.populationSize,
        requirements,
        originalInput,
        evolutionConfig,
        provider,
        parentPrompt
      );
      const computed = await foundry.run(evolutionConfig.rounds);

      for (const round of computed.rounds) {
        if (abortRef.current) break;
        setCurrentRound(round.round);
        for (let phase = 0; phase < 5; phase++) {
          if (abortRef.current) break;
          setLivePhase(phase);
          await delay(105);
        }
        setRevealedRounds((previous) => [...previous, round]);
        addLog(`[ROUND ${round.round}] ${round.winner_id} - ${Math.round(round.winner_score * 100)}`);
        await delay(150);
      }

      if (abortRef.current) {
        setAppState("idle");
        return;
      }

      const chainBaseline = baseline ?? computed.initial_score;
      setBaselineScore(chainBaseline);
      setLoopCount(loopIndex);
      setLoopRequirements(requirements);
      setChainMission(activeMission);
      setChainInput(originalInput);
      setResult(computed);
      addRun(computed);
      setAppState("complete");

      persistRun({
        id: `${Date.now()}-${computed.genome_profile.genome_id}`,
        created_at: new Date().toISOString(),
        language,
        preset: activeMission.preset,
        mission: activeMission,
        original_input: originalInput.trim() || activeMission.goal,
        score: computed.final_score,
        initial_score: chainBaseline,
        loop_count: loopIndex,
        prompt: computed.best_candidate.prompt,
        report_markdown: computed.report_markdown,
        result: computed,
      });
      addLog(`[CHAMPION] ${computed.best_candidate.candidate_id} - ${Math.round(computed.final_score * 100)}`);
    },
    [addLog, evolutionConfig, language, modelConfig, persistRun]
  );

  const runQuickOptimization = useCallback(async () => {
    const inferredPreset = inferPresetFromIdea(quickInput);
    const nextMission = createMissionFromIdea(quickInput, inferredPreset, language);
    const activeMission: Mission = { ...nextMission, preferred_language: language, preset: inferredPreset };
    setPreset(inferredPreset);
    setMission(nextMission);
    await executeRun(activeMission, quickInput, [], 1, null);
  }, [executeRun, language, quickInput]);

  const runAdvanced = useCallback(async () => {
    if (!canRun) return;
    const activeMission: Mission = { ...mission, preferred_language: language, preset };
    await executeRun(activeMission, quickInput.trim() || mission.goal, [], 1, null);
  }, [canRun, executeRun, language, mission, preset, quickInput]);

  const runAnotherLoop = useCallback(async () => {
    if (!result || !chainMission) return;
    const requirements = nextLoopRequirements(
      loopRequirements,
      result.best_evaluation.missing_terms,
      language
    );
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    await executeRun(
      chainMission,
      chainInput,
      requirements,
      loopCount + 1,
      baselineScore,
      result.best_candidate.prompt
    );
  }, [baselineScore, chainInput, chainMission, executeRun, language, loopCount, loopRequirements, result]);

  const startNewIdea = useCallback(() => {
    resetChain();
    setQuickInput("");
    setInputMode("quick");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetChain]);

  const restoreRun = useCallback((run: SavedRun) => {
    setLanguage(run.language);
    setPreset(run.preset);
    setMission(run.mission);
    setQuickInput(run.original_input);
    setInputMode("quick");

    const restored: FoundryResult =
      run.result ??
      ({
        mission: run.mission.name,
        best_candidate: {
          candidate_id: "restored",
          style: run.preset,
          lineage: ["history"],
          prompt: run.prompt,
          notes: ["restored from local history"],
        },
        best_evaluation: {
          total_score: run.score,
          metrics: {
            coverage: run.score,
            structure: run.score,
            actionability: run.score,
            novelty: run.score,
            anti_vague: run.score,
          },
          missing_terms: [],
          critique: [],
          result_summary: "",
        },
        leaderboard: [],
        round_summaries: [],
        rounds: [],
        initial_score: run.initial_score ?? run.score,
        final_score: run.score,
        improvement: 0,
        genome_profile: {
          genome_id: run.id.slice(0, 12),
          prompt_checksum: run.id.slice(0, 16),
          lineage_depth: 1,
          lane_mix: [run.preset],
          bullet_density: 0,
          imperative_density: 0,
          control_density: 0,
          domain_saturation: 0,
          pressure_balance: {
            coverage: run.score,
            structure: run.score,
            actionability: run.score,
            novelty: run.score,
            anti_vague: run.score,
          },
        },
        lineage_mermaid: "",
        uniqueness_thesis: [],
        report_markdown: run.report_markdown,
      } satisfies FoundryResult);

    setResult(restored);
    setRevealedRounds(restored.rounds);
    setBaselineScore(run.initial_score ?? restored.initial_score);
    setLoopCount(run.loop_count ?? 1);
    setLoopRequirements([]);
    setChainMission({ ...run.mission, preferred_language: run.language, preset: run.preset });
    setChainInput(run.original_input);
    setCurrentRound(restored.rounds.length);
    setAppState("complete");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isRunning = appState === "running";

  const liveEvaluation = useMemo<Evaluation | null>(() => {
    if (appState === "complete" && result) {
      return {
        candidate_id: result.best_candidate.candidate_id,
        total_score: result.best_evaluation.total_score,
        metrics: result.best_evaluation.metrics,
        missing_terms: result.best_evaluation.missing_terms,
        critique: result.best_evaluation.critique,
        result_summary: result.best_evaluation.result_summary,
      };
    }
    let best: RoundCandidate | null = null;
    for (const round of revealedRounds) {
      const winner = round.candidates.find((candidate) => candidate.is_winner);
      if (winner && (!best || winner.score > best.score)) best = winner;
    }
    return best
      ? {
          candidate_id: best.candidate_id,
          total_score: best.score,
          metrics: best.metrics,
          missing_terms: [],
          critique: best.critique,
          result_summary: "",
        }
      : null;
  }, [appState, result, revealedRounds]);

  const liveLeaderboard = useMemo<LeaderboardEntry[]>(() => {
    if (appState === "complete" && result && result.leaderboard.length > 0) return result.leaderboard;
    return revealedRounds
      .flatMap((round) =>
        round.candidates.map((candidate) => ({
          candidate_id: candidate.candidate_id,
          style: candidate.style,
          score: candidate.score,
          round: round.round - 1,
        }))
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [appState, result, revealedRounds]);

  const roundSummaries = useMemo<RoundSummary[]>(
    () =>
      revealedRounds.map((round) => ({
        round: round.round,
        winner_id: round.winner_id,
        winner_style: round.winner_style,
        winner_score: round.winner_score,
        population_size: round.candidates.length,
      })),
    [revealedRounds]
  );

  const showResultsRegion = isRunning || appState === "complete";
  const showHowItWorks = !showResultsRegion;
  const loopSummary = result?.best_candidate.prompt ?? chainInput ?? quickInput;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#050608] text-[#f1f2f6]">
      <Navigation language={language} preset={preset} />

      <main className="relative px-3 pb-12 pt-20 sm:px-4 lg:px-6">
        <section className="mx-auto mb-4 max-w-7xl">
          <div className="panel-elevated hero-mesh relative overflow-hidden p-3 sm:p-5">
            <div className="pointer-events-none absolute -right-16 top-0 hidden h-full w-[520px] opacity-50 lg:block">
              <DNAFractal isActive={isRunning} className="absolute inset-0 h-full w-full" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(108,92,231,0.08),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(0,210,255,0.06),transparent_24%)]" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#a78bfa] sm:mb-3 sm:text-[11px] sm:tracking-[0.28em]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#3d3560] bg-[#1a1535]/60 px-3 py-1 text-[#c4b5fd]">
                    <Cpu className="h-3.5 w-3.5" />
                    {ui.heroEyebrow}
                  </span>
                  <span className="text-[#3d3560]">/</span>
                  <span className="hidden text-[#8b89a3] sm:inline">{ui.tagline}</span>
                </div>
                <h1 className="hero-title max-w-3xl text-[1.9rem] font-bold text-[#e8e6f0] sm:text-[3.3rem]">
                  {lab.shellTitleA}
                  <span className="block text-gradient">{lab.shellTitleB}</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b89a3] sm:mt-3 sm:leading-7 sm:text-[15px]">
                  {ui.heroSubtitle}
                </p>
                <p className="mt-2 font-mono text-[11px] tracking-wide text-[#6b6880]">
                  seed → pressure → hybridize → champion DNA · local-first · sin backend
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <SummaryCard label={ui.language} value={language.toUpperCase()} />
                <SummaryCard label={ui.userPreset} value={presetMeta[preset].label[language]} />
                <SummaryCard
                  label={ui.quality}
                  value={result ? String(Math.round(result.final_score * 100)) : "--"}
                  highlight={Boolean(result)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-5 grid max-w-7xl gap-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
          <QuickCommand
            inputMode={inputMode}
            language={language}
            preset={preset}
            quickInput={quickInput}
            isRunning={isRunning}
            onInputModeChange={setInputMode}
            onQuickInputChange={setQuickInput}
            onRunQuick={runQuickOptimization}
          />

          <div className="space-y-4">
            <LoopWorkbench
              language={language}
              isRunning={isRunning}
              isComplete={appState === "complete"}
              currentRound={currentRound}
              totalRounds={evolutionConfig.rounds}
              livePhase={livePhase}
              loopCount={loopCount}
              outputPreview={loopSummary}
            />

            <EvolutionRounds
              rounds={revealedRounds}
              totalRounds={evolutionConfig.rounds}
              currentRound={currentRound}
              livePhase={livePhase}
              isRunning={isRunning}
              isComplete={appState === "complete"}
              language={language}
            />
          </div>

          <div className="space-y-4">
            <StatusDeck
              language={language}
              appState={appState}
              currentRound={currentRound}
              totalRounds={evolutionConfig.rounds}
              logs={logs}
              result={result}
              liveLogLabel={lab.liveLog}
            />

            <Telemetry
              leaderboard={liveLeaderboard}
              bestEvaluation={liveEvaluation}
              roundSummaries={roundSummaries}
              currentRound={currentRound}
              isRunning={isRunning}
              language={language}
            />
          </div>
        </section>

        {inputMode === "advanced" && (
          <section className="mx-auto mb-5 max-w-7xl">
            <Suspense fallback={<div className="p-4 font-mono text-xs text-[#6b6880]">loading mission editor…</div>}>
            <MissionInput
              mission={mission}
              onMissionChange={setMission}
              onRun={() => void runAdvanced()}
              isRunning={isRunning}
              canRun={canRun}
              language={language}
              preset={preset}
              onLanguageChange={applyLanguage}
              onPresetChange={applyPreset}
            />
            </Suspense>
          </section>
        )}

        {appState === "complete" && result && baselineScore !== null && (
          <section className="mx-auto mb-5 max-w-7xl">
            <Suspense fallback={null}>
            <ScoreComparison
              baselineScore={baselineScore}
              currentScore={result.final_score}
              loopCount={loopCount}
              language={language}
              originalInput={chainInput}
              championPrompt={result.best_candidate.prompt}
              isRunning={isRunning}
              onRunAnotherLoop={() => void runAnotherLoop()}
              onNewIdea={startNewIdea}
            />
            </Suspense>
          </section>
        )}

        {showResultsRegion && appState === "complete" && (
          <section className="mx-auto mb-5 max-w-7xl">
            <Suspense fallback={null}>
            <PromptDecompiler onInject={handleDecompiledMission} provider={providerMemo} language={language} />
            </Suspense>
          </section>
        )}

        {showHowItWorks && <HowItWorks language={language} />}

        {showResultsRegion && result && (
          <Suspense fallback={<div className="mx-auto max-w-7xl p-4 font-mono text-xs text-[#6b6880]">loading evolution view…</div>}>
          <>
            <section className="mx-auto mb-5 max-w-7xl">
              <GenomeProfileSection
                genome={result.genome_profile}
                bestPrompt={result.best_candidate.prompt}
                uniquenessThesis={result.uniqueness_thesis}
                reportMarkdown={result.report_markdown}
                language={language}
                isRunning={isRunning}
                originalInput={chainInput}
                result={result}
              />
            </section>

            {revealedRounds.length > 0 && (
              <section className="mx-auto mb-5 max-w-7xl">
                <EvolutionTree
                  latestResult={result}
                  onFork={handleFork}
                  onRollback={handleRollback}
                  language={language}
                />
              </section>
            )}

            {revealedRounds.length > 0 && (
              <section className="mx-auto mb-5 max-w-7xl">
                <EvolutionSlider rounds={revealedRounds} language={language} />
              </section>
            )}

            <section className="mx-auto mb-5 max-w-7xl">
              <ConstellationMap latestResult={result} language={language} />
            </section>

            {appState === "complete" && (
              <section className="mx-auto mb-5 max-w-7xl">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <AdversarialCracker
                    championPrompt={result.best_candidate.prompt}
                    isRunning={isRunning}
                    language={language}
                  />
                  <ExportBar
                    championPrompt={result.best_candidate.prompt}
                    originalInput={chainInput}
                    reportMarkdown={result.report_markdown}
                    language={language}
                    score={result.final_score}
                    preset={preset}
                  />
                </div>
              </section>
            )}

            {appState === "complete" && (
              <section className="mx-auto mb-5 max-w-7xl">
                <DNAFingerprintCard result={result} language={language} />
              </section>
            )}
          </>
          </Suspense>
        )}

        <section className="mx-auto mb-16 max-w-7xl">
          <HistoryPanel
            language={language}
            savedRuns={savedRuns}
            onRestore={restoreRun}
            onClear={clearHistory}
          />
        </section>
      </main>

      <Suspense fallback={null}>
      <SettingsPanel
        modelConfig={modelConfig}
        evolutionConfig={evolutionConfig}
        onModelConfigChange={setModelConfig}
        onEvolutionConfigChange={setEvolutionConfig}
      />
      </Suspense>
    </div>
    </ErrorBoundary>
  );
}

function HowItWorks({ language }: { language: LanguageCode }) {
  const copy = getUiCopy(language);
  const steps = [
    { icon: PenLine, title: copy.step1Title, desc: copy.step1Desc },
    { icon: GitBranch, title: copy.step2Title, desc: copy.step2Desc },
    { icon: Trophy, title: copy.step3Title, desc: copy.step3Desc },
  ];

  return (
    <section className="mx-auto mb-5 max-w-7xl">
      <p className="mb-3 px-1 text-[11px] uppercase tracking-[0.24em] text-[#6b6880]">{copy.howItWorks}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="panel-elevated card-interactive relative p-5">
            <span className="absolute right-4 top-4 font-mono text-3xl font-semibold text-[#1a1535]">
              {index + 1}
            </span>
            <div className="mb-3 inline-flex rounded-xl border border-[#232040] bg-[#0c0a18] p-2.5">
              <step.icon className="h-5 w-5 text-[#a78bfa]" />
            </div>
            <p className="text-sm font-medium text-[#e8e6f0]">{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-[#8b89a3]">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickCommand({
  inputMode,
  language,
  preset,
  quickInput,
  isRunning,
  onInputModeChange,
  onQuickInputChange,
  onRunQuick,
}: {
  inputMode: InputMode;
  language: LanguageCode;
  preset: UserPresetId;
  quickInput: string;
  isRunning: boolean;
  onInputModeChange: (mode: InputMode) => void;
  onQuickInputChange: (value: string) => void;
  onRunQuick: () => void;
}) {
  const ui = getUiCopy(language);
  const lab = getLabCopy(language);
  const hasInput = quickInput.trim().length > 0;
  const examples = getQuickExamples(language);

  return (
    <section className="panel-command h-fit p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#0b1120] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#7dd3fc]">
            <Orbit className="h-3.5 w-3.5" />
            {ui.quickInput}
          </div>
          <p className="text-[15px] font-medium text-white">{presetMeta[preset].label[language]}</p>
          <p className="mt-1 text-xs leading-6 text-[#94a3b8]">{presetMeta[preset].description[language]}</p>
        </div>
        <div className="flex rounded-xl border border-[#1f2937] bg-[#0b1120] p-1">
          <button onClick={() => onInputModeChange("quick")} className={modeButtonClass(inputMode === "quick")}>
            {ui.quickMode}
          </button>
          <button onClick={() => onInputModeChange("advanced")} className={modeButtonClass(inputMode === "advanced")}>
            {ui.advancedMode}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-[#cbd5e1]">
        <HeroBadge label={ui.heroBadgeLocal} />
        <HeroBadge label={ui.heroBadgeNoLogin} />
        <HeroBadge label={ui.heroBadgeLangs} />
      </div>

      <div className="grid gap-3">
        <div className="rounded-[1.35rem] border border-[#1f2937] bg-[#060b14] p-3">
          <textarea
            value={quickInput}
            onChange={(event) => onQuickInputChange(event.target.value)}
            placeholder={ui.quickPlaceholder}
            rows={8}
            className="foundry-input min-h-[240px] w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-7 shadow-none focus:ring-0"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <button
          onClick={onRunQuick}
          disabled={!hasInput || isRunning}
          className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition lg:min-h-[104px] lg:w-48 ${
            hasInput && !isRunning
              ? "cta-glow"
              : "cursor-not-allowed bg-[#0c0a18] text-[#6b6880] border border-[#232040]"
          }`}
        >
            <Rocket className="h-4 w-4" />
            {isRunning ? ui.running : ui.quickRun}
          </button>

          <div className="rounded-[1.15rem] border border-[#1f2937] bg-[#0b1120] p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#64748b]">{ui.beforeAfter}</p>
            <p className="mt-2 text-xs leading-6 text-[#94a3b8]">
              {hasInput ? lab.inputReady : ui.step1Desc}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#64748b]">{ui.examples}</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => onQuickInputChange(example)}
              className="foundry-button-secondary px-3 py-2 text-left text-xs leading-5"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryPanel({
  language,
  savedRuns,
  onRestore,
  onClear,
}: {
  language: LanguageCode;
  savedRuns: SavedRun[];
  onRestore: (run: SavedRun) => void;
  onClear: () => void;
}) {
  const ui = getUiCopy(language);

  return (
    <aside className="panel-elevated p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#6c5ce7]" />
          <p className="text-sm font-medium text-[#e8e6f0]">{ui.history}</p>
        </div>
        {savedRuns.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-lg border border-[#232040] p-2 text-[#8b89a3] hover:text-[#e8e6f0]"
            aria-label={ui.clearHistory}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {savedRuns.length === 0 ? (
        <p className="text-sm text-[#8b89a3]">{ui.emptyHistory}</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {savedRuns.map((run) => (
            <button
              key={run.id}
              onClick={() => onRestore(run)}
              className="card-interactive rounded-xl border border-[#232040] bg-[#0c0a18]/70 p-3 text-left hover:border-[#6c5ce7]/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm text-[#e8e6f0]">{run.original_input}</p>
                  <p className="mt-2 text-xs text-[#8b89a3]">
                    {presetMeta[run.preset].label[language]} - {new Date(run.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 font-mono text-xs text-[#a78bfa]">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {Math.round(run.score * 100)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

function HeroBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#232040] bg-[#0c0a18] px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-[#6c5ce7]" />
      {label}
    </span>
  );
}

function SummaryCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 backdrop-blur ${
        highlight ? "border-[#6c5ce7]/40 bg-[#6c5ce7]/5" : "border-[#232040] bg-[#0c0a18]/60"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6880]">{label}</p>
      <p className={`mt-1 font-mono text-sm ${highlight ? "score-gradient font-semibold" : "text-[#e8e6f0]"}`}>{value}</p>
    </div>
  );
}

function modeButtonClass(active: boolean): string {
  return active
    ? "rounded-md bg-[#6c5ce7] px-3 py-1.5 text-xs font-semibold text-white"
    : "rounded-md px-3 py-1.5 text-xs text-[#8b89a3] hover:text-[#e8e6f0]";
}

function LoopWorkbench({
  language,
  isRunning,
  isComplete,
  currentRound,
  totalRounds,
  livePhase,
  loopCount,
  outputPreview,
}: {
  language: LanguageCode;
  isRunning: boolean;
  isComplete: boolean;
  currentRound: number;
  totalRounds: number;
  livePhase: number;
  loopCount: number;
  outputPreview: string;
}) {
  const ui = getUiCopy(language);
  const steps = [
    { label: ui.quickInput, icon: PenLine },
    { label: ui.phaseGenerate, icon: Rocket },
    { label: ui.phaseEvaluate, icon: Activity },
    { label: ui.phaseMutate, icon: GitBranch },
    { label: ui.winningPrompt, icon: Trophy },
    { label: ui.loop, icon: RotateCcw },
  ];
  const activeStep = isRunning ? Math.min(livePhase + 1, steps.length - 1) : isComplete ? 4 : 0;
  const progress = isComplete ? 100 : Math.max(8, Math.round((Math.max(currentRound, 0) / totalRounds) * 100));

  return (
    <section className="panel-command relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.06),transparent_40%,rgba(34,197,94,0.06))]" />
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#67e8f9]">{ui.evolutionTitle}</p>
            <p className="mt-1 text-sm leading-6 text-[#94a3b8]">{ui.evolutionHint}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#060b14]/80 px-3 py-1 text-xs text-[#cbd5e1]">
            <CircleDot className={`h-3.5 w-3.5 ${isRunning ? "text-[#7dd3fc]" : isComplete ? "text-[#22c55e]" : "text-[#64748b]"}`} />
            {ui.round} {Math.min(currentRound || 0, totalRounds)}/{totalRounds}
          </div>
        </div>

        <div className="mb-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((step, index) => {
              const isPast = index < activeStep;
              const isActive = index === activeStep;
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <div
                    className={`flex min-w-[108px] items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs ${
                      isActive
                        ? "border-[#67e8f9] bg-[#082f49]/70 text-white shadow-[0_0_0_1px_rgba(103,232,249,0.2)]"
                        : isPast
                          ? "border-[#14532d] bg-[#052e16]/70 text-[#bbf7d0]"
                          : "border-[#1f2937] bg-[#0b1120] text-[#94a3b8]"
                    }`}
                  >
                    <step.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-[#334155]" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f2937] bg-[#060b14]/90 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#f59e0b]" />
              <p className="text-xs font-medium text-white">
                {isRunning ? ui.runningHeadline : isComplete ? ui.completeHeadline : ui.idleHeadline}
              </p>
            </div>
            <span className="font-mono text-xs text-[#94a3b8]">
              {ui.loop} {Math.max(loopCount, 1)}
            </span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#0f172a]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#22c55e,#f59e0b)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="line-clamp-3 text-sm leading-7 text-[#cbd5e1]">
            {outputPreview?.trim() || ui.evolutionEmpty}
          </p>
        </div>
      </div>
    </section>
  );
}

function StatusDeck({
  language,
  appState,
  currentRound,
  totalRounds,
  logs,
  result,
  liveLogLabel,
}: {
  language: LanguageCode;
  appState: AppState;
  currentRound: number;
  totalRounds: number;
  logs: string[];
  result: FoundryResult | null;
  liveLogLabel: string;
}) {
  const ui = getUiCopy(language);
  const running = appState === "running";
  const complete = appState === "complete";

  return (
    <section className="panel-command relative min-h-[320px] overflow-hidden p-4">
      <DNAFractal isActive={running} className="absolute inset-0" />
      <img
        src="/loop-console.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-16 w-[360px] max-w-none opacity-[0.18] mix-blend-screen"
      />
      <div className="relative space-y-4">
        <div className="rounded-[1.4rem] border border-white/8 bg-[#050608]/78 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#67e8f9]">
              {running ? ui.runningHeadline : complete ? ui.completeHeadline : ui.statusReady}
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-[#1f2937] px-2.5 py-1 text-[10px] text-[#94a3b8]">
              {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> : <Orbit className="h-3.5 w-3.5 text-[#7dd3fc]" />}
              {currentRound}/{totalRounds}
            </div>
          </div>

          {complete && result ? (
            <>
              <p className="inline-flex items-center gap-2 text-sm text-white">
                <Trophy className="h-4 w-4 text-[#f59e0b]" />
                {result.best_candidate.candidate_id}
              </p>
              <p className="mt-2 font-mono text-5xl font-semibold text-[#22c55e]">
                {Math.round(result.final_score * 100)}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-6 text-[#cbd5e1]">
                {result.best_candidate.prompt}
              </p>
            </>
          ) : running ? (
            <>
              <p className="text-4xl font-semibold text-white">{currentRound}</p>
              <p className="mt-2 text-sm text-[#cbd5e1]">{ui.resultsRunning}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-white">{ui.idleHeadline}</p>
              <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{ui.idleSubheadline}</p>
            </>
          )}
        </div>

        <div className="rounded-[1.2rem] border border-[#1f2937] bg-[#060b14]/88 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-[#7dd3fc]" />
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#64748b]">{liveLogLabel}</p>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] leading-5 text-[#94a3b8]">
            {(logs.length > 0 ? logs.slice(-6) : [ui.resultsPending]).map((log, index) => (
              <div key={`${log}-${index}`} className="rounded-lg border border-[#111827] bg-[#030712] px-2.5 py-1.5">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLabCopy(language: LanguageCode): LabCopy {
  const copy: Record<LanguageCode, LabCopy> = {
    en: {
      shellTitleA: "Prompt evolution loop,",
      shellTitleB: "built like an operating console.",
      inputReady: "Input locked and ready for mutation.",
      liveLog: "live log",
    },
    es: {
      shellTitleA: "Loop de evolucion de prompts,",
      shellTitleB: "construido como consola operativa.",
      inputReady: "Input listo y bloqueado para mutacion.",
      liveLog: "log en vivo",
    },
    fr: {
      shellTitleA: "Boucle d evolution de prompts,",
      shellTitleB: "concue comme une console operatoire.",
      inputReady: "Input verrouille et pret pour mutation.",
      liveLog: "log en direct",
    },
    de: {
      shellTitleA: "Prompt-Evolution als Loop,",
      shellTitleB: "gebaut wie eine operative Konsole.",
      inputReady: "Input fixiert und bereit fur Mutation.",
      liveLog: "live-log",
    },
  };
  return copy[language];
}

export default App;
