import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FeaturesSection } from './components/FeaturesSection';
import { GeneratorSection } from './components/GeneratorSection';
import { HeroSection } from './components/HeroSection';
import { MouseSpotlight } from './components/MouseSpotlight';
import { Navbar } from './components/Navbar';
import { ResultsSection } from './components/ResultsSection';
import { ThreeBackground } from './components/three/ThreeBackground';
import { ResearchDomain, ResearchPaperData } from './types/research';

export default function App() {
  const [idea, setIdea] = useState('');
  const [domain, setDomain] = useState<ResearchDomain>('Artificial Intelligence (AI)');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingAbstract, setIsRegeneratingAbstract] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<ResearchPaperData | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleIdeaChange = (value: string) => {
    setIdea(value);
    if (validationError && value.trim().length >= 15) {
      setValidationError(null);
    }
  };

  const handleGenerate = async () => {
    const trimmed = idea.trim();
    if (!trimmed) {
      setValidationError('Please describe your project idea before generating.');
      return;
    }
    if (trimmed.length < 15) {
      setValidationError(
        'Please enter at least 15 characters so the AI can understand your research scope.'
      );
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/research/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: trimmed, domain }),
        signal: controller.signal,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to generate research content.');
      }

      const generated: ResearchPaperData = {
        titles: payload.titles,
        abstract: payload.abstract,
        keywords: payload.keywords,
        objectives: payload.objectives,
        futureEnhancements: payload.futureEnhancements,
        domain: payload.domain,
        idea: payload.idea,
        generatedAt: payload.generatedAt,
      };

      setResearchData(generated);
      setSelectedTitleIndex(0);
      notify('Research blueprint generated.');

      window.setTimeout(() => {
        scrollToSection('results');
      }, 120);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage(
          'The request took longer than expected. Please try again.'
        );
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while generating research content.';
        setErrorMessage(msg);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleRegenerateAbstract = async () => {
    if (!researchData) return;
    setIsRegeneratingAbstract(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 24000);
    try {
      const selectedTitle =
        researchData.titles[selectedTitleIndex] || researchData.titles[0] || '';
      const response = await fetch('/api/research/regenerate-abstract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: researchData.idea,
          domain: researchData.domain,
          selectedTitle,
          previousAbstract: researchData.abstract,
        }),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to regenerate abstract.');
      }
      setResearchData({
        ...researchData,
        abstract: payload.abstract,
      });
      notify('Abstract regenerated.');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        notify('Abstract regeneration timed out. Please try again.');
      } else {
        const msg =
          err instanceof Error ? err.message : 'Unable to regenerate abstract.';
        notify(msg);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsRegeneratingAbstract(false);
    }
  };

  const handleClearInput = () => {
    setIdea('');
    setValidationError(null);
    setErrorMessage(null);
  };

  const handleClearAll = () => {
    setIdea('');
    setDomain('Artificial Intelligence (AI)');
    setResearchData(null);
    setSelectedTitleIndex(0);
    setValidationError(null);
    setErrorMessage(null);
    notify('All inputs and generated results cleared.');
    scrollToSection('generator');
  };

  const handleNewResearch = () => {
    setIdea('');
    setResearchData(null);
    setSelectedTitleIndex(0);
    setValidationError(null);
    setErrorMessage(null);
    scrollToSection('generator');
  };

  return (
    <div className="min-h-screen bg-[#120624] text-white relative">
      {/* Real 3D Animated Laboratory Background */}
      <ThreeBackground />

      {/* Subtle Mouse-Following Light */}
      <MouseSpotlight />

      {/* Top Navigation */}
      <Navbar hasResults={Boolean(researchData)} onScrollTo={scrollToSection} />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection
          onStartGenerating={() => scrollToSection('generator')}
          onExploreFeatures={() => scrollToSection('features')}
        />

        <GeneratorSection
          idea={idea}
          onIdeaChange={handleIdeaChange}
          domain={domain}
          onDomainChange={setDomain}
          isLoading={isLoading}
          errorMessage={errorMessage}
          validationError={validationError}
          onClear={handleClearInput}
          onGenerate={handleGenerate}
        />

        <AnimatePresence mode="wait">
          {researchData && (
            <ResultsSection
              key={researchData.generatedAt}
              data={researchData}
              selectedTitleIndex={selectedTitleIndex}
              onSelectTitle={setSelectedTitleIndex}
              onUpdateData={setResearchData}
              onRegenerateAbstract={handleRegenerateAbstract}
              isRegeneratingAbstract={isRegeneratingAbstract}
              onRegenerateAll={handleGenerate}
              onClearAll={handleClearAll}
              onNewResearch={handleNewResearch}
              onNotify={notify}
            />
          )}
        </AnimatePresence>

        <FeaturesSection />
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 border-t border-white/15 bg-[#120624]/90 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400">
          <span className="font-display font-semibold text-white">
            AI Research Studio
          </span>
          <span>
            Structured academic titles, abstracts, keywords, objectives &amp;
            future roadmaps.
          </span>
        </div>
      </footer>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-950 border border-white/35 shadow-[0_12px_32px_rgba(0,0,0,0.75)] text-sm text-white"
          >
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
