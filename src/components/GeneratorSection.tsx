import { FormEvent } from 'react';
import {
  BrainCircuit,
  Cpu,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResearchDomain } from '../types/research';
import { LoadingOrb3D } from './three/LoadingOrb3D';

interface GeneratorSectionProps {
  idea: string;
  onIdeaChange: (val: string) => void;
  domain: ResearchDomain;
  onDomainChange: (val: ResearchDomain) => void;
  isLoading: boolean;
  errorMessage: string | null;
  validationError: string | null;
  onClear: () => void;
  onGenerate: () => void;
}

const DOMAIN_OPTIONS: Array<{
  value: ResearchDomain;
  shortDesc: string;
  Icon: typeof BrainCircuit;
}> = [
  {
    value: 'Artificial Intelligence (AI)',
    shortDesc: 'ML, NLP, Vision & Agents',
    Icon: BrainCircuit,
  },
  {
    value: 'Internet of Things (IoT)',
    shortDesc: 'Sensors, Edge & Telemetry',
    Icon: Cpu,
  },
  {
    value: 'Web Development',
    shortDesc: 'Full-Stack, Cloud & UX',
    Icon: Globe,
  },
  {
    value: 'Cybersecurity',
    shortDesc: 'Zero-Trust, Threat & Crypto',
    Icon: ShieldCheck,
  },
  {
    value: 'Other',
    shortDesc: 'Interdisciplinary & Applied',
    Icon: Layers,
  },
];

const MAX_IDEA_CHARS = 1500;

export function GeneratorSection({
  idea,
  onIdeaChange,
  domain,
  onDomainChange,
  isLoading,
  errorMessage,
  validationError,
  onClear,
  onGenerate,
}: GeneratorSectionProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <section
      id="generator"
      className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="animated-border-shell"
      >
        <div className="lab-panel rounded-[19px] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create Your Research Paper
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400">
              Enter your idea and let AI structure your research.
            </p>
          </div>

          {isLoading ? (
            <div
              role="status"
              aria-live="polite"
              className="py-10 sm:py-14 flex flex-col items-center justify-center text-center"
            >
              <LoadingOrb3D />
              <p className="mt-4 font-display text-lg sm:text-xl font-semibold text-white">
                AI is analyzing your research idea...
              </p>
              <p className="mt-2 text-sm text-zinc-400 max-w-md">
                Synthesizing academic titles, structured abstract, indexing
                keywords, objectives, and future research directions for{' '}
                <span className="text-white font-medium">{domain}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* INPUT 1: PROJECT IDEA */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="project-idea-input"
                    className="block text-sm font-semibold text-white"
                  >
                    Describe Your Project Idea <span className="text-white">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tabular-nums text-zinc-400">
                      {idea.length} / {MAX_IDEA_CHARS} chars
                    </span>
                    {idea.length > 0 && (
                      <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-1.5 py-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="project-idea-input"
                  required
                  rows={4}
                  maxLength={MAX_IDEA_CHARS}
                  value={idea}
                  onChange={(e) => onIdeaChange(e.target.value)}
                  placeholder="Example: I want to develop a machine learning system that detects fake news on social media platforms and helps users identify misleading information."
                  className="w-full rounded-xl bg-[#050505]/95 border border-white/20 px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-colors resize-y min-h-[120px] leading-relaxed"
                />

                {validationError && (
                  <p role="alert" className="text-xs sm:text-sm text-zinc-200 font-medium">
                    {validationError}
                  </p>
                )}
              </div>

              {/* INPUT 2: RESEARCH DOMAIN */}
              <div className="space-y-3">
                <span className="block text-sm font-semibold text-white">
                  Select Research Domain
                </span>
                <div
                  role="radiogroup"
                  aria-label="Select Research Domain"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                >
                  {DOMAIN_OPTIONS.map(({ value, shortDesc, Icon }) => {
                    const selected = domain === value;
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => onDomainChange(value)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          selected
                            ? 'bg-gradient-to-br from-white/15 via-zinc-800/70 to-zinc-900 border-white shadow-[0_0_24px_rgba(255,255,255,0.14)]'
                            : 'bg-zinc-950/85 border-white/15 hover:border-white/45 hover:bg-zinc-900/90'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`w-5 h-5 ${
                              selected ? 'text-white' : 'text-zinc-400'
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selected
                                ? 'bg-white shadow-[0_0_8px_#FFFFFF]'
                                : 'bg-zinc-700'
                            }`}
                          />
                        </div>
                        <div className="text-sm font-semibold text-white leading-snug">
                          {value}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {shortDesc}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-white/30 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100"
                >
                  {errorMessage}
                </div>
              )}

              {/* GENERATE BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <p className="text-xs text-zinc-400">
                  Generates 3 academic titles, a 150–200 word abstract, 5
                  keywords, 3 objectives, and 3 future enhancements.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base text-black bg-white shadow-[0_0_28px_rgba(255,255,255,0.22)] hover:bg-zinc-200 hover:shadow-[0_0_38px_rgba(255,255,255,0.34)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Sparkles className="w-4 h-4 text-black" aria-hidden="true" />
                  <span>✦ Generate Research Content</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
