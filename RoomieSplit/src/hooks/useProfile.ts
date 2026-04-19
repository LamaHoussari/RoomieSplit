import { useEffect, useState } from 'react';
import { getProfileById } from '../services/profileService';
import { getAvatarUrl } from '../services/avatarService';
import type { Profile } from '../types/Profile';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      const { data } = await getProfileById(userId);
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