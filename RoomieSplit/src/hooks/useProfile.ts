import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAvatarUrl } from '../services/avatarService';
import type { Profile } from '../types/Profile';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, nickname, phone, payment_method, avatar_path, created_at')
        .eq('id', userId)
        .single();
      setProfile((data as Profile) ?? null);
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    name: profile?.name ?? null,
    avatarUrl: getAvatarUrl(profile?.avatar_path ?? null),
  };
}