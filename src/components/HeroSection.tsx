import { ArrowDownRight, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { HeroBrain3D } from './three/HeroBrain3D';

interface HeroSectionProps {
  onStartGenerating: () => void;
  onExploreFeatures: () => void;
}

export function HeroSection({
  onStartGenerating,
  onExploreFeatures,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <p className="text-xs sm:text-sm font-mono tracking-widest text-zinc-300">
            ✦ NEXT-GENERATION AI RESEARCH ASSISTANT
          </p>

          <h1
            className="font-display font-bold tracking-tight text-white leading-[1.08]"
            style={{
              fontSize: 'clamp(2.35rem, 4.8vw, 4.15rem)',
              textWrap: 'balance',
            }}
          >
            Turn Your Ideas Into{' '}
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(255,255,255,0.28)]">
              Research.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Transform your simple project ideas into professional research
            titles, abstracts, keywords, objectives, and future possibilities
            with AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onStartGenerating}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-black bg-white shadow-[0_0_28px_rgba(255,255,255,0.22)] hover:bg-zinc-200 hover:shadow-[0_0_38px_rgba(255,255,255,0.34)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Start Generating</span>
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onExploreFeatures}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white border border-white/25 bg-zinc-950/85 hover:border-white/60 hover:bg-zinc-900 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Compass className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Explore Features</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 font-mono">
            <span>3 Academic Titles</span>
            <span aria-hidden="true">·</span>
            <span>150–200 Word Abstract</span>
            <span aria-hidden="true">·</span>
            <span>5 Indexing Keywords</span>
            <span aria-hidden="true">·</span>
            <span>PDF &amp; TXT Export</span>
          </div>
        </motion.div>

        {/* Right Column: Interactive 3D Holographic AI Brain */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="lab-panel rounded-2xl p-3 sm:p-4 relative overflow-hidden">
            <HeroBrain3D />
            <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] font-mono text-zinc-400 border-t border-white/12">
              <span>Holographic Neural Core</span>
              <span>Drag to rotate</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
