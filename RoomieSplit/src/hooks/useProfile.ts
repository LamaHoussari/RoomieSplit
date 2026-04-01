import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // adjust path if needed

export function useProfile(userId: string) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
      .then(({ data }) => setName(data?.name ?? null));
  }, [userId]);

  return { name };
}