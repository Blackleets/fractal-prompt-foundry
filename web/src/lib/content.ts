import type { LanguageCode, Mission, UserPresetId } from "./types";

type PresetMeta = {
  label: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
};

type UiCopy = {
  appName: string;
  tagline: string;
  missionPanelTitle: string;
  missionPanelHint: string;
  language: string;
  userPreset: string;
  audience: string;
  audiencePlaceholder: string;
  missionName: string;
  goal: string;
  constraints: string;
  successCriteria: string;
  deliverables: string;
  domainTerms: string;
  addItem: string;
  run: string;
  running: string;
  evolutionProgress: string;
  waiting: string;
  pressureScores: string;
  leaderboard: string;
  genomeProfile: string;
  uniquenessThesis: string;
  championPrompt: string;
  viewReport: string;
  hideReport: string;
  resultsPending: string;
  resultsRunning: string;
  idleHeadline: string;
  idleSubheadline: string;
  runningHeadline: string;
  completeHeadline: string;
  champion: string;
  round: string;
  totalScore: string;
  engineLocal: string;
  statusReady: string;
  telemetryHint: string;
  copyReport: string;
  copied: string;
  quickMode: string;
  advancedMode: string;
  quickInput: string;
  quickPlaceholder: string;
  quickRun: string;
  useAsMission: string;
  originalBrief: string;
  optimizedPrompt: string;
  history: string;
  emptyHistory: string;
  restore: string;
  clearHistory: string;
  scoreLift: string;
  downloadMarkdown: string;
  downloadJson: string;
  copySystemPrompt: string;
  examples: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeLocal: string;
  heroBadgeNoLogin: string;
  heroBadgeLangs: string;
  howItWorks: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  evolutionTitle: string;
  evolutionHint: string;
  evolutionEmpty: string;
  phaseGenerate: string;
  phaseEvaluate: string;
  phaseCritique: string;
  phaseMutate: string;
  phaseWinner: string;
  candidates: string;
  winnerLabel: string;
  changeSeed: string;
  changeElite: string;
  changeMutation: string;
  changeHybrid: string;
  critique: string;
  showCandidates: string;
  hideCandidates: string;
  runAnotherLoop: string;
  newIdea: string;
  quality: string;
  baselineQuality: string;
  currentQuality: string;
  improvement: string;
  loop: string;
  points: string;
  beforeAfter: string;
  yourIdea: string;
  winningPrompt: string;
};

type FoundryCopy = {
  roleLane: string;
  primaryGoal: string;
  constraints: string;
  successCriteria: string;
  deliverables: string;
  operatingRules: string;
  ruleStepByStep: string;
  ruleAssumptions: string;
  ruleRisks: string;
  ruleStructure: string;
  domainTerms: string;
  refinementPressure: string;
  outputFormat: string;
  reportTitle: string;
  sectionChampion: string;
  sectionWhy: string;
  sectionPressure: string;
  sectionGenome: string;
  sectionRounds: string;
  sectionLineage: string;
  fieldCandidate: string;
  fieldStyle: string;
  fieldScore: string;
  fieldGenomeId: string;
  fieldLaneMix: string;
  fieldLineageDepth: string;
  fieldBulletDensity: string;
  fieldImperativeDensity: string;
  fieldControlDensity: string;
  fieldDomainSaturation: string;
  roundWinner: string;
  missingDomainPressure: string;
  critiqueStructure: string;
  critiqueActionability: string;
  critiqueNovelty: string;
  critiqueVagueness: string;
  summaryStrong: string;
  summaryWeak: string;
  uniquenessCoverage: string;
  uniquenessNovelty: string;
  uniquenessStructure: string;
  uniquenessStyle: string;
};

type MissionTemplate = Omit<Mission, "preferred_language" | "preset">;

const uiCopy: Record<LanguageCode, UiCopy> = {
  en: {
    appName: "Fractal Prompt Foundry",
    tagline: "Prompt evolution for real operators, not demo screens.",
    missionPanelTitle: "Mission Setup",
    missionPanelHint: "Tune the mission, language, and user profile before running the foundry.",
    language: "Language",
    userPreset: "User Profile",
    audience: "Audience",
    audiencePlaceholder: "Who will use this output?",
    missionName: "Mission Name",
    goal: "Goal",
    constraints: "Constraints",
    successCriteria: "Success Criteria",
    deliverables: "Deliverables",
    domainTerms: "Domain Terms",
    addItem: "Add item",
    run: "Run Evolution",
    running: "Running",
    evolutionProgress: "Evolution Progress",
    waiting: "Waiting for evolution to start...",
    pressureScores: "Pressure Scores",
    leaderboard: "Leaderboard",
    genomeProfile: "Genome Profile",
    uniquenessThesis: "Why This Run Stands Out",
    championPrompt: "Champion Prompt",
    viewReport: "View report",
    hideReport: "Hide report",
    resultsPending: "Run the foundry to generate the winning prompt, report, and genome signals.",
    resultsRunning: "The foundry is evaluating candidate prompts and pressure signals.",
    idleHeadline: "Ready for a new mission",
    idleSubheadline: "Pick a profile, adapt the mission, and launch the run.",
    runningHeadline: "Evolution in progress",
    completeHeadline: "Evolution complete",
    champion: "Champion",
    round: "Round",
    totalScore: "Total Score",
    engineLocal: "Engine: Local",
    statusReady: "Status: Ready",
    telemetryHint: "Live scoring appears here while the engine runs.",
    copyReport: "Copy report",
    copied: "Copied",
    quickMode: "Quick",
    advancedMode: "Advanced",
    quickInput: "What do you want to improve?",
    quickPlaceholder: "Paste a rough prompt, task, idea, workflow, or goal. Example: Help me write a sales email for a B2B software trial.",
    quickRun: "Optimize now",
    useAsMission: "Use as mission",
    originalBrief: "Original brief",
    optimizedPrompt: "Optimized prompt",
    history: "Recent runs",
    emptyHistory: "Recent runs will appear here after your first optimization.",
    restore: "Restore",
    clearHistory: "Clear history",
    scoreLift: "Quality score",
    downloadMarkdown: "Download MD",
    downloadJson: "Download JSON",
    copySystemPrompt: "Copy system prompt",
    examples: "Examples",
    heroEyebrow: "Prompt evolution engine",
    heroTitle: "Evolve any rough idea into a winning prompt — round by round.",
    heroSubtitle:
      "Drop in a messy idea. The foundry generates candidates, critiques them, mutates the best, and runs several rounds until one prompt wins. Then you can push it even further.",
    heroBadgeLocal: "Runs locally",
    heroBadgeNoLogin: "No login",
    heroBadgeLangs: "4 languages",
    howItWorks: "How it works",
    step1Title: "Describe your idea",
    step1Desc: "Paste a rough prompt, task, workflow, or goal. No prompt-engineering skills needed.",
    step2Title: "Watch it evolve",
    step2Desc: "Each round generates candidates, scores them, critiques the weak spots, and mutates the best.",
    step3Title: "Take the winner",
    step3Desc: "Copy the champion prompt, export it, or run another round to push the score higher.",
    evolutionTitle: "Evolution rounds",
    evolutionHint: "Each round: generate → evaluate → critique → mutate → winner.",
    evolutionEmpty: "Run your first idea to watch the prompt evolve across rounds.",
    phaseGenerate: "Generate",
    phaseEvaluate: "Evaluate",
    phaseCritique: "Critique",
    phaseMutate: "Mutate",
    phaseWinner: "Winner",
    candidates: "candidates",
    winnerLabel: "Round winner",
    changeSeed: "Seed",
    changeElite: "Elite carry-over",
    changeMutation: "Mutation",
    changeHybrid: "Hybrid",
    critique: "Critique",
    showCandidates: "Show candidates",
    hideCandidates: "Hide candidates",
    runAnotherLoop: "Run another round",
    newIdea: "New idea",
    quality: "Quality",
    baselineQuality: "Starting quality",
    currentQuality: "Current quality",
    improvement: "Improvement",
    loop: "Loop",
    points: "pts",
    beforeAfter: "Before / After",
    yourIdea: "Your idea",
    winningPrompt: "Winning prompt",
  },
  es: {
    appName: "Fractal Prompt Foundry",
    tagline: "Evolucion de prompts para usuarios reales, no para una demo.",
    missionPanelTitle: "Configuracion de la mision",
    missionPanelHint: "Ajusta la mision, el idioma y el perfil del usuario antes de ejecutar el foundry.",
    language: "Idioma",
    userPreset: "Perfil de usuario",
    audience: "Audiencia",
    audiencePlaceholder: "Quien va a usar este resultado?",
    missionName: "Nombre de la mision",
    goal: "Objetivo",
    constraints: "Restricciones",
    successCriteria: "Criterios de exito",
    deliverables: "Entregables",
    domainTerms: "Terminos del dominio",
    addItem: "Agregar item",
    run: "Ejecutar evolucion",
    running: "Ejecutando",
    evolutionProgress: "Progreso de evolucion",
    waiting: "Esperando a que empiece la evolucion...",
    pressureScores: "Puntajes de presion",
    leaderboard: "Clasificacion",
    genomeProfile: "Perfil del genoma",
    uniquenessThesis: "Por que esta ejecucion destaca",
    championPrompt: "Prompt ganador",
    viewReport: "Ver reporte",
    hideReport: "Ocultar reporte",
    resultsPending: "Ejecuta el foundry para generar el prompt ganador, el reporte y las senales del genoma.",
    resultsRunning: "El foundry esta evaluando prompts candidatos y senales de presion.",
    idleHeadline: "Listo para una nueva mision",
    idleSubheadline: "Elige un perfil, adapta la mision y lanza la ejecucion.",
    runningHeadline: "Evolucion en curso",
    completeHeadline: "Evolucion completada",
    champion: "Ganador",
    round: "Ronda",
    totalScore: "Puntaje total",
    engineLocal: "Motor: Local",
    statusReady: "Estado: Listo",
    telemetryHint: "La puntuacion en vivo aparece aqui mientras corre el motor.",
    copyReport: "Copiar reporte",
    copied: "Copiado",
    quickMode: "Rapido",
    advancedMode: "Avanzado",
    quickInput: "Que quieres mejorar?",
    quickPlaceholder: "Pega un prompt, tarea, idea, workflow u objetivo. Ejemplo: Ayudame a escribir un email de ventas para una prueba de software B2B.",
    quickRun: "Optimizar ahora",
    useAsMission: "Usar como mision",
    originalBrief: "Brief original",
    optimizedPrompt: "Prompt optimizado",
    history: "Ejecuciones recientes",
    emptyHistory: "Las ejecuciones recientes apareceran aqui despues de tu primera optimizacion.",
    restore: "Restaurar",
    clearHistory: "Limpiar historial",
    scoreLift: "Score de calidad",
    downloadMarkdown: "Descargar MD",
    downloadJson: "Descargar JSON",
    copySystemPrompt: "Copiar system prompt",
    examples: "Ejemplos",
    heroEyebrow: "Motor de evolucion de prompts",
    heroTitle: "Convierte cualquier idea en bruto en un prompt ganador, ronda a ronda.",
    heroSubtitle:
      "Suelta una idea desordenada. El foundry genera candidatos, los critica, muta los mejores y corre varias rondas hasta que un prompt gana. Despues puedes mejorarlo aun mas.",
    heroBadgeLocal: "Corre local",
    heroBadgeNoLogin: "Sin login",
    heroBadgeLangs: "4 idiomas",
    howItWorks: "Como funciona",
    step1Title: "Describe tu idea",
    step1Desc: "Pega un prompt, tarea, workflow u objetivo en bruto. No necesitas saber de prompt engineering.",
    step2Title: "Mira como evoluciona",
    step2Desc: "Cada ronda genera candidatos, los puntua, critica los puntos debiles y muta los mejores.",
    step3Title: "Llevate al ganador",
    step3Desc: "Copia el prompt ganador, exportalo o lanza otra ronda para subir el puntaje.",
    evolutionTitle: "Rondas de evolucion",
    evolutionHint: "Cada ronda: generar → evaluar → criticar → mutar → ganador.",
    evolutionEmpty: "Lanza tu primera idea para ver como evoluciona el prompt ronda a ronda.",
    phaseGenerate: "Generar",
    phaseEvaluate: "Evaluar",
    phaseCritique: "Criticar",
    phaseMutate: "Mutar",
    phaseWinner: "Ganador",
    candidates: "candidatos",
    winnerLabel: "Ganador de la ronda",
    changeSeed: "Semilla",
    changeElite: "Elite heredada",
    changeMutation: "Mutacion",
    changeHybrid: "Hibrido",
    critique: "Critica",
    showCandidates: "Ver candidatos",
    hideCandidates: "Ocultar candidatos",
    runAnotherLoop: "Mejorar otra ronda",
    newIdea: "Nueva idea",
    quality: "Calidad",
    baselineQuality: "Calidad inicial",
    currentQuality: "Calidad actual",
    improvement: "Mejora",
    loop: "Loop",
    points: "pts",
    beforeAfter: "Antes / Despues",
    yourIdea: "Tu idea",
    winningPrompt: "Prompt ganador",
  },
  fr: {
    appName: "Fractal Prompt Foundry",
    tagline: "Evolution de prompts pour de vrais utilisateurs, pas pour une simple demo.",
    missionPanelTitle: "Configuration de mission",
    missionPanelHint: "Ajustez la mission, la langue et le profil utilisateur avant de lancer le foundry.",
    language: "Langue",
    userPreset: "Profil utilisateur",
    audience: "Audience",
    audiencePlaceholder: "Qui utilisera ce resultat ?",
    missionName: "Nom de la mission",
    goal: "Objectif",
    constraints: "Contraintes",
    successCriteria: "Criteres de succes",
    deliverables: "Livrables",
    domainTerms: "Termes du domaine",
    addItem: "Ajouter",
    run: "Lancer l evolution",
    running: "Execution",
    evolutionProgress: "Progression de l evolution",
    waiting: "En attente du demarrage...",
    pressureScores: "Scores de pression",
    leaderboard: "Classement",
    genomeProfile: "Profil du genome",
    uniquenessThesis: "Pourquoi cette execution se distingue",
    championPrompt: "Prompt champion",
    viewReport: "Voir le rapport",
    hideReport: "Masquer le rapport",
    resultsPending: "Lancez le foundry pour generer le prompt gagnant, le rapport et les signaux du genome.",
    resultsRunning: "Le foundry evalue les prompts candidats et les signaux de pression.",
    idleHeadline: "Pret pour une nouvelle mission",
    idleSubheadline: "Choisissez un profil, adaptez la mission et lancez l execution.",
    runningHeadline: "Evolution en cours",
    completeHeadline: "Evolution terminee",
    champion: "Champion",
    round: "Round",
    totalScore: "Score total",
    engineLocal: "Moteur : Local",
    statusReady: "Statut : Pret",
    telemetryHint: "Le score en direct apparait ici pendant l execution.",
    copyReport: "Copier le rapport",
    copied: "Copie",
    quickMode: "Rapide",
    advancedMode: "Avance",
    quickInput: "Que voulez-vous ameliorer ?",
    quickPlaceholder: "Collez un prompt, une tache, une idee, un workflow ou un objectif. Exemple : Aidez-moi a ecrire un email de vente pour un essai logiciel B2B.",
    quickRun: "Optimiser",
    useAsMission: "Utiliser comme mission",
    originalBrief: "Brief original",
    optimizedPrompt: "Prompt optimise",
    history: "Executions recentes",
    emptyHistory: "Les executions recentes apparaitront ici apres votre premiere optimisation.",
    restore: "Restaurer",
    clearHistory: "Effacer l historique",
    scoreLift: "Score qualite",
    downloadMarkdown: "Telecharger MD",
    downloadJson: "Telecharger JSON",
    copySystemPrompt: "Copier system prompt",
    examples: "Exemples",
    heroEyebrow: "Moteur d evolution de prompts",
    heroTitle: "Transformez une idee brute en prompt gagnant, round apres round.",
    heroSubtitle:
      "Deposez une idee desordonnee. Le foundry genere des candidats, les critique, mute les meilleurs et enchaine plusieurs rounds jusqu a ce qu un prompt gagne. Ensuite vous pouvez l ameliorer encore.",
    heroBadgeLocal: "Execution locale",
    heroBadgeNoLogin: "Sans compte",
    heroBadgeLangs: "4 langues",
    howItWorks: "Comment ca marche",
    step1Title: "Decrivez votre idee",
    step1Desc: "Collez un prompt, une tache, un workflow ou un objectif brut. Aucune competence en prompt engineering requise.",
    step2Title: "Regardez-la evoluer",
    step2Desc: "Chaque round genere des candidats, les note, critique les points faibles et mute les meilleurs.",
    step3Title: "Prenez le gagnant",
    step3Desc: "Copiez le prompt gagnant, exportez-le ou lancez un autre round pour augmenter le score.",
    evolutionTitle: "Rounds d evolution",
    evolutionHint: "Chaque round : generer → evaluer → critiquer → muter → gagnant.",
    evolutionEmpty: "Lancez votre premiere idee pour voir le prompt evoluer au fil des rounds.",
    phaseGenerate: "Generer",
    phaseEvaluate: "Evaluer",
    phaseCritique: "Critiquer",
    phaseMutate: "Muter",
    phaseWinner: "Gagnant",
    candidates: "candidats",
    winnerLabel: "Gagnant du round",
    changeSeed: "Graine",
    changeElite: "Elite conservee",
    changeMutation: "Mutation",
    changeHybrid: "Hybride",
    critique: "Critique",
    showCandidates: "Voir les candidats",
    hideCandidates: "Masquer les candidats",
    runAnotherLoop: "Lancer un autre round",
    newIdea: "Nouvelle idee",
    quality: "Qualite",
    baselineQuality: "Qualite initiale",
    currentQuality: "Qualite actuelle",
    improvement: "Amelioration",
    loop: "Loop",
    points: "pts",
    beforeAfter: "Avant / Apres",
    yourIdea: "Votre idee",
    winningPrompt: "Prompt gagnant",
  },
  de: {
    appName: "Fractal Prompt Foundry",
    tagline: "Prompt-Evolution fur echte Nutzer statt fur eine Demo-Oberflache.",
    missionPanelTitle: "Mission Setup",
    missionPanelHint: "Passe Mission, Sprache und Nutzerprofil an, bevor du den Foundry-Lauf startest.",
    language: "Sprache",
    userPreset: "Nutzerprofil",
    audience: "Zielgruppe",
    audiencePlaceholder: "Wer nutzt dieses Ergebnis?",
    missionName: "Missionsname",
    goal: "Ziel",
    constraints: "Vorgaben",
    successCriteria: "Erfolgskriterien",
    deliverables: "Lieferobjekte",
    domainTerms: "Domainthemen",
    addItem: "Element hinzufugen",
    run: "Evolution starten",
    running: "Laeuft",
    evolutionProgress: "Evolutionsfortschritt",
    waiting: "Warte auf den Start...",
    pressureScores: "Druckwerte",
    leaderboard: "Rangliste",
    genomeProfile: "Genomprofil",
    uniquenessThesis: "Warum dieser Lauf besonders ist",
    championPrompt: "Gewinner-Prompt",
    viewReport: "Bericht ansehen",
    hideReport: "Bericht ausblenden",
    resultsPending: "Starte den Foundry-Lauf, um Gewinner-Prompt, Bericht und Genomsignale zu erzeugen.",
    resultsRunning: "Der Foundry-Lauf bewertet Kandidaten-Prompts und Drucksignale.",
    idleHeadline: "Bereit fur eine neue Mission",
    idleSubheadline: "Wahle ein Profil, passe die Mission an und starte den Lauf.",
    runningHeadline: "Evolution laeuft",
    completeHeadline: "Evolution abgeschlossen",
    champion: "Gewinner",
    round: "Runde",
    totalScore: "Gesamtwert",
    engineLocal: "Engine: Lokal",
    statusReady: "Status: Bereit",
    telemetryHint: "Live-Scores erscheinen hier wahrend der Ausfuhrung.",
    copyReport: "Bericht kopieren",
    copied: "Kopiert",
    quickMode: "Schnell",
    advancedMode: "Erweitert",
    quickInput: "Was mochtest du verbessern?",
    quickPlaceholder: "Fuge einen groben Prompt, eine Aufgabe, Idee, einen Workflow oder ein Ziel ein. Beispiel: Hilf mir, eine Sales-E-Mail fur eine B2B-Software-Testphase zu schreiben.",
    quickRun: "Optimieren",
    useAsMission: "Als Mission nutzen",
    originalBrief: "Original-Brief",
    optimizedPrompt: "Optimierter Prompt",
    history: "Letzte Laufe",
    emptyHistory: "Letzte Laufe erscheinen hier nach der ersten Optimierung.",
    restore: "Wiederherstellen",
    clearHistory: "Historie loschen",
    scoreLift: "Qualitatsscore",
    downloadMarkdown: "MD herunterladen",
    downloadJson: "JSON herunterladen",
    copySystemPrompt: "System Prompt kopieren",
    examples: "Beispiele",
    heroEyebrow: "Prompt-Evolutions-Engine",
    heroTitle: "Mach aus einer groben Idee einen Gewinner-Prompt — Runde fur Runde.",
    heroSubtitle:
      "Wirf eine unordentliche Idee hinein. Die Foundry erzeugt Kandidaten, kritisiert sie, mutiert die besten und durchlauft mehrere Runden, bis ein Prompt gewinnt. Danach kannst du ihn weiter verbessern.",
    heroBadgeLocal: "Lauft lokal",
    heroBadgeNoLogin: "Kein Login",
    heroBadgeLangs: "4 Sprachen",
    howItWorks: "So funktioniert es",
    step1Title: "Beschreibe deine Idee",
    step1Desc: "Fuge einen groben Prompt, eine Aufgabe, einen Workflow oder ein Ziel ein. Kein Prompt-Engineering noetig.",
    step2Title: "Sieh zu, wie sie sich entwickelt",
    step2Desc: "Jede Runde erzeugt Kandidaten, bewertet sie, kritisiert die Schwachstellen und mutiert die besten.",
    step3Title: "Nimm den Gewinner",
    step3Desc: "Kopiere den Gewinner-Prompt, exportiere ihn oder starte eine weitere Runde fur einen hoheren Score.",
    evolutionTitle: "Evolutionsrunden",
    evolutionHint: "Jede Runde: erzeugen → bewerten → kritisieren → mutieren → Gewinner.",
    evolutionEmpty: "Starte deine erste Idee, um zu sehen, wie der Prompt uber die Runden wachst.",
    phaseGenerate: "Erzeugen",
    phaseEvaluate: "Bewerten",
    phaseCritique: "Kritik",
    phaseMutate: "Mutieren",
    phaseWinner: "Gewinner",
    candidates: "Kandidaten",
    winnerLabel: "Rundensieger",
    changeSeed: "Saat",
    changeElite: "Elite ubernommen",
    changeMutation: "Mutation",
    changeHybrid: "Hybrid",
    critique: "Kritik",
    showCandidates: "Kandidaten zeigen",
    hideCandidates: "Kandidaten ausblenden",
    runAnotherLoop: "Weitere Runde starten",
    newIdea: "Neue Idee",
    quality: "Qualitat",
    baselineQuality: "Startqualitat",
    currentQuality: "Aktuelle Qualitat",
    improvement: "Verbesserung",
    loop: "Loop",
    points: "Pkt",
    beforeAfter: "Vorher / Nachher",
    yourIdea: "Deine Idee",
    winningPrompt: "Gewinner-Prompt",
  },
};

const quickExamples: Record<LanguageCode, string[]> = {
  en: [
    "Turn messy meeting notes into a clear action plan with owners, priorities, and risks.",
    "Improve a customer support prompt so replies are concise, helpful, and consistent.",
    "Create a prompt that compares three product ideas and recommends what to build first.",
  ],
  es: [
    "Convierte notas desordenadas de una reunion en un plan de accion con responsables, prioridades y riesgos.",
    "Mejora un prompt de soporte para que las respuestas sean claras, utiles y consistentes.",
    "Crea un prompt que compare tres ideas de producto y recomiende cual construir primero.",
  ],
  fr: [
    "Transformer des notes de reunion desordonnees en plan d action avec responsables, priorites et risques.",
    "Ameliorer un prompt support client pour obtenir des reponses claires, utiles et coherentes.",
    "Creer un prompt qui compare trois idees produit et recommande quoi construire en premier.",
  ],
  de: [
    "Verwandle unstrukturierte Meeting-Notizen in einen Aktionsplan mit Verantwortlichen, Prioritaten und Risiken.",
    "Verbessere einen Support-Prompt fur klare, hilfreiche und konsistente Antworten.",
    "Erstelle einen Prompt, der drei Produktideen vergleicht und die erste Umsetzung empfiehlt.",
  ],
};

const foundryCopy: Record<LanguageCode, FoundryCopy> = {
  en: {
    roleLane: "ROLE LANE",
    primaryGoal: "PRIMARY GOAL",
    constraints: "CONSTRAINTS",
    successCriteria: "SUCCESS CRITERIA",
    deliverables: "DELIVERABLES",
    operatingRules: "OPERATING RULES",
    ruleStepByStep: "Think step-by-step internally but output only actionable results.",
    ruleAssumptions: "Use explicit assumptions when data is missing.",
    ruleRisks: "Surface risks before final recommendations.",
    ruleStructure: "Prefer structured output over vague prose.",
    domainTerms: "DOMAIN TERMS TO USE WHEN RELEVANT",
    refinementPressure: "REFINEMENT PRESSURE",
    outputFormat: "OUTPUT FORMAT: Summary, Plan, Risks, Validation, Next Action.",
    reportTitle: "Fractal Prompt Foundry Report",
    sectionChampion: "Champion",
    sectionWhy: "Why this run feels unique",
    sectionPressure: "Pressure balance",
    sectionGenome: "Genome profile",
    sectionRounds: "Round winners",
    sectionLineage: "Lineage graph",
    fieldCandidate: "Candidate",
    fieldStyle: "Style",
    fieldScore: "Score",
    fieldGenomeId: "Genome ID",
    fieldLaneMix: "Lane mix",
    fieldLineageDepth: "Lineage depth",
    fieldBulletDensity: "Bullet density",
    fieldImperativeDensity: "Imperative density",
    fieldControlDensity: "Control density",
    fieldDomainSaturation: "Domain saturation",
    roundWinner: "Round",
    missingDomainPressure: "Missing domain pressure",
    critiqueStructure: "Needs clearer output sections or stronger formatting constraints.",
    critiqueActionability: "Needs more explicit validation, next steps, or execution framing.",
    critiqueNovelty: "Too similar to previous prompt DNA; mutation should introduce a new angle.",
    critiqueVagueness: "Still vague; needs more operational language and specific checks.",
    summaryStrong: "Strong structure with clear execution pressure.",
    summaryWeak: "Useful candidate, but still leaves ambiguity under pressure.",
    uniquenessCoverage: "Coverage is high enough to preserve mission-specific pressure.",
    uniquenessNovelty: "Novelty stayed alive instead of collapsing into copies.",
    uniquenessStructure: "The output structure forces clearer downstream execution.",
    uniquenessStyle: "Lane mix produced a prompt with a distinct operational style.",
  },
  es: {
    roleLane: "ROL",
    primaryGoal: "OBJETIVO PRINCIPAL",
    constraints: "RESTRICCIONES",
    successCriteria: "CRITERIOS DE EXITO",
    deliverables: "ENTREGABLES",
    operatingRules: "REGLAS OPERATIVAS",
    ruleStepByStep: "Piensa paso a paso internamente pero entrega solo resultados accionables.",
    ruleAssumptions: "Usa supuestos explicitos cuando falten datos.",
    ruleRisks: "Muestra riesgos antes de la recomendacion final.",
    ruleStructure: "Prefiere salida estructurada en lugar de prosa vaga.",
    domainTerms: "TERMINOS DEL DOMINIO A USAR CUANDO APLIQUE",
    refinementPressure: "PRESION DE REFINAMIENTO",
    outputFormat: "FORMATO DE SALIDA: Resumen, Plan, Riesgos, Validacion, Siguiente accion.",
    reportTitle: "Reporte de Fractal Prompt Foundry",
    sectionChampion: "Ganador",
    sectionWhy: "Por que esta ejecucion se siente distinta",
    sectionPressure: "Balance de presion",
    sectionGenome: "Perfil del genoma",
    sectionRounds: "Ganadores por ronda",
    sectionLineage: "Grafo de linaje",
    fieldCandidate: "Candidato",
    fieldStyle: "Estilo",
    fieldScore: "Puntaje",
    fieldGenomeId: "ID del genoma",
    fieldLaneMix: "Mezcla de lanes",
    fieldLineageDepth: "Profundidad del linaje",
    fieldBulletDensity: "Densidad de bullets",
    fieldImperativeDensity: "Densidad imperativa",
    fieldControlDensity: "Densidad de control",
    fieldDomainSaturation: "Saturacion del dominio",
    roundWinner: "Ronda",
    missingDomainPressure: "Falta presion de dominio",
    critiqueStructure: "Necesita secciones mas claras o reglas de formato mas fuertes.",
    critiqueActionability: "Necesita validacion mas explicita, siguientes pasos o mejor marco de ejecucion.",
    critiqueNovelty: "Se parece demasiado al ADN previo; la mutacion debe introducir un angulo nuevo.",
    critiqueVagueness: "Sigue siendo vago; necesita lenguaje operativo y chequeos concretos.",
    summaryStrong: "Buena estructura con presion de ejecucion clara.",
    summaryWeak: "Candidato util, pero todavia deja ambiguedad bajo presion.",
    uniquenessCoverage: "La cobertura es suficientemente alta para mantener la presion especifica de la mision.",
    uniquenessNovelty: "La novedad sobrevivio y no colapso en copias.",
    uniquenessStructure: "La estructura obliga una ejecucion mas clara aguas abajo.",
    uniquenessStyle: "La mezcla de lanes produjo un estilo operativo distinto.",
  },
  fr: {
    roleLane: "ROLE",
    primaryGoal: "OBJECTIF PRINCIPAL",
    constraints: "CONTRAINTES",
    successCriteria: "CRITERES DE SUCCES",
    deliverables: "LIVRABLES",
    operatingRules: "REGLES OPERATOIRES",
    ruleStepByStep: "Raisonne etape par etape en interne mais livre seulement des resultats actionnables.",
    ruleAssumptions: "Utilise des hypotheses explicites quand il manque des donnees.",
    ruleRisks: "Expose les risques avant la recommandation finale.",
    ruleStructure: "Prefere une sortie structuree a une prose vague.",
    domainTerms: "TERMES DU DOMAINE A UTILISER SI PERTINENT",
    refinementPressure: "PRESSION DE RAFFINEMENT",
    outputFormat: "FORMAT DE SORTIE : Resume, Plan, Risques, Validation, Action suivante.",
    reportTitle: "Rapport Fractal Prompt Foundry",
    sectionChampion: "Champion",
    sectionWhy: "Pourquoi cette execution est unique",
    sectionPressure: "Equilibre de pression",
    sectionGenome: "Profil du genome",
    sectionRounds: "Vainqueurs par round",
    sectionLineage: "Graphe de lignage",
    fieldCandidate: "Candidat",
    fieldStyle: "Style",
    fieldScore: "Score",
    fieldGenomeId: "ID genome",
    fieldLaneMix: "Melange de lanes",
    fieldLineageDepth: "Profondeur de lignage",
    fieldBulletDensity: "Densite de puces",
    fieldImperativeDensity: "Densite imperative",
    fieldControlDensity: "Densite de controle",
    fieldDomainSaturation: "Saturation domaine",
    roundWinner: "Round",
    missingDomainPressure: "Pression domaine manquante",
    critiqueStructure: "La sortie a besoin de sections plus claires ou de contraintes de format plus fortes.",
    critiqueActionability: "La sortie a besoin de validation plus explicite ou d un meilleur cadrage d execution.",
    critiqueNovelty: "Trop proche de l ADN precedent ; la mutation doit apporter un angle nouveau.",
    critiqueVagueness: "Le prompt reste vague ; il faut un langage plus operationnel et des verifications precises.",
    summaryStrong: "Structure solide avec une pression d execution claire.",
    summaryWeak: "Candidat utile mais encore ambigu sous pression.",
    uniquenessCoverage: "La couverture maintient bien la pression propre a la mission.",
    uniquenessNovelty: "La nouveaute reste presente au lieu de s effondrer en copies.",
    uniquenessStructure: "La structure force une execution plus claire en aval.",
    uniquenessStyle: "Le melange de lanes produit un style operationnel distinct.",
  },
  de: {
    roleLane: "ROLLE",
    primaryGoal: "HAUPTZIEL",
    constraints: "VORGABEN",
    successCriteria: "ERFOLGSKRITERIEN",
    deliverables: "LIEFEROBJEKTE",
    operatingRules: "BETRIEBSREGELN",
    ruleStepByStep: "Denke intern Schritt fur Schritt, liefere aber nur umsetzbare Ergebnisse.",
    ruleAssumptions: "Nutze explizite Annahmen, wenn Daten fehlen.",
    ruleRisks: "Zeige Risiken vor der finalen Empfehlung.",
    ruleStructure: "Bevorzuge strukturierte Ausgabe statt vager Prosa.",
    domainTerms: "DOMAINBEGRIFFE, WENN RELEVANT",
    refinementPressure: "VERFEINERUNGSDRUCK",
    outputFormat: "AUSGABEFORMAT: Zusammenfassung, Plan, Risiken, Validierung, Nachster Schritt.",
    reportTitle: "Fractal Prompt Foundry Bericht",
    sectionChampion: "Gewinner",
    sectionWhy: "Warum dieser Lauf besonders ist",
    sectionPressure: "Druckbalance",
    sectionGenome: "Genomprofil",
    sectionRounds: "Rundensieger",
    sectionLineage: "Liniengraph",
    fieldCandidate: "Kandidat",
    fieldStyle: "Stil",
    fieldScore: "Wert",
    fieldGenomeId: "Genom-ID",
    fieldLaneMix: "Lane-Mix",
    fieldLineageDepth: "Linientiefe",
    fieldBulletDensity: "Bullet-Dichte",
    fieldImperativeDensity: "Imperativ-Dichte",
    fieldControlDensity: "Kontroll-Dichte",
    fieldDomainSaturation: "Domainsaettigung",
    roundWinner: "Runde",
    missingDomainPressure: "Fehlender Domain-Druck",
    critiqueStructure: "Braucht klarere Ausgabebereiche oder strengere Formatvorgaben.",
    critiqueActionability: "Braucht explizitere Validierung, nachste Schritte oder klareres Ausfuhrungs-Setup.",
    critiqueNovelty: "Zu ahnlich zum bisherigen Prompt-DNA; Mutation braucht einen neuen Blickwinkel.",
    critiqueVagueness: "Noch zu vage; braucht operativere Sprache und konkrete Checks.",
    summaryStrong: "Starke Struktur mit klarem Ausfuhrungsdruck.",
    summaryWeak: "Nutzbarer Kandidat, aber unter Druck noch zu mehrdeutig.",
    uniquenessCoverage: "Die Abdeckung ist hoch genug, um den missionsspezifischen Druck zu erhalten.",
    uniquenessNovelty: "Neuheit bleibt erhalten statt in Kopien zu kollabieren.",
    uniquenessStructure: "Die Struktur erzwingt klarere nachgelagerte Ausfuhrung.",
    uniquenessStyle: "Der Lane-Mix erzeugt einen eigenstandigen operativen Stil.",
  },
};

export const presetMeta: Record<UserPresetId, PresetMeta> = {
  founder: {
    label: { en: "Founder", es: "Founder", fr: "Founder", de: "Founder" },
    description: {
      en: "Product and launch mode with speed and ROI pressure.",
      es: "Modo producto y lanzamiento con foco en velocidad y ROI.",
      fr: "Mode produit et lancement avec pression sur la vitesse et le ROI.",
      de: "Produkt- und Launch-Modus mit Fokus auf Tempo und ROI.",
    },
  },
  marketer: {
    label: { en: "Marketer", es: "Marketer", fr: "Marketer", de: "Marketer" },
    description: {
      en: "Growth, messaging, funnels, and conversion optimization.",
      es: "Growth, mensajes, funnels y optimizacion de conversion.",
      fr: "Growth, messaging, tunnels et optimisation de conversion.",
      de: "Growth, Messaging, Funnels und Conversion-Optimierung.",
    },
  },
  analyst: {
    label: { en: "Analyst", es: "Analista", fr: "Analyste", de: "Analyst" },
    description: {
      en: "Decision analysis, tradeoffs, scenarios, and recommendations.",
      es: "Analisis de decisiones, tradeoffs, escenarios y recomendaciones.",
      fr: "Analyse de decision, arbitrages, scenarios et recommandations.",
      de: "Entscheidungsanalyse, Abwagungen, Szenarien und Empfehlungen.",
    },
  },
  operator: {
    label: { en: "Operator", es: "Operador", fr: "Operateur", de: "Operator" },
    description: {
      en: "Processes, SOPs, QA, and repeatable operations.",
      es: "Procesos, SOPs, QA y operaciones repetibles.",
      fr: "Processus, SOP, QA et operations repetables.",
      de: "Prozesse, SOPs, QA und wiederholbare Ablaufe.",
    },
  },
  researcher: {
    label: { en: "Researcher", es: "Researcher", fr: "Researcher", de: "Researcher" },
    description: {
      en: "Structured research, synthesis, and evidence-first output.",
      es: "Investigacion estructurada, sintesis y salida basada en evidencia.",
      fr: "Recherche structuree, synthese et restitution fondee sur des preuves.",
      de: "Strukturierte Recherche, Synthese und evidenzbasierte Ausgabe.",
    },
  },
};

const missionTemplates: Record<UserPresetId, Record<LanguageCode, MissionTemplate>> = {
  founder: {
    en: {
      name: "saas-launch-brief",
      goal: "Design a prompt that helps a founder turn a raw product idea into an MVP launch plan, monetization path, and first distribution loop.",
      constraints: [
        "Keep the output practical and launchable within 7 days.",
        "Prioritize fast validation over theoretical perfection.",
        "Include risks, assumptions, and quick revenue tests.",
      ],
      success_criteria: [
        "Output is structured and execution-ready.",
        "It includes monetization opportunities and MVP scope.",
        "It forces validation before scaling.",
      ],
      deliverables: ["launch brief", "MVP scope", "pricing test", "next action"],
      domain_terms: ["MVP", "pricing", "distribution", "validation", "ROI", "automation"],
      audience: "Indie founders and product builders",
    },
    es: {
      name: "brief-lanzamiento-saas",
      goal: "Disena un prompt que ayude a un founder a convertir una idea en un plan de lanzamiento MVP, via de monetizacion y primer ciclo de distribucion.",
      constraints: [
        "La salida debe ser ejecutable en 7 dias.",
        "Prioriza validacion rapida sobre perfeccion teorica.",
        "Incluye riesgos, supuestos y pruebas rapidas de ingresos.",
      ],
      success_criteria: [
        "La salida es estructurada y accionable.",
        "Incluye oportunidades de monetizacion y alcance MVP.",
        "Fuerza validacion antes de escalar.",
      ],
      deliverables: ["brief de lanzamiento", "alcance MVP", "test de pricing", "siguiente accion"],
      domain_terms: ["MVP", "pricing", "distribucion", "validacion", "ROI", "automatizacion"],
      audience: "Founders indie y builders de producto",
    },
    fr: {
      name: "brief-lancement-saas",
      goal: "Concevoir un prompt qui aide un founder a transformer une idee brute en plan de lancement MVP, voie de monetisation et premiere boucle de distribution.",
      constraints: [
        "La sortie doit etre executable en 7 jours.",
        "Prioriser la validation rapide plutot que la perfection theorique.",
        "Inclure risques, hypotheses et tests de revenu rapides.",
      ],
      success_criteria: [
        "La sortie est structuree et exploitable.",
        "Elle inclut monetisation et perimetre MVP.",
        "Elle force la validation avant l extension.",
      ],
      deliverables: ["brief de lancement", "perimetre MVP", "test de pricing", "action suivante"],
      domain_terms: ["MVP", "pricing", "distribution", "validation", "ROI", "automatisation"],
      audience: "Founders independants et builders produit",
    },
    de: {
      name: "saas-launch-brief",
      goal: "Erstelle einen Prompt, der einem Founder hilft, aus einer Idee einen MVP-Launchplan, Monetarisierungspfad und erste Distributionsschleife abzuleiten.",
      constraints: [
        "Die Ausgabe muss in 7 Tagen umsetzbar sein.",
        "Schnelle Validierung vor theoretischer Perfektion.",
        "Risiken, Annahmen und schnelle Umsatztests einschliessen.",
      ],
      success_criteria: [
        "Die Ausgabe ist strukturiert und umsetzbar.",
        "Sie enthalt Monetarisierungsoptionen und MVP-Scope.",
        "Sie erzwingt Validierung vor Skalierung.",
      ],
      deliverables: ["Launch-Brief", "MVP-Scope", "Pricing-Test", "nachster Schritt"],
      domain_terms: ["MVP", "Pricing", "Distribution", "Validierung", "ROI", "Automatisierung"],
      audience: "Indie-Founder und Produkt-Builder",
    },
  },
  marketer: {
    en: {
      name: "conversion-campaign-foundry",
      goal: "Create a prompt for a growth marketer who needs campaign concepts, angle testing, and landing-page messaging for one offer.",
      constraints: [
        "Focus on conversion, not brand theater.",
        "Keep the output usable across paid, email, and landing pages.",
        "Highlight assumptions behind each angle.",
      ],
      success_criteria: [
        "It produces testable campaign angles.",
        "It includes audience pain points and objections.",
        "It suggests a measurement plan.",
      ],
      deliverables: ["campaign angles", "landing-page copy", "objection map", "measurement plan"],
      domain_terms: ["CTR", "conversion rate", "offer", "objection", "CTA", "funnel"],
      audience: "Performance marketers and acquisition teams",
    },
    es: {
      name: "foundry-campana-conversion",
      goal: "Crea un prompt para un marketer de growth que necesita conceptos de campana, pruebas de angulos y mensajes de landing para una oferta.",
      constraints: [
        "Enfocate en conversion, no en branding vacio.",
        "La salida debe servir para paid, email y landings.",
        "Destaca los supuestos de cada angulo.",
      ],
      success_criteria: [
        "Produce angulos testables.",
        "Incluye dolores y objeciones de la audiencia.",
        "Sugiere un plan de medicion.",
      ],
      deliverables: ["angulos de campana", "copy para landing", "mapa de objeciones", "plan de medicion"],
      domain_terms: ["CTR", "tasa de conversion", "oferta", "objecion", "CTA", "funnel"],
      audience: "Marketers de performance y equipos de adquisicion",
    },
    fr: {
      name: "foundry-campagne-conversion",
      goal: "Cree un prompt pour un growth marketer qui a besoin de concepts de campagne, de tests d angles et de messaging landing pour une offre.",
      constraints: [
        "Se concentrer sur la conversion, pas sur le theatre de marque.",
        "La sortie doit etre reutilisable en paid, email et landing pages.",
        "Mettre en evidence les hypotheses derriere chaque angle.",
      ],
      success_criteria: [
        "Le prompt produit des angles testables.",
        "Il inclut douleurs et objections de l audience.",
        "Il propose un plan de mesure.",
      ],
      deliverables: ["angles de campagne", "copy landing", "carte des objections", "plan de mesure"],
      domain_terms: ["CTR", "taux de conversion", "offre", "objection", "CTA", "funnel"],
      audience: "Equipes growth et acquisition",
    },
    de: {
      name: "conversion-campaign-foundry",
      goal: "Erstelle einen Prompt fur Growth-Marketer, die Kampagnenideen, Angle-Tests und Landingpage-Messaging fur ein Angebot brauchen.",
      constraints: [
        "Conversion statt Marken-Theater priorisieren.",
        "Ausgabe fur Paid, E-Mail und Landingpages nutzbar halten.",
        "Annahmen hinter jedem Angle sichtbar machen.",
      ],
      success_criteria: [
        "Es entstehen testbare Kampagnen-Angles.",
        "Zielgruppenprobleme und Einwande sind enthalten.",
        "Ein Messplan wird vorgeschlagen.",
      ],
      deliverables: ["Kampagnen-Angles", "Landingpage-Copy", "Einwandkarte", "Messplan"],
      domain_terms: ["CTR", "Conversion Rate", "Angebot", "Einwand", "CTA", "Funnel"],
      audience: "Performance-Marketer und Acquisition-Teams",
    },
  },
  analyst: {
    en: {
      name: "decision-analysis-foundry",
      goal: "Design a prompt for an analyst who needs to compare options, surface tradeoffs, and recommend the next best action from incomplete information.",
      constraints: [
        "Do not make unsupported claims.",
        "Always include assumptions, risks, and alternative scenarios.",
        "Separate facts from assumptions.",
      ],
      success_criteria: [
        "The output compares options clearly.",
        "Risks and confidence levels are explicit.",
        "It ends with a concrete recommendation and next step.",
      ],
      deliverables: ["decision brief", "option matrix", "risk map", "next action"],
      domain_terms: ["option", "tradeoff", "assumption", "risk", "confidence", "scenario"],
      audience: "Analysts, managers, founders, and operators",
    },
    es: {
      name: "foundry-analisis-decision",
      goal: "Disena un prompt para un analista que necesita comparar opciones, mostrar tradeoffs y recomendar la mejor siguiente accion con informacion incompleta.",
      constraints: [
        "No hagas afirmaciones sin soporte.",
        "Incluye siempre supuestos, riesgos y escenarios alternativos.",
        "Separa hechos de supuestos.",
      ],
      success_criteria: [
        "La salida compara opciones con claridad.",
        "Los riesgos y niveles de confianza son explicitos.",
        "Termina con una recomendacion concreta y siguiente paso.",
      ],
      deliverables: ["brief de decision", "matriz de opciones", "mapa de riesgos", "siguiente accion"],
      domain_terms: ["opcion", "tradeoff", "supuesto", "riesgo", "confianza", "escenario"],
      audience: "Analistas, managers, founders y operadores",
    },
    fr: {
      name: "foundry-analyse-decision",
      goal: "Concevoir un prompt pour un analyste qui doit comparer des options, exposer les arbitrages et recommander la meilleure action suivante avec des informations incompletes.",
      constraints: [
        "Ne pas faire d affirmations non etayees.",
        "Toujours inclure hypotheses, risques et scenarios alternatifs.",
        "Distinguer faits et hypotheses.",
      ],
      success_criteria: [
        "La sortie compare clairement les options.",
        "Les risques et niveaux de confiance sont explicites.",
        "Elle termine par une recommandation concrete et une action suivante.",
      ],
      deliverables: ["brief de decision", "matrice d options", "carte des risques", "action suivante"],
      domain_terms: ["option", "arbitrage", "hypothese", "risque", "confiance", "scenario"],
      audience: "Analystes, managers, founders et operateurs",
    },
    de: {
      name: "decision-analysis-foundry",
      goal: "Erstelle einen Prompt fur Analysten, die Optionen vergleichen, Abwagungen sichtbar machen und aus unvollstandigen Informationen den nachsten besten Schritt empfehlen mussen.",
      constraints: [
        "Keine unbelegten Behauptungen machen.",
        "Immer Annahmen, Risiken und alternative Szenarien aufnehmen.",
        "Fakten von Annahmen trennen.",
      ],
      success_criteria: [
        "Die Ausgabe vergleicht Optionen klar.",
        "Risiken und Vertrauensniveau sind explizit.",
        "Sie endet mit einer konkreten Empfehlung und einem nachsten Schritt.",
      ],
      deliverables: ["Entscheidungsbrief", "Optionsmatrix", "Risikokarte", "nachster Schritt"],
      domain_terms: ["Option", "Abwagung", "Annahme", "Risiko", "Vertrauen", "Szenario"],
      audience: "Analysten, Manager, Founder und Operatoren",
    },
  },
  operator: {
    en: {
      name: "ops-playbook-foundry",
      goal: "Build a prompt for an operations lead who needs SOPs, QA checkpoints, and escalation rules for a recurring workflow.",
      constraints: [
        "The output must be repeatable by another operator.",
        "Include handoff points and failure handling.",
        "Avoid generic management language.",
      ],
      success_criteria: [
        "It produces a usable SOP and checklist.",
        "It includes quality gates and escalation logic.",
        "It reduces ambiguity for a new operator.",
      ],
      deliverables: ["SOP", "QA checklist", "handoff map", "next action"],
      domain_terms: ["handoff", "SLA", "QA", "escalation", "workflow", "owner"],
      audience: "Operations leads and service teams",
    },
    es: {
      name: "foundry-playbook-ops",
      goal: "Construye un prompt para un lider de operaciones que necesita SOPs, checkpoints de QA y reglas de escalado para un flujo recurrente.",
      constraints: [
        "La salida debe ser repetible por otro operador.",
        "Incluye puntos de handoff y manejo de fallos.",
        "Evita lenguaje de management generico.",
      ],
      success_criteria: [
        "Produce un SOP y checklist utilizables.",
        "Incluye quality gates y logica de escalado.",
        "Reduce ambiguedad para un operador nuevo.",
      ],
      deliverables: ["SOP", "checklist QA", "mapa de handoff", "siguiente accion"],
      domain_terms: ["handoff", "SLA", "QA", "escalado", "workflow", "owner"],
      audience: "Lideres de operaciones y equipos de servicio",
    },
    fr: {
      name: "foundry-playbook-ops",
      goal: "Construire un prompt pour un responsable operations qui a besoin de SOP, de checkpoints QA et de regles d escalation pour un workflow recurrent.",
      constraints: [
        "La sortie doit etre repetable par un autre operateur.",
        "Inclure points de handoff et gestion des echecs.",
        "Eviter le langage managerial generique.",
      ],
      success_criteria: [
        "Le prompt produit un SOP et une checklist exploitables.",
        "Il inclut quality gates et logique d escalation.",
        "Il reduit l ambiguite pour un nouvel operateur.",
      ],
      deliverables: ["SOP", "checklist QA", "carte de handoff", "action suivante"],
      domain_terms: ["handoff", "SLA", "QA", "escalade", "workflow", "owner"],
      audience: "Responsables operations et equipes service",
    },
    de: {
      name: "ops-playbook-foundry",
      goal: "Erstelle einen Prompt fur Operations-Leads, die SOPs, QA-Checkpoints und Eskalationsregeln fur einen wiederkehrenden Workflow brauchen.",
      constraints: [
        "Die Ausgabe muss von einer anderen Person wiederholbar sein.",
        "Handoffs und Fehlerbehandlung einschliessen.",
        "Generische Management-Sprache vermeiden.",
      ],
      success_criteria: [
        "Es entsteht ein nutzbares SOP und eine Checkliste.",
        "Qualitatsgates und Eskalationslogik sind enthalten.",
        "Die Mehrdeutigkeit fur neue Operatoren sinkt.",
      ],
      deliverables: ["SOP", "QA-Checkliste", "Handoff-Map", "nachster Schritt"],
      domain_terms: ["Handoff", "SLA", "QA", "Eskalation", "Workflow", "Owner"],
      audience: "Operations-Leads und Service-Teams",
    },
  },
  researcher: {
    en: {
      name: "research-synthesis-foundry",
      goal: "Design a prompt for a researcher who needs a clear synthesis, evidence map, and open questions from messy input.",
      constraints: [
        "Separate evidence from interpretation.",
        "Include uncertainties and missing information.",
        "Keep the structure easy to scan.",
      ],
      success_criteria: [
        "The prompt requests sources, synthesis, and open questions.",
        "The output is structured for fast review.",
        "It avoids false certainty.",
      ],
      deliverables: ["evidence map", "synthesis", "open questions", "next action"],
      domain_terms: ["evidence", "assumption", "uncertainty", "synthesis", "source", "gap"],
      audience: "Researchers, analysts, and strategy teams",
    },
    es: {
      name: "foundry-sintesis-investigacion",
      goal: "Disena un prompt para un researcher que necesita sintesis clara, mapa de evidencia y preguntas abiertas a partir de input desordenado.",
      constraints: [
        "Separa evidencia de interpretacion.",
        "Incluye incertidumbres e informacion faltante.",
        "Mantiene una estructura facil de escanear.",
      ],
      success_criteria: [
        "El prompt pide fuentes, sintesis y preguntas abiertas.",
        "La salida esta estructurada para revision rapida.",
        "Evita falsa certeza.",
      ],
      deliverables: ["mapa de evidencia", "sintesis", "preguntas abiertas", "siguiente accion"],
      domain_terms: ["evidencia", "supuesto", "incertidumbre", "sintesis", "fuente", "gap"],
      audience: "Researchers, analistas y equipos de estrategia",
    },
    fr: {
      name: "foundry-synthese-recherche",
      goal: "Concevoir un prompt pour un researcher qui a besoin d une synthese claire, d une carte de preuves et de questions ouvertes a partir d un input desordonne.",
      constraints: [
        "Distinguer les preuves de l interpretation.",
        "Inclure incertitudes et informations manquantes.",
        "Garder une structure facile a parcourir.",
      ],
      success_criteria: [
        "Le prompt demande sources, synthese et questions ouvertes.",
        "La sortie est structuree pour une revue rapide.",
        "Elle evite la fausse certitude.",
      ],
      deliverables: ["carte de preuves", "synthese", "questions ouvertes", "action suivante"],
      domain_terms: ["preuve", "hypothese", "incertitude", "synthese", "source", "manque"],
      audience: "Researchers, analystes et equipes strategie",
    },
    de: {
      name: "research-synthesis-foundry",
      goal: "Erstelle einen Prompt fur Researcher, die aus unordentlichem Input eine klare Synthese, Evidenzkarte und offene Fragen ableiten mussen.",
      constraints: [
        "Evidenz von Interpretation trennen.",
        "Unsicherheiten und fehlende Informationen aufnehmen.",
        "Struktur leicht scanbar halten.",
      ],
      success_criteria: [
        "Der Prompt fordert Quellen, Synthese und offene Fragen an.",
        "Die Ausgabe ist fur schnelle Review strukturiert.",
        "Sie vermeidet falsche Sicherheit.",
      ],
      deliverables: ["Evidenzkarte", "Synthese", "offene Fragen", "nachster Schritt"],
      domain_terms: ["Evidenz", "Annahme", "Unsicherheit", "Synthese", "Quelle", "Lucke"],
      audience: "Researcher, Analysten und Strategie-Teams",
    },
  },
};

export function getUiCopy(language: LanguageCode): UiCopy {
  return uiCopy[language];
}

export function getFoundryCopy(language: LanguageCode): FoundryCopy {
  return foundryCopy[language];
}

export function getQuickExamples(language: LanguageCode): string[] {
  return quickExamples[language];
}

export function getMissionTemplate(
  preset: UserPresetId,
  language: LanguageCode
): Mission {
  const template = missionTemplates[preset][language];
  return {
    ...template,
    constraints: [...template.constraints],
    success_criteria: [...template.success_criteria],
    deliverables: [...template.deliverables],
    domain_terms: [...template.domain_terms],
    preferred_language: language,
    preset,
  };
}

export function createMissionFromIdea(
  idea: string,
  preset: UserPresetId,
  language: LanguageCode
): Mission {
  const mission = getMissionTemplate(preset, language);
  const cleaned = idea.trim();
  const terms = extractDomainTerms(cleaned);
  const slug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return {
    ...mission,
    name: slug || mission.name,
    goal: cleaned || mission.goal,
    domain_terms: [...new Set([...terms, ...mission.domain_terms])].slice(0, 12),
  };
}

export function inferPresetFromIdea(idea: string): UserPresetId {
  const text = idea.toLowerCase();
  const signals: Array<[UserPresetId, string[]]> = [
    ["marketer", ["ad", "ads", "campaign", "conversion", "copy", "email", "landing", "oferta", "ventas", "campana"]],
    ["operator", ["checklist", "handoff", "meeting", "notas", "reunion", "responsables", "sop", "workflow"]],
    ["analyst", ["analizar", "compare", "decision", "decidir", "options", "opciones", "riesgos", "scenario"]],
    ["researcher", ["evidence", "fuentes", "investigar", "research", "sintesis", "sources", "summary"]],
    ["founder", ["launch", "lanzar", "mvp", "pricing", "producto", "saas", "startup"]],
  ];

  let best: UserPresetId = "analyst";
  let bestScore = 0;
  for (const [candidate, terms] of signals) {
    const score = terms.filter((term) => text.includes(term)).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function detectLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return "en";
  const raw = navigator.language.toLowerCase();
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("de")) return "de";
  return "en";
}

function extractDomainTerms(input: string): string[] {
  const stop = new Set([
    "about",
    "after",
    "and",
    "con",
    "dans",
    "das",
    "der",
    "die",
    "ein",
    "for",
    "from",
    "help",
    "las",
    "les",
    "los",
    "para",
    "por",
    "que",
    "the",
    "und",
    "una",
    "une",
    "with",
  ]);

  return input
    .toLowerCase()
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 3 && !stop.has(word))
    .slice(0, 8);
}
