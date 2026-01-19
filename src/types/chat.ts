export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: number;
  type?: 'user' | 'system';
}

export interface MessageGroup {
  sender: string;
  isMe: boolean;
  timestamp: number;
  messages: Message[];
}

export interface ChatMessageResponse {
  id: number;
  name: string;
  message: string;
  timestamp: number;
}
