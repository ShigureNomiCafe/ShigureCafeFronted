import { marked } from 'marked';

export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  // Since marked is globally configured in main.ts, we can just use it here
  return marked.parse(content) as string;
};
