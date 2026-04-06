import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/Profile';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('id, name, email, nickname, phone, payment_method, avatar_path, created_at')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile((data as Profile) ?? null));
  }, [userId]);

  return {
    profile,
    name: profile?.name ?? null,
    avatarUrl: profile?.avatar_path ?? null,
  };
}