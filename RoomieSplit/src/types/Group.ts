export interface Group {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
  description?: string | null;
  currency?: string;
}

export interface NewGroup {
  name: string;
  code: string;
  //created_by?: string; no longer really needed using RPC
  description?: string | null;
  currency?: string;
}