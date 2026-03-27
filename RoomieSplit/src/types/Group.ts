export interface Group {
  id: number;
  name: string;
  members: number;
  total: number;
  created: string;
  code: string;
  created_by: string;
}

export interface NewGroup {
  name: string;
  members: number;
  total: number;
  code: string;
  created_by: string;
}