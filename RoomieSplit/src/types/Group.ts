export interface Group {
  id: number;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
}

export interface NewGroup {
  name: string;
  code: string;
  created_by: string;
}