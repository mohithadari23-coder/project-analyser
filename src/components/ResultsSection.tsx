import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Edit3,
  FileDown,
  FileText,
  Layers,
  PlusCircle,
  RefreshCw,
  Rocket,
  Save,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { FutureEnhancement, ResearchPaperData } from '../types/research';
import {
  countWords,
  downloadResearchAsPdf,
  downloadResearchAsTxt,
  formatResearchAsText,
} from '../utils/exportResearch';

interface ResultsSectionProps {
  data: ResearchPaperData;
  selectedTitleIndex: number;
  onSelectTitle: (index: number) => void;
  onUpdateData: (updated: ResearchPaperData) => void;
  onRegenerateAbstract: () => Promise<void>;
  isRegeneratingAbstract: boolean;
  onRegenerateAll: () => void;
  onClearAll: () => void;
  onNewResearch: () => void;
  onNotify: (message: string) => void;
}

const ENHANCEMENT_ICONS = [Rocket, Cpu, Layers];

export function ResultsSection({
  data,
  selectedTitleIndex,
  onSelectTitle,
  onUpdateData,
  onRegenerateAbstract,
  isRegeneratingAbstract,
  onRegenerateAll,
  onClearAll,
  onNewResearch,
  onNotify,
}: ResultsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [editingTitles, setEditingTitles] = useState(false);
  const [draftTitles, setDraftTitles] = useState<string[]>(data.titles);

  const [editingAbstract, setEditingAbstract] = useState(false);
  const [draftAbstract, setDraftAbstract] = useState(data.abstract);

  const [editingKeywords, setEditingKeywords] = useState(false);
  const [draftKeywords, setDraftKeywords] = useState(data.keywords.join(', '));

  const [editingObjectives, setEditingObjectives] = useState(false);
  const [draftObjectives, setDraftObjectives] = useState<string[]>(data.objectives);

  const [editingEnhancements, setEditingEnhancements] = useState(false);
  const [draftEnhancements, setDraftEnhancements] = useState<FutureEnhancement[]>(
    data.futureEnhancements
  );

  const copyText = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onNotify(`${label} copied to clipboard.`);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch {
      onNotify('Unable to copy automatically. Please copy manually.');
    }
  };

  const wordCount = countWords(data.abstract);
  const formattedDate = new Date(data.generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const saveTitles = () => {
    const cleaned = draftTitles.map((t) => t.trim()).filter(Boolean);
    if (cleaned.length > 0) {
      onUpdateData({ ...data, titles: cleaned });
      onNotify('Research titles updated.');
    }
    setEditingTitles(false);
  };

  const saveAbstract = () => {
    const trimmed = draftAbstract.trim();
    if (trimmed.length > 0) {
      onUpdateData({ ...data, abstract: trimmed });
      onNotify('Abstract updated.');
    }
    setEditingAbstract(false);
  };

  const saveKeywords = () => {
    const parsed = draftKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (parsed.length > 0) {
      onUpdateData({ ...data, keywords: parsed });
      onNotify('Keywords updated.');
    }
    setEditingKeywords(false);
  };

  const saveObjectives = () => {
    const cleaned = draftObjectives.map((o) => o.trim()).filter(Boolean);
    if (cleaned.length > 0) {
      onUpdateData({ ...data, objectives: cleaned });
      onNotify('Research objectives updated.');
    }
    setEditingObjectives(false);
  };

  const saveEnhancements = () => {
    const cleaned = draftEnhancements.map((item) => ({
      title: item.title.trim() || 'Enhancement Proposal',
      impactArea: item.impactArea.trim() || 'Scalability',
      description: item.description.trim(),
    }));
    onUpdateData({ ...data, futureEnhancements: cleaned });
    setEditingEnhancements(false);
    onNotify('Future enhancements updated.');
  };

  return (
    <section
      id="results"
      className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-6"
    >
      {/* Top Action & Metadata Bar */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="lab-panel rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
      >
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Generated Research Content
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-zinc-400 font-mono tabular-nums">
            <span>{data.domain}</span>
            <span aria-hidden="true">·</span>
            <span>Generated {formattedDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              copyText(
                formatResearchAsText(data, selectedTitleIndex),
                'all',
                'Complete research content'
              )
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedKey === 'all' ? (
              <Check className="w-4 h-4 text-white" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4 text-white" aria-hidden="true" />
            )}
            <span>Copy All</span>
          </button>

          <button
            type="button"
            onClick={() => {
              downloadResearchAsPdf(data, selectedTitleIndex);
              onNotify('Downloaded research brief as PDF.');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-zinc-900 border border-white/25 hover:border-white/65 hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileDown className="w-4 h-4 text-white" aria-hidden="true" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              downloadResearchAsTxt(data, selectedTitleIndex);
              onNotify('Downloaded research brief as TXT.');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-zinc-900 border border-white/25 hover:border-white/65 hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4 text-zinc-300" aria-hidden="true" />
            <span>Download TXT</span>
          </button>

          <button
            type="button"
            onClick={onRegenerateAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-zinc-300" aria-hidden="true" />
            <span>Regenerate All</span>
          </button>

          <button
            type="button"
            onClick={onNewResearch}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>New Paper</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-white/15 hover:border-white/45 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Clear All</span>
          </button>
        </div>
      </motion.div>

      {/* RESULT 1: THREE RESEARCH TITLE OPTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="lab-panel rounded-2xl p-6 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              01. Proposed Research Titles
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Select your preferred title for exports and abstract refinement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (editingTitles) {
                saveTitles();
              } else {
                setDraftTitles(data.titles);
                setEditingTitles(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {editingTitles ? (
              <>
                <Save className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>Save Titles</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Edit Titles</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {editingTitles ? (
            draftTitles.map((title, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-300 w-5 shrink-0">
                  0{idx + 1}
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const next = [...draftTitles];
                    next[idx] = e.target.value;
                    setDraftTitles(next);
                  }}
                  className="w-full rounded-xl bg-[#050505] border border-white/25 px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white"
                />
              </div>
            ))
          ) : (
            data.titles.map((title, idx) => {
              const isSelected = idx === selectedTitleIndex;
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-white/12 via-zinc-900/70 to-transparent border-white'
                      : 'bg-zinc-950/80 border-white/15 hover:border-white/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTitle(idx)}
                    className="flex items-start gap-3 text-left flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white border-white text-black'
                          : 'border-zinc-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="text-sm sm:text-base font-semibold text-white leading-snug block">
                        {title}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 mt-1 block">
                        Option {idx + 1}
                        {isSelected ? ' · Preferred Title' : ' · Click to select'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyText(title, `title-${idx}`, 'Title')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-center"
                  >
                    {copiedKey === `title-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
                    )}
                    <span>Copy Title</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* RESULT 2: ABSTRACT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="lab-panel rounded-2xl p-6 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              02. Research Abstract
            </h3>
            <div className="mt-1 flex items-center gap-2.5 text-xs font-mono tabular-nums text-zinc-400">
              <span>{wordCount} words</span>
              <span aria-hidden="true">·</span>
              <span>Target 150–200 words</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editingAbstract) {
                  saveAbstract();
                } else {
                  setDraftAbstract(data.abstract);
                  setEditingAbstract(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {editingAbstract ? (
                <>
                  <Save className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  <span>Edit</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isRegeneratingAbstract}
              onClick={onRegenerateAbstract}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/25 hover:border-white/65 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-white ${
                  isRegeneratingAbstract ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
              <span>
                {isRegeneratingAbstract ? 'Regenerating...' : 'Regenerate Abstract'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => copyText(data.abstract, 'abstract', 'Abstract')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedKey === 'abstract' ? (
                <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
              )}
              <span>Copy Abstract</span>
            </button>
          </div>
        </div>

        {editingAbstract ? (
          <textarea
            rows={7}
            value={draftAbstract}
            onChange={(e) => setDraftAbstract(e.target.value)}
            className="w-full rounded-xl bg-[#050505] border border-white/25 p-4 text-sm sm:text-base text-zinc-100 leading-relaxed focus:outline-none focus:border-white"
          />
        ) : (
          <p className="text-sm sm:text-base text-zinc-200 leading-[1.78]">
            {data.abstract}
          </p>
        )}
      </motion.div>

      {/* RESULT 3 & 4: KEYWORDS + OBJECTIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* RESULT 3: RESEARCH KEYWORDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 lab-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                03. Research Keywords
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingKeywords) {
                      saveKeywords();
                    } else {
                      setDraftKeywords(data.keywords.join(', '));
                      setEditingKeywords(true);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer"
                >
                  {editingKeywords ? (
                    <Save className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  ) : (
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  )}
                  <span>{editingKeywords ? 'Save' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyText(data.keywords.join(', '), 'keywords', 'Keywords')
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'keywords' ? (
                    <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
                  )}
                  <span>Copy Keywords</span>
                </button>
              </div>
            </div>

            {editingKeywords ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={draftKeywords}
                  onChange={(e) => setDraftKeywords(e.target.value)}
                  className="w-full rounded-xl bg-[#050505] border border-white/25 p-3.5 text-sm text-white focus:outline-none focus:border-white"
                />
                <p className="text-xs text-zinc-400">
                  Separate keywords with commas.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {data.keywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono font-medium text-white bg-white/10 border border-white/30 shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-zinc-400 border-t border-white/12 pt-4">
            Indexed for IEEE Xplore, ACM Digital Library, and Springer taxonomy
            search.
          </p>
        </motion.div>

        {/* RESULT 4: RESEARCH OBJECTIVES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 lab-panel rounded-2xl p-6 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              04. Research Objectives
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (editingObjectives) {
                    saveObjectives();
                  } else {
                    setDraftObjectives(data.objectives);
                    setEditingObjectives(true);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer"
              >
                {editingObjectives ? (
                  <Save className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                ) : (
                  <Edit3 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                )}
                <span>{editingObjectives ? 'Save' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  copyText(
                    data.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n'),
                    'objectives',
                    'Research objectives'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedKey === 'objectives' ? (
                  <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
                )}
                <span>Copy Objectives</span>
              </button>
            </div>
          </div>

          {editingObjectives ? (
            <div className="space-y-3">
              {draftObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs text-zinc-300 mt-3">
                    0{idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={obj}
                    onChange={(e) => {
                      const next = [...draftObjectives];
                      next[idx] = e.target.value;
                      setDraftObjectives(next);
                    }}
                    className="w-full rounded-xl bg-[#050505] border border-white/25 p-3 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              ))}
            </div>
          ) : (
            <ol className="space-y-4">
              {data.objectives.map((obj, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.1 + idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-950/80 border border-white/12"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1, type: 'spring', stiffness: 260 }}
                    className="mt-0.5 shrink-0"
                  >
                    <CheckCircle2
                      className="w-5 h-5 text-white"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <div className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                    <span className="font-mono text-xs text-zinc-400 mr-2">
                      0{idx + 1}.
                    </span>
                    {obj}
                  </div>
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>
      </div>

      {/* RESULT 5: FUTURE ENHANCEMENTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="lab-panel rounded-2xl p-6 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              05. Future Enhancements
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Actionable scalability and next-phase research directions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editingEnhancements) {
                  saveEnhancements();
                } else {
                  setDraftEnhancements(data.futureEnhancements);
                  setEditingEnhancements(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer"
            >
              {editingEnhancements ? (
                <Save className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              ) : (
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              )}
              <span>{editingEnhancements ? 'Save' : 'Edit'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                copyText(
                  data.futureEnhancements
                    .map((e, i) => `${i + 1}. ${e.title}: ${e.description}`)
                    .join('\n\n'),
                  'enhancements',
                  'Future enhancements'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-white/20 hover:border-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedKey === 'enhancements' ? (
                <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
              )}
              <span>Copy Enhancements</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {editingEnhancements
            ? draftEnhancements.map((enh, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#050505] border border-white/25 space-y-2.5"
                >
                  <input
                    type="text"
                    value={enh.title}
                    onChange={(e) => {
                      const next = [...draftEnhancements];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setDraftEnhancements(next);
                    }}
                    placeholder="Enhancement title"
                    className="w-full rounded-lg bg-zinc-950 border border-white/20 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-white"
                  />
                  <input
                    type="text"
                    value={enh.impactArea}
                    onChange={(e) => {
                      const next = [...draftEnhancements];
                      next[idx] = { ...next[idx], impactArea: e.target.value };
                      setDraftEnhancements(next);
                    }}
                    placeholder="Impact area"
                    className="w-full rounded-lg bg-zinc-950 border border-white/20 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white"
                  />
                  <textarea
                    rows={4}
                    value={enh.description}
                    onChange={(e) => {
                      const next = [...draftEnhancements];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setDraftEnhancements(next);
                    }}
                    className="w-full rounded-lg bg-zinc-950 border border-white/20 p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-white"
                  />
                </div>
              ))
            : data.futureEnhancements.map((enh, idx) => {
                const Icon = ENHANCEMENT_ICONS[idx % ENHANCEMENT_ICONS.length];
                return (
                  <div
                    key={idx}
                    className="lab-panel-interactive rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-mono text-zinc-400">
                          {enh.impactArea}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-white leading-snug">
                        {enh.title}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        {enh.description}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      </motion.div>
    </section>
  );
}
