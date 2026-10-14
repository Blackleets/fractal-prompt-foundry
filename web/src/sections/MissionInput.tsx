import type { ReactNode } from "react";
import { Globe2, Play, Plus, SlidersHorizontal, Trash2, Users2 } from "lucide-react";
import { getUiCopy, presetMeta } from "@/lib/content";
import type { LanguageCode, Mission, UserPresetId } from "@/lib/types";

interface MissionInputProps {
  mission: Mission;
  onMissionChange: (mission: Mission) => void;
  onRun: () => void;
  isRunning: boolean;
  canRun: boolean;
  language: LanguageCode;
  preset: UserPresetId;
  onLanguageChange: (language: LanguageCode) => void;
  onPresetChange: (preset: UserPresetId) => void;
}

const LANGUAGES: LanguageCode[] = ["en", "es", "fr", "de"];
const PRESETS: UserPresetId[] = ["founder", "marketer", "analyst", "operator", "researcher"];

function MissionInput({
  mission,
  onMissionChange,
  onRun,
  isRunning,
  canRun,
  language,
  preset,
  onLanguageChange,
  onPresetChange,
}: MissionInputProps) {
  const copy = getUiCopy(language);

  const update = <K extends keyof Mission>(key: K, value: Mission[K]) => {
    onMissionChange({ ...mission, [key]: value });
  };

  return (
    <aside className="panel-command h-fit p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#164e63] bg-[#082f49]/55 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#67e8f9]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {copy.missionPanelTitle}
          </div>
          <p className="text-sm leading-6 text-[#94a3b8]">{copy.missionPanelHint}</p>
        </div>

        <button
          onClick={onRun}
          disabled={!canRun || isRunning}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition ${
            canRun && !isRunning
              ? "fractal-gradient-bg text-white"
              : "cursor-not-allowed bg-[#0c0a18] text-[#6b6880]"
          }`}
        >
          <Play className="h-4 w-4" />
          {isRunning ? copy.running : copy.run}
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <ControlCard icon={Globe2} label={copy.language}>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((item) => (
                <button
                  key={item}
                  onClick={() => onLanguageChange(item)}
                  className={toggleClass(language === item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </ControlCard>

          <ControlCard icon={Users2} label={copy.userPreset}>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {PRESETS.map((item) => (
                <button
                  key={item}
                  onClick={() => onPresetChange(item)}
                  className={`${toggleClass(preset === item)} justify-start px-3 py-2 text-left`}
                >
                  <span className="block">
                    <span className="block text-sm">{presetMeta[item].label[language]}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-[#94a3b8]">
                      {presetMeta[item].description[language]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </ControlCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label={copy.missionName}
            value={mission.name}
            onChange={(value) => update("name", value)}
            placeholder="mission-name"
          />

          <Field
            label={copy.audience}
            value={mission.audience}
            onChange={(value) => update("audience", value)}
            placeholder={copy.audiencePlaceholder}
          />
        </div>

        <TextAreaField
          label={copy.goal}
          value={mission.goal}
          onChange={(value) => update("goal", value)}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <ListField
            label={copy.constraints}
            items={mission.constraints}
            placeholder={copy.constraints}
            addLabel={copy.addItem}
            onChange={(items) => update("constraints", items)}
          />

          <ListField
            label={copy.successCriteria}
            items={mission.success_criteria}
            placeholder={copy.successCriteria}
            addLabel={copy.addItem}
            onChange={(items) => update("success_criteria", items)}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ListField
            label={copy.deliverables}
            items={mission.deliverables}
            placeholder={copy.deliverables}
            addLabel={copy.addItem}
            onChange={(items) => update("deliverables", items)}
          />

          <ListField
            label={copy.domainTerms}
            items={mission.domain_terms}
            placeholder={copy.domainTerms}
            addLabel={copy.addItem}
            onChange={(items) => update("domain_terms", items)}
          />
        </div>
      </div>
    </aside>
  );
}

function ControlCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Globe2;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[#232040] bg-[#0c0a18]/88 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#a78bfa]" />
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="foundry-input w-full px-3 py-3 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="foundry-input w-full resize-none px-3 py-3 text-sm leading-7"
      />
    </label>
  );
}

function ListField({
  label,
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const addItem = () => onChange([...items, ""]);
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };
  const removeItem = (index: number) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{label}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
              className="foundry-input w-full px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => removeItem(index)}
              className="rounded-xl border border-[#1f2937] bg-[#0b1120] px-3 text-[#94a3b8] hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#1f2937] px-3 py-2 text-sm text-[#94a3b8] hover:border-[#67e8f9] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function toggleClass(active: boolean): string {
  return active
    ? "rounded-xl border border-[#67e8f9] bg-[#082f49]/55 px-2 py-2 text-xs font-medium text-white"
    : "rounded-xl border border-[#1f2937] bg-[#0b1120] px-2 py-2 text-xs text-[#94a3b8] hover:text-white";
}

export default MissionInput;
