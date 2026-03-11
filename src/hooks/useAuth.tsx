import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export type Role = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    phone: string | null;
    avatar_url: string | null;
    location: string | null;
    summary: string | null;
    skills: string[];
    organization_id: string | null;
}

interface AuthContextValue {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; profile?: Profile; error?: string }>;
    signup: (email: string, password: string, metadata: { full_name: string; role: Role; company?: string }) => Promise<{ success: boolean; error?: string }>;
    resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use ref to prevent double-initialization in Strict Mode
    const initialized = useRef(false);

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data as Profile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
            if (!mounted) return;

            if (currentSession?.user) {
                setUser(currentSession.user);
                setSession(currentSession);
                setIsAuthenticated(true);
                await fetchProfile(currentSession.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setSession(null);
                setIsAuthenticated(false);
            }

            if (isLoading) setIsLoading(false);
        };

        // Initialize session on mount
        const init = async () => {
            if (initialized.current) return;
            initialized.current = true;

            const { data: { session: initialSession } } = await supabase.auth.getSession();
            await handleAuthStateChange('INITIAL', initialSession);
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                handleAuthStateChange(event, newSession);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile, isLoading]);

    const login = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return { success: false, error: error.message };
        }

        // Explicitly fetch profile here to return it to the caller
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            return { success: false, error: 'Profile not found' };
        }

        return { success: true, profile: profileData as Profile };
    }, []);

    const signup = useCallback(async (email: string, password: string, metadata: { full_name: string; role: Role; company?: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
        if (error) {
            return { success: false, error: error.message };
        }

        // Return result
        return { success: true };
    }, []);

    const resetPasswordForEmail = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        // State cleanup is handled by onAuthStateChange
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, profile, session, isAuthenticated, isLoading, login, signup, resetPasswordForEmail, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
