import { Cpu, Dna, Languages, Orbit, Sparkles } from "lucide-react";
import { getUiCopy, presetMeta } from "@/lib/content";
import type { LanguageCode, UserPresetId } from "@/lib/types";

interface NavigationProps {
  language: LanguageCode;
  preset: UserPresetId;
}

function Navigation({ language, preset }: NavigationProps) {
  const copy = getUiCopy(language);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#232040] bg-[#07060c]/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#3d3560] bg-[linear-gradient(135deg,rgba(108,92,231,0.2),rgba(0,210,255,0.06))] p-2 shadow-[0_0_26px_-14px_rgba(108,92,231,0.6)]">
            <Dna className="h-5 w-5 text-[#a78bfa]" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-[#e8e6f0]">{copy.appName}</p>
            <div className="flex items-center gap-2 text-xs text-[#8b89a3]">
              <Orbit className="h-3.5 w-3.5 text-[#6c5ce7]" />
              {copy.statusReady}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ToolbarChip icon={Cpu} label={copy.engineLocal} accent="violet" />
          <ToolbarChip icon={Languages} label={`${copy.language}: ${language.toUpperCase()}`} accent="slate" />
          <ToolbarChip icon={Sparkles} label={`${copy.userPreset}: ${presetMeta[preset].label[language]}`} accent="slate" />
        </div>
      </div>
    </nav>
  );
}

function ToolbarChip({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof Cpu;
  label: string;
  accent: "violet" | "slate";
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        accent === "violet"
          ? "border-[#3d3560] bg-[#1a1535]/65 text-[#c4b5fd]"
          : "border-[#232040] bg-[#0c0a18] text-[#8b89a3]"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${accent === "violet" ? "text-[#a78bfa]" : "text-[#6b6880]"}`} />
      {label}
    </div>
  );
}

export default Navigation;
