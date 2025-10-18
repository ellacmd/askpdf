export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PDFData {
  text: string;
  pages: number;
  fileName: string;
}

