// Types for resume parsing and profile management

export interface ExtractedProfile {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    linkedin?: string;
    skills: string[];
    education: EducationEntry[];
    experience: ExperienceEntry[];
    certifications: CertificationEntry[];
    projects: ProjectEntry[];
    languages: LanguageEntry[];
}

export interface CertificationEntry {
    name: string;
    issuer: string;
}

export interface EducationEntry {
    id?: string;
    degree: string;
    institution: string;
    year: string;
}

export interface ExperienceEntry {
    id?: string;
    title: string;
    company: string;
    duration: string;
    description: string;
}

export interface ProjectEntry {
    id?: string;
    name: string;
    description: string;
    technologies: string[];
    url: string;
    duration: string;
}

export interface LanguageEntry {
    id?: string;
    language: string;
    proficiency: string;
}

export interface ProfileData {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    location: string | null;
    summary: string | null;
    skills: string[];
    resume_url: string | null;
    resume_uploaded_at: string | null;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    certifications: CertificationEntry[];
    projects: ProjectEntry[];
    languages: LanguageEntry[];
}

export interface CandidateProfileVariant {
    id: string;
    candidate_id: string;
    profile_name: string;
    resume_url: string | null;
    summary: string | null;
    skills: string[];
    experience: ExperienceEntry[];
    education: EducationEntry[];
    projects: ProjectEntry[];
    certifications: CertificationEntry[];
    languages: LanguageEntry[];
    created_at?: string;
    updated_at?: string;
}
