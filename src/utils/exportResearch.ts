import { jsPDF } from 'jspdf';
import { ResearchPaperData } from '../types/research';

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatResearchAsText(
  data: ResearchPaperData,
  selectedTitleIndex: number
): string {
  const chosenTitle = data.titles[selectedTitleIndex] || data.titles[0] || '';
  const formattedDate = new Date(data.generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [
    'AI RESEARCH STUDIO — GENERATED ACADEMIC RESEARCH BRIEF',
    '======================================================',
    `Selected Title: ${chosenTitle}`,
    `Research Domain: ${data.domain}`,
    `Generated Date: ${formattedDate}`,
    '',
    'ALL PROPOSED RESEARCH TITLES',
    '----------------------------',
    ...data.titles.map(
      (t, idx) => `${idx + 1}. ${t}${idx === selectedTitleIndex ? ' [Selected]' : ''}`
    ),
    '',
    `ABSTRACT (${countWords(data.abstract)} words)`,
    '------------------------------------------',
    data.abstract,
    '',
    'RESEARCH KEYWORDS',
    '-----------------',
    data.keywords.join(', '),
    '',
    'RESEARCH OBJECTIVES',
    '-------------------',
    ...data.objectives.map((obj, idx) => `${idx + 1}. ${obj}`),
    '',
    'FUTURE ENHANCEMENTS',
    '-------------------',
    ...data.futureEnhancements.map(
      (enh, idx) =>
        `${idx + 1}. ${enh.title} (${enh.impactArea})\n   ${enh.description}`
    ),
    '',
    'ORIGINAL PROJECT IDEA',
    '---------------------',
    data.idea,
  ];

  return lines.join('\n');
}

export function downloadResearchAsTxt(
  data: ResearchPaperData,
  selectedTitleIndex: number
): void {
  const content = formatResearchAsText(data, selectedTitleIndex);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = (data.titles[selectedTitleIndex] || 'research-paper')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  link.href = url;
  link.download = `${slug || 'ai-research-studio'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadResearchAsPdf(
  data: ResearchPaperData,
  selectedTitleIndex: number
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 52;
  const maxWidth = pageWidth - margin * 2;
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 54) {
      doc.addPage();
      y = 56;
    }
  };

  const writeSectionHeading = (label: string) => {
    ensureSpace(34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 15, 18);
    doc.text(label.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(212, 212, 216);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  const writeWrappedBody = (
    text: string,
    fontSize = 10.5,
    color: [number, number, number] = [30, 41, 59],
    lineHeight = 15.5,
    bold = false
  ) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of wrapped) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  const chosenTitle = data.titles[selectedTitleIndex] || data.titles[0] || 'Research Paper';
  const formattedDate = new Date(data.generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AI RESEARCH STUDIO  ·  ACADEMIC RESEARCH BRIEF', margin, y);
  y += 22;

  // Main Title
  writeWrappedBody(chosenTitle, 17, [15, 23, 42], 23, true);
  y += 6;

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Domain: ${data.domain}   |   Generated: ${formattedDate}`, margin, y);
  y += 26;

  // Alternative Titles
  writeSectionHeading('Proposed Research Title Options');
  data.titles.forEach((title, idx) => {
    const marker = idx === selectedTitleIndex ? ' (Selected)' : '';
    writeWrappedBody(`${idx + 1}. ${title}${marker}`, 10.5, [30, 41, 59], 15, idx === selectedTitleIndex);
    y += 4;
  });
  y += 10;

  // Abstract
  writeSectionHeading(`Abstract (${countWords(data.abstract)} words)`);
  writeWrappedBody(data.abstract, 10.5, [30, 41, 59], 16);
  y += 14;

  // Keywords
  writeSectionHeading('Research Keywords');
  writeWrappedBody(data.keywords.join('   ·   '), 10.5, [30, 41, 59], 16, true);
  y += 14;

  // Objectives
  writeSectionHeading('Research Objectives');
  data.objectives.forEach((obj, idx) => {
    writeWrappedBody(`${idx + 1}. ${obj}`, 10.5, [30, 41, 59], 15.5);
    y += 5;
  });
  y += 10;

  // Future Enhancements
  writeSectionHeading('Future Enhancements');
  data.futureEnhancements.forEach((enh, idx) => {
    writeWrappedBody(`${idx + 1}. ${enh.title} [${enh.impactArea}]`, 10.5, [15, 23, 42], 15.5, true);
    writeWrappedBody(enh.description, 10, [51, 65, 85], 14.5);
    y += 7;
  });

  const slug = chosenTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  doc.save(`${slug || 'ai-research-studio'}.pdf`);
}
