import { MouseEvent, ReactNode, useRef } from 'react';
import {
  BookOpen,
  CheckSquare,
  FileDown,
  FlaskConical,
  Rocket,
  Tags,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TiltCardProps {
  children: ReactNode;
  delay?: number;
}

function TiltCard({ children, delay = 0 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
    glow.style.opacity = '1';
    glow.style.background = `radial-gradient(280px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255, 255, 255, 0.12), transparent 70%)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      className="lab-panel-interactive rounded-2xl p-6 relative overflow-hidden"
    >
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const FEATURES = [
  {
    title: 'Academic Title Synthesis',
    description:
      'Produces three distinct, peer-review ready research titles tailored to your methodology and selected academic domain.',
    Icon: BookOpen,
  },
  {
    title: 'Structured Abstract Authoring',
    description:
      'Writes a cohesive 150–200 word abstract covering background, problem statement, methodology, outcomes, and significance.',
    Icon: FlaskConical,
  },
  {
    title: 'Precision Keyword Indexing',
    description:
      'Extracts five high-signal technical keywords formatted for IEEE, ACM, and university thesis repository indexing.',
    Icon: Tags,
  },
  {
    title: 'Action-Verb Research Objectives',
    description:
      'Structures three measurable research objectives anchored with rigorous academic verbs like develop, analyze, and evaluate.',
    Icon: CheckSquare,
  },
  {
    title: 'Future Enhancement Roadmaps',
    description:
      'Outlines three realistic technical expansions so students and researchers can articulate clear next-phase impact.',
    Icon: Rocket,
  },
  {
    title: 'Instant Editing, PDF & TXT Export',
    description:
      'Refine any generated section inline, regenerate abstracts on demand, and export formatted PDF or TXT briefs in one click.',
    Icon: FileDown,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"
    >
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-mono tracking-widest text-zinc-300 mb-2">
          LABORATORY CAPABILITIES
        </p>
        <h2
          className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Engineered for Academic Precision
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
          Every stage of your initial research blueprint is structured for
          university reports, capstone proposals, and conference submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.Icon;
          return (
            <TiltCard key={feat.title} delay={idx * 0.05}>
              <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
