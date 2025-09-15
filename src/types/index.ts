export interface Person {
  id: number | string;
  name: string;
  gender: 'male' | 'female';
  imageUrl?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Couple {
  id: number | string;
  husbandId: number | string;
  wifeId: number | string;
  childrenIds: number[];
  created_at?: string;
  updated_at?: string;
}

export type MessageType = 'success' | 'error';

export interface Message {
  text: string;
  type: MessageType;
}