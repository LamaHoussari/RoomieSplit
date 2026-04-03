export type AppUser = {
    id: string;
    email: string | null;
    name: string | null;
    isAdmin: boolean;
    authSource: 'supabase' | 'local-admin';
}
