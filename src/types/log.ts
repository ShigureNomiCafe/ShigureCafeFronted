export interface SystemLog {
  id: number;
  timestamp: number;
  level: string;
  source: string;
  content: string;
}
