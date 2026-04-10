export interface Profile {
  id: string;
  name: string;
  email: string | null;
  nickname: string | null;
  phone: string | null;
  payment_method: string | null;
  avatar_path: string | null;
  created_at: string;
  is_active?: boolean;
}
