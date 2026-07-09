export type ZoomLevel = 1 | 2 | 3 | 4 | 5;

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface EventPage {
  id: string;
  date: string;
  time?: string;
  endTime?: string;
  title: string;
  tags: string[];
  memo: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  important: boolean;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export type Density = 0 | 1 | 2 | 3 | 4;

export interface TagDef {
  name: string;
  color: string;
}
