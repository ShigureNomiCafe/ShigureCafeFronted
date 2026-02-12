export interface SystemLog {
  id: number;
  timestamp: number;
  level: string;
  source: string;
  content: string;
}

export interface PagedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
