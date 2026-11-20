export type ResearchDomain =
  | 'Artificial Intelligence (AI)'
  | 'Internet of Things (IoT)'
  | 'Web Development'
  | 'Cybersecurity'
  | 'Other';

export interface FutureEnhancement {
  title: string;
  description: string;
  impactArea: string;
}

export interface ResearchPaperData {
  titles: string[];
  abstract: string;
  keywords: string[];
  objectives: string[];
  futureEnhancements: FutureEnhancement[];
  domain: ResearchDomain;
  idea: string;
  generatedAt: string;
}

export interface GenerateResearchRequest {
  idea: string;
  domain: ResearchDomain;
}

export interface RegenerateAbstractRequest {
  idea: string;
  domain: ResearchDomain;
  selectedTitle: string;
  previousAbstract: string;
}
