import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / 'artifacts'
ASSETS = ROOT / 'assets'

summary = json.loads((ARTIFACTS / 'benchmarks' / 'summary.json').read_text(encoding='utf-8'))
demo = json.loads((ARTIFACTS / 'demo-run' / 'result.json').read_text(encoding='utf-8'))

s = summary['summary']
missions = summary['missions']
demo_best = demo['evolution_summary']['evolved_best_score']
demo_seed = demo['evolution_summary']['seed_best_score']
demo_delta = demo['evolution_summary']['score_delta_vs_seed']
lineage = demo['round_summaries']
baseline = demo['baseline_diff']

lane_colors = {
    'critic': '#A78BFA',
    'architect': '#22D3EE',
    'operator': '#F59E0B',
}

def esc(text: str) -> str:
    return (text.replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;'))


def metric_bar(x, y, width, label, value, color, suffix=''):
    fill_w = max(12, int(width * value))
    return f'''
    <text x="{x}" y="{y}" fill="#94A3B8" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">{esc(label)}</text>
    <rect x="{x}" y="{y+12}" width="{width}" height="12" rx="6" fill="#101827"/>
    <rect x="{x}" y="{y+12}" width="{fill_w}" height="12" rx="6" fill="{color}"/>
    <text x="{x + width}" y="{y+10}" text-anchor="end" fill="#E2E8F0" font-size="13" font-family="JetBrains Mono,Consolas,monospace">{value:.3f}{suffix}</text>
    '''


def mission_card(x, y, w, mission, stroke):
    return f'''
    <g>
      <rect x="{x}" y="{y}" width="{w}" height="136" rx="20" fill="#09111F" stroke="{stroke}"/>
      <text x="{x+20}" y="{y+30}" fill="#E2E8F0" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">{esc(mission['mission'])}</text>
      <text x="{x+20}" y="{y+72}" fill="#F8FAFC" font-size="34" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{mission['winner_score']:.3f}</text>
      <text x="{x+20}" y="{y+98}" fill="#94A3B8" font-size="13" font-family="Inter,Segoe UI,Arial,sans-serif">winner: {esc(mission['winner_style'])}</text>
      <text x="{x+20}" y="{y+118}" fill="#67E8F9" font-size="13" font-family="Inter,Segoe UI,Arial,sans-serif">Δ +{mission['delta_vs_seed']:.3f} vs seed</text>
    </g>
    '''


def node(x, y, label, sublabel, color):
    return f'''
    <circle cx="{x}" cy="{y}" r="11" fill="{color}"/>
    <rect x="{x+24}" y="{y-24}" width="168" height="48" rx="14" fill="#0A1120" stroke="{color}"/>
    <text x="{x+108}" y="{y-4}" text-anchor="middle" fill="#F8FAFC" font-size="13" font-family="Inter,Segoe UI,Arial,sans-serif">{esc(label)}</text>
    <text x="{x+108}" y="{y+14}" text-anchor="middle" fill="#94A3B8" font-size="12" font-family="JetBrains Mono,Consolas,monospace">{esc(sublabel)}</text>
    '''

hero = f'''<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="84" y1="58" x2="1524" y2="842" gradientUnits="userSpaceOnUse">
      <stop stop-color="#030712"/>
      <stop offset="0.52" stop-color="#08111F"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="purpleCyan" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#8B5CF6"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
    <linearGradient id="cyanGold" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#22D3EE"/>
      <stop offset="1" stop-color="#F59E0B"/>
    </linearGradient>
    <radialGradient id="glowLeft" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 150) rotate(22) scale(420 260)">
      <stop stop-color="#7C3AED" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowRight" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1320 740) rotate(180) scale(420 260)">
      <stop stop-color="#06B6D4" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="58"/></filter>
    <filter id="shadow" x="0" y="0" width="1600" height="900"><feDropShadow dx="0" dy="28" stdDeviation="40" flood-color="#000" flood-opacity="0.38"/></filter>
  </defs>

  <rect width="1600" height="900" rx="36" fill="#020617"/>
  <g filter="url(#blur)">
    <ellipse cx="220" cy="150" rx="360" ry="180" fill="url(#glowLeft)"/>
    <ellipse cx="1320" cy="740" rx="360" ry="200" fill="url(#glowRight)"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="64" y="58" width="1472" height="784" rx="34" fill="url(#bg)" stroke="#1E293B"/>
  </g>

  <rect x="112" y="108" width="320" height="38" rx="19" fill="#0B1220" stroke="#334155"/>
  <circle cx="140" cy="127" r="5.5" fill="#8B5CF6"/>
  <circle cx="159" cy="127" r="5.5" fill="#22D3EE"/>
  <circle cx="178" cy="127" r="5.5" fill="#F59E0B"/>
  <text x="208" y="132" fill="#94A3B8" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">code-generated hero from live benchmark artifacts</text>

  <text x="112" y="230" fill="#F8FAFC" font-size="78" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Fractal Prompt</text>
  <text x="112" y="314" fill="url(#purpleCyan)" font-size="78" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Foundry</text>
  <text x="112" y="372" fill="#D6E3F2" font-size="28" font-family="Inter,Segoe UI,Arial,sans-serif">Prompt evolution, rendered like</text>
  <text x="112" y="408" fill="#D6E3F2" font-size="28" font-family="Inter,Segoe UI,Arial,sans-serif">a measurable system.</text>
  <text x="112" y="444" fill="#8FA2BC" font-size="20" font-family="Inter,Segoe UI,Arial,sans-serif">Built from current demo + benchmark artifacts, not concept art.</text>

  <rect x="112" y="474" width="280" height="54" rx="27" fill="url(#purpleCyan)"/>
  <text x="252" y="508" text-anchor="middle" fill="#020617" font-size="18" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">benchmark-driven prompt DNA</text>
  <rect x="408" y="474" width="228" height="54" rx="27" fill="#0B1220" stroke="#334155"/>
  <text x="522" y="508" text-anchor="middle" fill="#E2E8F0" font-size="18" font-weight="600" font-family="Inter,Segoe UI,Arial,sans-serif">seed vs evolved diff</text>

  <g>
    <rect x="112" y="576" width="166" height="110" rx="22" fill="#0B1220" stroke="#223046"/>
    <text x="136" y="612" fill="#94A3B8" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">avg winner score</text>
    <text x="136" y="658" fill="#F8FAFC" font-size="42" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{s['average_winner_score']:.3f}</text>
    <text x="136" y="688" fill="#67E8F9" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">across {s['mission_count']} missions</text>

    <rect x="296" y="576" width="166" height="110" rx="22" fill="#0B1220" stroke="#223046"/>
    <text x="320" y="612" fill="#94A3B8" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">delta vs seed</text>
    <text x="320" y="658" fill="#F8FAFC" font-size="42" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">+{s['average_delta_vs_seed']:.3f}</text>
    <text x="320" y="688" fill="#A78BFA" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">mean lift from evolution</text>

    <rect x="480" y="576" width="166" height="110" rx="22" fill="#0B1220" stroke="#223046"/>
    <text x="504" y="612" fill="#94A3B8" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">beat seed rate</text>
    <text x="504" y="658" fill="#F8FAFC" font-size="42" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{int(s['beat_seed_rate']*100)}%</text>
    <text x="504" y="688" fill="#FCD34D" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">every benchmark improved</text>
  </g>

  <rect x="112" y="722" width="534" height="92" rx="24" fill="#0A1120" stroke="#223046"/>
  <text x="136" y="756" fill="#F8FAFC" font-size="20" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Pressure balance from live run</text>
  {metric_bar(136, 776, 180, 'coverage', demo['evolved_evaluation']['metrics']['coverage'], '#22D3EE')}
  {metric_bar(340, 776, 180, 'refinement', demo['evolved_evaluation']['metrics']['refinement'], '#8B5CF6')}
  {metric_bar(544, 776, 78, 'novelty', demo['evolved_evaluation']['metrics']['novelty'], '#F59E0B')}

  <rect x="700" y="108" width="778" height="288" rx="28" fill="#0B1220" stroke="#223046"/>
  <text x="736" y="148" fill="#F8FAFC" font-size="26" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Benchmark portfolio</text>
  <text x="736" y="176" fill="#8FA2BC" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">Mission cards generated from artifacts/benchmarks/summary.json</text>
  {mission_card(736, 214, 220, missions[0], '#312E81')}
  {mission_card(978, 214, 220, missions[1], '#155E75')}
  {mission_card(1220, 214, 220, missions[2], '#92400E')}

  <rect x="700" y="424" width="372" height="340" rx="28" fill="#0B1220" stroke="#223046"/>
  <text x="736" y="466" fill="#F8FAFC" font-size="24" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Lineage map</text>
  <text x="736" y="492" fill="#8FA2BC" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">Hyperliquid mission winner path through rounds.</text>

  <path d="M770 548H886L930 604" stroke="url(#purpleCyan)" stroke-width="4" stroke-linecap="round"/>
  <path d="M930 626L830 676" stroke="url(#cyanGold)" stroke-width="4" stroke-linecap="round"/>
  <path d="M770 676H886L930 716" stroke="url(#purpleCyan)" stroke-width="4" stroke-linecap="round"/>

  {node(758, 548, lineage[0]['winner_id'], lineage[0]['winner_style'] + ' · ' + format(lineage[0]['winner_score'], '.3f'), '#8B5CF6')}
  {node(918, 616, lineage[1]['winner_id'], lineage[1]['winner_style'] + ' · ' + format(lineage[1]['winner_score'], '.3f'), '#22D3EE')}
  {node(758, 676, lineage[2]['winner_id'], lineage[2]['winner_style'] + ' · ' + format(lineage[2]['winner_score'], '.3f'), '#F59E0B')}
  {node(918, 728, lineage[3]['winner_id'], lineage[3]['winner_style'] + ' · ' + format(lineage[3]['winner_score'], '.3f'), '#38BDF8')}

  <rect x="1106" y="424" width="372" height="340" rx="28" fill="#0B1220" stroke="#223046"/>
  <text x="1142" y="466" fill="#F8FAFC" font-size="24" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Seed → evolved patch</text>
  <text x="1142" y="492" fill="#8FA2BC" font-size="15" font-family="Inter,Segoe UI,Arial,sans-serif">Less stock-art, more inspectable prompt mutation.</text>

  <rect x="1142" y="524" width="300" height="188" rx="18" fill="#07101C" stroke="#334155"/>
  <text x="1160" y="552" fill="#EF4444" font-size="14" font-family="JetBrains Mono,Consolas,monospace">- ROLE LANE: {esc(baseline['seed_style'].upper())}</text>
  <text x="1160" y="578" fill="#22C55E" font-size="14" font-family="JetBrains Mono,Consolas,monospace">+ ROLE LANE: {esc(baseline['evolved_style'].upper())}</text>
  <text x="1160" y="616" fill="#E2E8F0" font-size="14" font-family="JetBrains Mono,Consolas,monospace">+ measurable validation</text>
  <text x="1160" y="642" fill="#E2E8F0" font-size="14" font-family="JetBrains Mono,Consolas,monospace">+ failure-mode paragraph</text>
  <text x="1160" y="668" fill="#E2E8F0" font-size="14" font-family="JetBrains Mono,Consolas,monospace">+ observability + abort rules</text>
  <text x="1160" y="694" fill="#E2E8F0" font-size="14" font-family="JetBrains Mono,Consolas,monospace">+ prioritized next action</text>

  <rect x="1142" y="730" width="300" height="36" rx="12" fill="#101827" stroke="#334155"/>
  <text x="1292" y="754" text-anchor="middle" fill="#67E8F9" font-size="18" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{demo_seed:.3f} → {demo_best:.3f}  |  +{demo_delta:.3f}</text>

  <rect x="112" y="816" width="1330" height="20" rx="10" fill="#09111F" stroke="#243244"/>
  <rect x="112" y="816" width="440" height="20" rx="10" fill="#8B5CF6"/>
  <rect x="552" y="816" width="440" height="20" rx="10" fill="#22D3EE"/>
  <rect x="992" y="816" width="450" height="20" rx="10" fill="#F59E0B"/>
</svg>
'''

social = f'''<svg width="1280" height="640" viewBox="0 0 1280 640" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1280" y2="640" gradientUnits="userSpaceOnUse">
      <stop stop-color="#020617"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#8B5CF6"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1020 140) rotate(160) scale(420 240)">
      <stop stop-color="#22D3EE" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="640" rx="28" fill="url(#bg)"/>
  <ellipse cx="1020" cy="140" rx="320" ry="180" fill="url(#glow)"/>

  <rect x="56" y="52" width="262" height="34" rx="17" fill="#0B1220" stroke="#334155"/>
  <text x="187" y="74" text-anchor="middle" fill="#94A3B8" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">code-generated from benchmark artifacts</text>

  <text x="56" y="168" fill="#F8FAFC" font-size="64" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Fractal Prompt</text>
  <text x="56" y="236" fill="url(#grad)" font-size="64" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Foundry</text>
  <text x="56" y="292" fill="#D6E3F2" font-size="26" font-family="Inter,Segoe UI,Arial,sans-serif">Offline prompt evolution with inspectable lineage, benchmark suites, and seed-vs-evolved diffs.</text>

  <rect x="56" y="346" width="164" height="92" rx="20" fill="#0B1220" stroke="#223046"/>
  <text x="80" y="378" fill="#94A3B8" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">avg winner</text>
  <text x="80" y="418" fill="#F8FAFC" font-size="36" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{s['average_winner_score']:.3f}</text>

  <rect x="238" y="346" width="164" height="92" rx="20" fill="#0B1220" stroke="#223046"/>
  <text x="262" y="378" fill="#94A3B8" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">delta vs seed</text>
  <text x="262" y="418" fill="#F8FAFC" font-size="36" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">+{s['average_delta_vs_seed']:.3f}</text>

  <rect x="420" y="346" width="164" height="92" rx="20" fill="#0B1220" stroke="#223046"/>
  <text x="444" y="378" fill="#94A3B8" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">beat seed rate</text>
  <text x="444" y="418" fill="#F8FAFC" font-size="36" font-weight="700" font-family="JetBrains Mono,Consolas,monospace">{int(s['beat_seed_rate']*100)}%</text>

  <rect x="708" y="72" width="516" height="496" rx="26" fill="#0B1220" stroke="#223046"/>
  <text x="742" y="114" fill="#F8FAFC" font-size="24" font-weight="700" font-family="Inter,Segoe UI,Arial,sans-serif">Benchmark + lineage snapshot</text>
  <text x="742" y="142" fill="#8FA2BC" font-size="14" font-family="Inter,Segoe UI,Arial,sans-serif">Real runs, not decorative concept blocks.</text>

  {mission_card(742, 178, 210, missions[0], '#312E81')}
  {mission_card(970, 178, 210, missions[2], '#155E75')}

  <path d="M784 470H888L928 504" stroke="url(#grad)" stroke-width="4" stroke-linecap="round"/>
  <path d="M928 520L824 552" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
  {node(772, 470, lineage[0]['winner_id'], format(lineage[0]['winner_score'], '.3f'), '#8B5CF6')}
  {node(916, 514, lineage[1]['winner_id'], format(lineage[1]['winner_score'], '.3f'), '#22D3EE')}
  {node(772, 558, lineage[3]['winner_id'], format(lineage[3]['winner_score'], '.3f'), '#F59E0B')}
</svg>
'''

(ASSETS / 'hero.svg').write_text(hero, encoding='utf-8')
(ASSETS / 'social-preview.svg').write_text(social, encoding='utf-8')
print('generated assets/hero.svg and assets/social-preview.svg')
