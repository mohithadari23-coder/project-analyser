import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 22000,
    },
  });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function generateWithFallback<T>(
  runForModel: (
    model: string,
    useLowThinking: boolean,
    timeoutMs: number
  ) => Promise<T>
): Promise<T> {
  const candidates: Array<{
    model: string;
    useLowThinking: boolean;
    delayMs: number;
    timeoutMs: number;
  }> = [
    { model: 'gemini-3.1-flash-lite', useLowThinking: false, delayMs: 0, timeoutMs: 16000 },
    { model: 'gemini-3.1-flash-lite', useLowThinking: false, delayMs: 600, timeoutMs: 16000 },
    { model: 'gemini-3.1-flash-lite', useLowThinking: false, delayMs: 1200, timeoutMs: 16000 },
    { model: 'gemini-4-hydrogen', useLowThinking: true, delayMs: 400, timeoutMs: 10000 },
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    if (candidate.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, candidate.delayMs));
    }
    try {
      return await runForModel(
        candidate.model,
        candidate.useLowThinking,
        candidate.timeoutMs
      );
    } catch (err) {
      lastError = err;
      console.warn(
        `[Gemini] Attempt on ${candidate.model} failed:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/research/generate', async (req: Request, res: Response) => {
    try {
      const { idea, domain } = req.body as { idea?: string; domain?: string };

      if (!idea || typeof idea !== 'string' || idea.trim().length < 15) {
        res.status(400).json({
          error: 'Please provide a project idea of at least 15 characters.',
        });
        return;
      }

      if (!domain || typeof domain !== 'string') {
        res.status(400).json({
          error: 'Please select a research domain.',
        });
        return;
      }

      const ai = getGeminiClient();

      const systemInstruction = [
        'You are a senior academic research advisor and peer-reviewed journal editor.',
        'Transform the user project idea and selected domain into rigorous, publication-grade academic research material suitable for university theses, capstone reports, or IEEE/ACM conference papers.',
        'Rules:',
        '1. titles: Provide EXACTLY 3 distinct, authoritative academic research titles. Make each scientifically meaningful and crisp.',
        '2. abstract: Write ONE cohesive academic abstract strictly between 155 and 195 words. It must seamlessly cover: (a) research background, (b) problem statement, (c) proposed methodology, (d) expected outcomes, and (e) research significance. Write as a single well-structured academic paragraph without bullet points or section labels inside the text.',
        '3. keywords: Provide EXACTLY 5 high-precision academic indexing keywords or keyphrases.',
        '4. objectives: Provide EXACTLY 3 clear research objectives. Each objective MUST begin with an academic action verb such as "To develop", "To analyze", "To evaluate", "To investigate", or "To implement".',
        '5. futureEnhancements: Provide EXACTLY 3 realistic, technically grounded future enhancement proposals explaining how the project can be scaled or improved in subsequent research phases.',
      ].join('\n');

      const prompt = `Research Domain: ${domain}\nProject Idea: ${idea.trim()}`;

      const result = await generateWithFallback(
        async (model, useLowThinking, timeoutMs) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              abortSignal: controller.signal,
              systemInstruction,
              ...(useLowThinking
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  titles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly three academic research title options.',
                  },
                  abstract: {
                    type: Type.STRING,
                    description:
                      'A single cohesive academic abstract between 150 and 200 words covering background, problem statement, methodology, expected outcomes, and significance.',
                  },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly five relevant academic keywords.',
                  },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description:
                      'Exactly three clear research objectives, each starting with an action verb such as To develop, To analyze, To evaluate, To investigate, or To implement.',
                  },
                  futureEnhancements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        impactArea: { type: Type.STRING },
                      },
                      required: ['title', 'description', 'impactArea'],
                    },
                    description: 'Exactly three realistic future enhancement proposals.',
                  },
                },
                required: [
                  'titles',
                  'abstract',
                  'keywords',
                  'objectives',
                  'futureEnhancements',
                ],
              },
            },
          });

          const raw = (response.text ?? '').trim();
          if (!raw) {
            throw new Error('Empty response received from AI model.');
          }
          return JSON.parse(raw);
        } finally {
          clearTimeout(timeoutId);
        }
      });

      const abstractText = String(result.abstract ?? '').trim();
      const wordCount = countWords(abstractText);

      const titles = Array.isArray(result.titles) ? result.titles.slice(0, 3) : [];
      const keywords = Array.isArray(result.keywords) ? result.keywords.slice(0, 5) : [];
      const objectives = Array.isArray(result.objectives) ? result.objectives.slice(0, 3) : [];
      const futureEnhancements = Array.isArray(result.futureEnhancements)
        ? result.futureEnhancements.slice(0, 3)
        : [];

      if (titles.length === 0 || !abstractText) {
        throw new Error('Incomplete structured research output from AI.');
      }

      res.json({
        titles,
        abstract: abstractText,
        abstractWordCount: wordCount,
        keywords,
        objectives,
        futureEnhancements,
        domain,
        idea: idea.trim(),
        generatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate research content.';
      console.error('[POST /api/research/generate] Error:', message);
      res.status(503).json({
        error:
          'The AI service is temporarily experiencing high demand. Please click Generate again in a few seconds.',
      });
    }
  });

  app.post('/api/research/regenerate-abstract', async (req: Request, res: Response) => {
    try {
      const { idea, domain, selectedTitle, previousAbstract } = req.body as {
        idea?: string;
        domain?: string;
        selectedTitle?: string;
        previousAbstract?: string;
      };

      if (!idea || !domain) {
        res.status(400).json({ error: 'Missing research idea or domain.' });
        return;
      }

      const ai = getGeminiClient();

      const systemInstruction = [
        'You are a senior academic research editor.',
        'Write a fresh, alternative academic abstract strictly between 155 and 195 words.',
        'Do not repeat the phrasing of the previous abstract; offer an elevated scholarly perspective while preserving technical accuracy.',
        'The abstract must be one cohesive paragraph covering: background, problem statement, proposed methodology, expected outcomes, and research significance.',
      ].join('\n');

      const prompt = [
        `Domain: ${domain}`,
        `Selected Research Title: ${selectedTitle || 'Untitled Research'}`,
        `Project Idea: ${idea.trim()}`,
        previousAbstract ? `Previous Abstract to improve/vary:\n${previousAbstract}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const result = await generateWithFallback(
        async (model, useLowThinking, timeoutMs) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              abortSignal: controller.signal,
              systemInstruction,
              ...(useLowThinking
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  abstract: {
                    type: Type.STRING,
                    description: 'A fresh 150-200 word academic research abstract.',
                  },
                },
                required: ['abstract'],
              },
            },
          });

          const raw = (response.text ?? '').trim();
          if (!raw) {
            throw new Error('Empty abstract response received.');
          }
          return JSON.parse(raw);
        } finally {
          clearTimeout(timeoutId);
        }
      });

      const abstractText = String(result.abstract ?? '').trim();
      res.json({
        abstract: abstractText,
        abstractWordCount: countWords(abstractText),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to regenerate abstract.';
      console.error('[POST /api/research/regenerate-abstract] Error:', message);
      res.status(502).json({
        error: 'Unable to regenerate abstract right now. Please try again.',
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Research Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
