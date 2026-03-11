import { supabase } from '@/lib/supabaseClient';
import type { ExtractedProfile, ProfileData, EducationEntry, ExperienceEntry, ProjectEntry, LanguageEntry } from '@/types/profile';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Upload a resume file to Supabase Storage
 */
export async function uploadResume(file: File, userId: string): Promise<{ path: string; url: string }> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const filePath = `${userId}/resume.${ext}`;

    // Remove old resume if exists
    await supabase.storage.from('resumes').remove([filePath]);

    const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Update profile with resume info
    await supabase
        .from('profiles')
        .update({ resume_url: filePath, resume_uploaded_at: new Date().toISOString() })
        .eq('id', userId);

    return { path: filePath, url: `${SUPABASE_URL}/storage/v1/object/resumes/${filePath}` };
}

/**
 * Upload a resume file for a specific candidate profile variant
 */
export async function uploadVariantResume(file: File, userId: string): Promise<{ path: string; url: string }> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const uniqueId = Date.now().toString();
    const filePath = `${userId}/variant_${uniqueId}.${ext}`;

    const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    return { path: filePath, url: `${SUPABASE_URL}/storage/v1/object/resumes/${filePath}` };
}

/**
 * Call the parse-resume edge function
 */
export async function parseResume(filePath: string): Promise<ExtractedProfile> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('parse-resume', {
        body: { filePath },
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
    });

    if (error) {
        let errStr = error.message;
        if (error.context && typeof error.context.json === 'function') {
            const errBody = await error.context.json().catch(() => null);
            if (errBody) errStr += JSON.stringify(errBody);
        }
        throw new Error(`Parse failed (${errStr})`);
    }

    if (!data || !data.success) {
        throw new Error(data?.error || 'Parse failed (unknown format)');
    }

    return data.data as ExtractedProfile;
}

/**
 * Load full profile data from all related tables
 */
export async function loadFullProfile(userId: string): Promise<ProfileData | null> {
    const [
        { data: profile },
        { data: education },
        { data: experience },
        { data: certifications },
        { data: projects },
        { data: languages },
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('candidate_education').select('*').eq('profile_id', userId).order('created_at'),
        supabase.from('candidate_experience').select('*').eq('profile_id', userId).order('created_at'),
        supabase.from('candidate_certifications').select('*').eq('profile_id', userId).order('created_at'),
        supabase.from('candidate_projects').select('*').eq('profile_id', userId).order('created_at'),
        supabase.from('candidate_languages').select('*').eq('profile_id', userId).order('created_at'),
    ]);

    if (!profile) return null;

    return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        summary: profile.summary,
        skills: profile.skills || [],
        resume_url: profile.resume_url,
        resume_uploaded_at: profile.resume_uploaded_at,
        education: (education || []).map((e: any) => ({ id: e.id, degree: e.degree, institution: e.institution, year: e.year || '' })),
        experience: (experience || []).map((e: any) => ({ id: e.id, title: e.title, company: e.company, duration: e.duration || '', description: e.description || '' })),
        certifications: (certifications || []).map((c: any) => ({ name: c.name, issuer: c.issuer || '' })),
        projects: (projects || []).map((p: any) => ({ id: p.id, name: p.name, description: p.description || '', technologies: p.technologies || [], url: p.url || '', duration: p.duration || '' })),
        languages: (languages || []).map((l: any) => ({ id: l.id, language: l.language, proficiency: l.proficiency || '' })),
    };
}

/**
 * Save profile data to all related tables (upsert strategy)
 */
export async function saveProfileData(userId: string, data: Partial<ExtractedProfile>): Promise<void> {
    // 1. Update main profile
    const profileUpdate: Record<string, any> = {};
    if (data.name !== undefined) profileUpdate.full_name = data.name;
    if (data.email !== undefined) profileUpdate.email = data.email;
    if (data.phone !== undefined) profileUpdate.phone = data.phone;
    if (data.location !== undefined) profileUpdate.location = data.location;
    if (data.summary !== undefined) profileUpdate.summary = data.summary;
    if (data.skills !== undefined) profileUpdate.skills = data.skills;
    profileUpdate.updated_at = new Date().toISOString();

    if (Object.keys(profileUpdate).length > 1) {
        const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);
        if (error) throw new Error(`Profile update failed: ${error.message}`);
    }

    // 2. Replace education entries
    if (data.education && data.education.length > 0) {
        await supabase.from('candidate_education').delete().eq('profile_id', userId);
        const { error } = await supabase.from('candidate_education').insert(
            data.education.map(e => ({ profile_id: userId, degree: e.degree, institution: e.institution, year: e.year }))
        );
        if (error) throw new Error(`Education save failed: ${error.message}`);
    }

    // 3. Replace experience entries
    if (data.experience && data.experience.length > 0) {
        await supabase.from('candidate_experience').delete().eq('profile_id', userId);
        const { error } = await supabase.from('candidate_experience').insert(
            data.experience.map(e => ({ profile_id: userId, title: e.title, company: e.company, duration: e.duration, description: e.description }))
        );
        if (error) throw new Error(`Experience save failed: ${error.message}`);
    }

    // 4. Replace certifications
    if (data.certifications && data.certifications.length > 0) {
        await supabase.from('candidate_certifications').delete().eq('profile_id', userId);
        const { error } = await supabase.from('candidate_certifications').insert(
            data.certifications.map(c => ({ profile_id: userId, name: c.name, issuer: c.issuer }))
        );
        if (error) throw new Error(`Certifications save failed: ${error.message}`);
    }

    // 5. Replace projects
    if (data.projects && data.projects.length > 0) {
        await supabase.from('candidate_projects').delete().eq('profile_id', userId);
        const { error } = await supabase.from('candidate_projects').insert(
            data.projects.map(p => ({ profile_id: userId, name: p.name, description: p.description, technologies: p.technologies, url: p.url, duration: p.duration }))
        );
        if (error) throw new Error(`Projects save failed: ${error.message}`);
    }

    // 6. Replace languages
    if (data.languages && data.languages.length > 0) {
        await supabase.from('candidate_languages').delete().eq('profile_id', userId);
        const { error } = await supabase.from('candidate_languages').insert(
            data.languages.map(l => ({ profile_id: userId, language: l.language, proficiency: l.proficiency }))
        );
    }
}

/**
 * Generate a signed URL for downloading a resume
 */
export async function downloadResume(path: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, 3600, { download: true });

    if (error) throw new Error(`Download failed: ${error.message}`);
    return data.signedUrl;
}
