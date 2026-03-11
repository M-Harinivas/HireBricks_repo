import { useState, useCallback, useEffect } from 'react';
import { Upload, Check, Save, FileText, X, Plus, Trash2, Sparkles, AlertCircle, Loader2, ExternalLink, Globe, FolderGit2, User, Briefcase, GraduationCap, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { uploadResume, uploadVariantResume, parseResume, loadFullProfile, saveProfileData, downloadResume } from '@/services/resumeService';
import { apiService } from '@/lib/apiService';
import type { CandidateProfileVariant } from '@/types/profile';
import type { ExtractedProfile, EducationEntry, ExperienceEntry, ProjectEntry, LanguageEntry, CertificationEntry } from '@/types/profile';

type ViewMode = 'loading' | 'profile' | 'parsing' | 'verification';

const parseSteps = [
  { label: 'Uploading file...', key: 'upload' },
  { label: 'Extracting text...', key: 'extract' },
  { label: 'Identifying sections...', key: 'sections' },
  { label: 'Matching fields...', key: 'match' },
  { label: 'Complete!', key: 'done' },
];

const CandidateProfilePage = () => {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Main state
  const [mode, setMode] = useState<ViewMode>('loading');
  const [parseStep, setParseStep] = useState(0);

  // Profile form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasWarnedMissing, setHasWarnedMissing] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Track which fields were auto-populated from resume
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set());

  // Variants state
  const [variants, setVariants] = useState<CandidateProfileVariant[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('main');
  const [originalMainData, setOriginalMainData] = useState<any>(null);

  // Load existing profile on mount
  useEffect(() => {
    if (!userId) return;
    Promise.all([
      loadFullProfile(userId),
      apiService.getCandidateProfiles(userId)
    ]).then(([data, variantsData]) => {
      if (data) {
        setOriginalMainData(data);
        if (activeProfileId === 'main') {
          setName(data.full_name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setSummary(data.summary || '');
          setSkills(data.skills || []);
          setEducation(data.education || []);
          setExperience(data.experience || []);
          setCertifications(data.certifications || []);
          setProjects(data.projects || []);
          setLanguages(data.languages || []);
          setResumeUrl(data.resume_url);
        }
      }
      if (variantsData) {
        setVariants(variantsData);
      }
      setMode('profile');
    }).catch(() => setMode('profile'));
  }, [userId]);

  // Handle switching profiles
  const handleSwitchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    if (profileId === 'main') {
      if (originalMainData) {
        setSummary(originalMainData.summary || '');
        setSkills(originalMainData.skills || []);
        setEducation(originalMainData.education || []);
        setExperience(originalMainData.experience || []);
        setCertifications(originalMainData.certifications || []);
        setProjects(originalMainData.projects || []);
        setLanguages(originalMainData.languages || []);
        setResumeUrl(originalMainData.resume_url);
      } else {
        setSummary(''); setSkills([]); setEducation([]); setExperience([]); setCertifications([]); setProjects([]); setLanguages([]); setResumeUrl(null);
      }
    } else {
      const v = variants.find(x => x.id === profileId);
      if (v) {
        setSummary(v.summary || '');
        setSkills(v.skills || []);
        setEducation(v.education || []);
        setExperience(v.experience || []);
        setCertifications(v.certifications || []);
        setProjects(v.projects || []);
        setLanguages(v.languages || []);
        setResumeUrl(v.resume_url);
      }
    }
  };

  const createNewVariant = async () => {
    if (variants.length >= 3) {
      toast.error('You can only have up to 3 specialized profiles.');
      return;
    }
    const newVariantName = prompt('Enter a name for this profile (e.g. Frontend Developer):');
    if (!newVariantName) return;

    setSaving(true);
    try {
      const data = await apiService.saveCandidateProfile({
        candidate_id: userId,
        profile_name: newVariantName,
        summary: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: []
      });
      setVariants([...variants, data]);
      handleSwitchProfile(data.id);
      toast.success('New profile created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const deleteCurrentVariant = async () => {
    if (activeProfileId === 'main') return;
    if (!confirm('Are you sure you want to delete this profile?')) return;
    setSaving(true);
    try {
      await apiService.deleteCandidateProfile(activeProfileId);
      setVariants(variants.filter(v => v.id !== activeProfileId));
      handleSwitchProfile('main');
      toast.success('Profile deleted');
    } catch (err: any) {
      toast.error('Failed to delete profile');
    } finally {
      setSaving(false);
    }
  };


  // Resume upload + parse
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !userId) return;

    // Validate
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      toast.error('Only PDF, DOC, and DOCX files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setMode('parsing');
    setParseStep(0);

    try {
      // Step 1: Upload
      setParseStep(0);
      let path;
      if (activeProfileId === 'main') {
        const res = await uploadResume(file, userId);
        path = res.path;
      } else {
        const res = await uploadVariantResume(file, userId);
        path = res.path;
      }
      setResumeUrl(path);

      // Step 2: Extract text (calling edge function)
      setParseStep(1);
      await new Promise(r => setTimeout(r, 300)); // Brief pause for UX
      setParseStep(2);

      // Step 3-4: Parse sections + Match fields
      const extracted = await parseResume(path);
      setParseStep(3);
      await new Promise(r => setTimeout(r, 300));

      // Populate fields from extracted data
      const newExtracted = new Set<string>();

      if (extracted.name) { setName(extracted.name); newExtracted.add('name'); }
      if (extracted.email) { setEmail(extracted.email.toLowerCase()); newExtracted.add('email'); }
      if (extracted.phone) { setPhone(extracted.phone); newExtracted.add('phone'); }
      if (extracted.location) { setLocation(extracted.location); newExtracted.add('location'); }
      if (extracted.summary) { setSummary(extracted.summary); newExtracted.add('summary'); }
      if (extracted.skills?.length) { setSkills(extracted.skills); newExtracted.add('skills'); }
      if (extracted.education?.length) { setEducation(extracted.education); newExtracted.add('education'); }
      if (extracted.experience?.length) { setExperience(extracted.experience); newExtracted.add('experience'); }
      if (extracted.certifications?.length) { setCertifications(extracted.certifications); newExtracted.add('certifications'); }
      if (extracted.projects?.length) { setProjects(extracted.projects); newExtracted.add('projects'); }
      if (extracted.languages?.length) { setLanguages(extracted.languages); newExtracted.add('languages'); }

      setExtractedFields(newExtracted);
      setParseStep(4);

      await new Promise(r => setTimeout(r, 500));
      setMode('verification');
      toast.success(`Extracted ${newExtracted.size} sections from your resume!`);

    } catch (err: any) {
      console.error('Resume parse error:', err);
      toast.error('Resume saved, but auto-extraction failed. Please fill details manually.', { duration: 5000 });
      setMode('profile');
    }
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  // Save handler
  const handleSave = async () => {
    if (!userId) return;

    if (!name.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      toast.error('Name, Email, Phone, and City/State are mandatory.', { id: 'validation-error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.', { id: 'email-error' });
      return;
    }

    setSaving(true);
    try {
      if (activeProfileId === 'main') {
        await saveProfileData(userId, {
          name, email, phone, location, summary, skills,
          education, experience, certifications, projects, languages,
        });
        setOriginalMainData({ ...originalMainData, summary, skills, education, experience, certifications, projects, languages, resume_url: resumeUrl });
      } else {
        const v = variants.find(x => x.id === activeProfileId);
        if (v) {
          const updatedV = await apiService.saveCandidateProfile({
            id: v.id,
            candidate_id: userId,
            profile_name: v.profile_name,
            summary, skills, education, experience, projects, certifications, languages,
            resume_url: resumeUrl
          });
          setVariants(variants.map(x => x.id === v.id ? updatedV : x));
        }
        // Also save base info to main profile since it's global
        await saveProfileData(userId, { name, email, phone, location });
      }

      setExtractedFields(new Set());
      setMode('profile');
      setShowUploadZone(false);
      setHasWarnedMissing(false);
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Helpers
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));

  const addEducation = () => setEducation([...education, { degree: '', institution: '', year: '' }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, field: keyof EducationEntry, value: string) => {
    const updated = [...education];
    (updated[i] as any)[field] = value;
    setEducation(updated);
  };

  const addExperience = () => setExperience([...experience, { title: '', company: '', duration: '', description: '' }]);
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExperience = (i: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...experience];
    (updated[i] as any)[field] = value;
    setExperience(updated);
  };

  const addProject = () => setProjects([...projects, { name: '', description: '', technologies: [], url: '', duration: '' }]);
  const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
  const updateProject = (i: number, field: string, value: any) => {
    const updated = [...projects];
    (updated[i] as any)[field] = value;
    setProjects(updated);
  };

  const addLanguage = () => setLanguages([...languages, { language: '', proficiency: '' }]);
  const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));
  const updateLanguage = (i: number, field: keyof LanguageEntry, value: string) => {
    const updated = [...languages];
    (updated[i] as any)[field] = value;
    setLanguages(updated);
  };

  const addCertification = () => setCertifications([...certifications, { name: '', issuer: '' }]);
  const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));
  const updateCertification = (i: number, field: keyof CertificationEntry, value: string) => {
    const updated = [...certifications];
    updated[i] = { ...updated[i], [field]: value };
    setCertifications(updated);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resumeUrl) return;
    try {
      const url = await downloadResume(resumeUrl);
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error('Failed to access document');
    }
  };

  const SectionHeader = ({ title, field, onAdd, addLabel }: { title: string; field: string; onAdd?: () => void; addLabel?: string }) => (
    <div className="flex items-center justify-between">
      <h3 className="font-display font-bold text-xl flex items-center text-foreground">
        {title}
      </h3>
      {onAdd && (
        <button onClick={onAdd} className="text-xs font-bold text-background bg-foreground px-3 py-1.5 rounded-lg hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm">
          <Plus size={14} /> {addLabel || 'Add'}
        </button>
      )}
    </div>
  );

  const inputClass = "w-full px-4 py-3 rounded-xl border-none bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all";

  // Loading state
  if (mode === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  // Profile completeness
  const completenessFields = [
    { key: 'name', label: 'Name', filled: !!name.trim() },
    { key: 'email', label: 'Email', filled: !!email.trim() },
    { key: 'phone', label: 'Phone', filled: !!phone.trim() },
    { key: 'location', label: 'Location', filled: !!location.trim() },
    { key: 'summary', label: 'Summary', filled: !!summary.trim() },
    { key: 'skills', label: 'Skills', filled: skills.length > 0 },
    { key: 'experience', label: 'Experience', filled: experience.length > 0 },
    { key: 'education', label: 'Education', filled: education.length > 0 },
    { key: 'resume', label: 'Resume', filled: !!resumeUrl },
  ];
  const completedCount = completenessFields.filter(f => f.filled).length;
  const completenessPercent = Math.round((completedCount / completenessFields.length) * 100);
  const missingFields = completenessFields.filter(f => !f.filled);

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-page-title">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information, resume, and experience.</p>
      </div>


      {/* Profile Variants Selector */}
      <div className="bg-muted/5 border border-border/50 p-2 rounded-2xl flex flex-wrap gap-2 items-center mb-6">
        <button
          onClick={() => handleSwitchProfile('main')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeProfileId === 'main' ? 'bg-foreground text-background shadow-md' : 'bg-transparent text-muted-foreground hover:bg-muted/20'}`}
        >
          General Profile
        </button>
        {variants.map(v => (
          <button
            key={v.id}
            onClick={() => handleSwitchProfile(v.id)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeProfileId === v.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:bg-muted/20'}`}
          >
            {v.profile_name}
          </button>
        ))}
        {variants.length < 3 && (
          <button
            onClick={createNewVariant}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all flex items-center gap-2 border border-accent/20 ml-auto"
          >
            <Plus size={16} /> New Profile
          </button>
        )}
      </div>

      {activeProfileId !== 'main' && (
        <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary mb-6">
          <div>
            <h3 className="font-bold">Editing Specialized Profile</h3>
            <p className="text-xs opacity-80">This profile can be selected when applying to specific jobs.</p>
          </div>
          <button onClick={deleteCurrentVariant} className="flex items-center gap-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors">
            <Trash2 size={14} /> Delete Profile
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">


        {/* Left Column — Profile Card + Completeness */}
        <div className="w-full lg:w-52 shrink-0 lg:sticky lg:top-24 h-max z-10 space-y-3">
          <div className="glass-card p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-display font-bold mb-2">
              {name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
            </div>
            <h2 className="text-sm font-bold font-display text-foreground leading-tight">{name || 'Your Name'}</h2>
            <p className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate w-full">{email || 'your@email.com'}</p>
          </div>

          {/* Completeness Indicator */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Profile Strength</span>
              <span className={`text-xs font-bold ${completenessPercent >= 80 ? 'text-success' : completenessPercent >= 50 ? 'text-accent' : 'text-destructive'}`}>{completenessPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${completenessPercent >= 80 ? 'bg-success' : completenessPercent >= 50 ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${completenessPercent}%` }} />
            </div>
            {missingFields.length > 0 && (
              <div className="mt-2 space-y-1">
                {missingFields.slice(0, 3).map(f => (
                  <div key={f.key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <AlertCircle size={10} className="text-destructive shrink-0" />
                    <span>Add {f.label.toLowerCase()}</span>
                  </div>
                ))}
                {missingFields.length > 3 && <p className="text-[10px] text-muted-foreground">+{missingFields.length - 3} more</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right Dynamic Column (One Single Flowing View) */}
        <div className="flex-1 min-w-0 space-y-6 pb-10">

          {/* Parsing Progress */}
          <AnimatePresence>
            {mode === 'parsing' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-muted/5 border border-border/50 rounded-2xl p-6 shadow-sm overflow-hidden text-center">
                <Loader2 size={32} className="animate-spin text-accent mx-auto mb-4" />
                <h3 className="font-display font-bold mb-2">Analyzing Resume...</h3>
                <p className="text-sm text-muted-foreground font-medium">{parseSteps[parseStep]?.label}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Personal Information */}
              <div className="space-y-4">
                <SectionHeader title="Personal Information" field="name" />
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted/5 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground shadow-sm" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value.toLowerCase())} className="w-full px-3 py-2.5 rounded-xl bg-muted/5 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground shadow-sm lowercase" placeholder="your.email@example.com" required />
                    {!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && email.length > 0 && (
                      <p className="text-[10px] text-destructive mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={10} /> Please enter a valid email address
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Phone <span className="text-destructive">*</span>
                    </label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted/5 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground shadow-sm" placeholder="+1 234 567 8900" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      City / State <span className="text-destructive">*</span>
                    </label>
                    <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted/5 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground shadow-sm" placeholder="City, State" required />
                  </div>
                </div>
              </div>

              {/* Upload Resume (Compact) */}
              <div className="space-y-4 block">
                <SectionHeader title="Resume" field="resume" />

                {resumeUrl && !showUploadZone ? (
                  <div className="border border-border/50 rounded-2xl p-5 shadow-sm bg-muted/5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">Resume Attached</p>
                          <a href="#" onClick={handleDownload} className="text-xs font-medium text-accent hover:underline flex items-center gap-1 mt-0.5">
                            View Document <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setShowUploadZone(true)} className="w-full py-2 bg-background border border-border/50 rounded-xl text-xs font-bold text-foreground hover:bg-muted/50 transition-colors shadow-sm">
                      Upload New Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 shadow-sm flex flex-col items-center justify-center min-h-[160px] ${isDragActive ? 'border-accent bg-accent/5' : 'border-border/60 hover:border-accent/40 bg-muted/5 hover:bg-muted/10'}`}
                    >
                      <input {...getInputProps()} />
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border shadow-sm mb-3">
                        <Upload size={20} className="text-foreground" />
                      </div>
                      <p className="font-display font-bold text-sm text-foreground">
                        {isDragActive ? 'Drop resume here' : 'Upload recent resume'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-medium max-w-[200px] leading-relaxed">
                        PDF, DOC, DOCX up to 5MB. AI will auto-extract elements.
                      </p>
                    </div>
                    {resumeUrl && (
                      <button onClick={() => setShowUploadZone(false)} className="w-full py-2 bg-background border border-border/50 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                        Cancel Update
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-4">
              <SectionHeader title="Professional Summary" field="summary" />
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl bg-muted/5 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px] shadow-sm`}
                placeholder="A brief professional summary..."
              />
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Experience */}
          <div className="space-y-6">
            <SectionHeader title="Work Experience" field="experience" onAdd={addExperience} addLabel="Add Role" />
            {experience.length === 0 && <p className="text-sm text-muted-foreground italic font-medium">No work experience added</p>}
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-muted/5 rounded-2xl border border-border/50 space-y-4 relative group transition-colors hover:shadow-sm">
                  <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Job Title</label>
                      <input value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} className={inputClass} placeholder="e.g. Senior Developer" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Company</label>
                      <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className={inputClass} placeholder="e.g. Acme Corp" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Duration</label>
                    <input value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} className={`${inputClass} md:w-1/2`} placeholder="e.g. Jan 2020 - Present" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} className={`${inputClass} resize-none min-h-[100px]`} placeholder="Key responsibilities and achievements..." />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Education */}
          <div className="space-y-6">
            <SectionHeader title="Education" field="education" onAdd={addEducation} addLabel="Add Degree" />
            {education.length === 0 && <p className="text-sm text-muted-foreground italic font-medium">No education added</p>}
            <div className="space-y-4">
              {education.map((edu, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-muted/5 rounded-2xl border border-border/50 relative group transition-colors hover:shadow-sm">
                  <button onClick={() => removeEducation(i)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Degree</label>
                      <input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className={inputClass} placeholder="e.g. B.S. Computer Science" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Institution</label>
                      <input value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className={inputClass} placeholder="e.g. University Name" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Year</label>
                      <input value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} className={inputClass} placeholder="e.g. 2018 - 2022" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Projects */}
          <div className="space-y-6">
            <SectionHeader title="Projects" field="projects" onAdd={addProject} addLabel="Add Project" />
            {projects.length === 0 && <p className="text-sm text-muted-foreground italic font-medium">No projects added</p>}
            <div className="space-y-6">
              {projects.map((proj, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-muted/5 rounded-2xl border border-border/50 space-y-4 relative group transition-colors hover:shadow-sm">
                  <button onClick={() => removeProject(i)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Project Name</label>
                      <input value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} className={inputClass} placeholder="e.g. E-commerce API" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Duration / Year</label>
                      <input value={proj.duration} onChange={e => updateProject(i, 'duration', e.target.value)} className={inputClass} placeholder="e.g. 3 Months" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Project description..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Technologies</label>
                      <input
                        value={proj.technologies?.join(', ') || ''}
                        onChange={e => updateProject(i, 'technologies', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))}
                        className={inputClass}
                        placeholder="React, Node.js, Postgres"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">URL</label>
                      <div className="relative">
                        <input value={proj.url} onChange={e => updateProject(i, 'url', e.target.value)} className={`${inputClass} pr-10`} placeholder="https://" />
                        {proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent"><ExternalLink size={16} /></a>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Skills & Certs */}
          <div className="space-y-10">
            <div className="space-y-4">
              <SectionHeader title="Skills" field="skills" />
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs rounded-lg font-bold shadow-sm">
                    {s}
                    <button onClick={() => removeSkill(s)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && <span className="text-xs text-muted-foreground italic font-medium">No skills added yet</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  className={`${inputClass} flex-1 max-w-sm`}
                  placeholder="Add a skill"
                />
                <button onClick={addSkill} className="px-4 py-2.5 bg-background border border-border/50 text-foreground text-sm font-bold rounded-xl hover:bg-muted/50 btn-scale shadow-sm">Add</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <SectionHeader title="Certifications" field="certifications" onAdd={addCertification} />
                {certifications.length === 0 && <p className="text-sm text-muted-foreground italic font-medium">No certifications added</p>}
                <div className="space-y-4">
                  {certifications.map((cert, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-muted/5 rounded-2xl border border-border/50 space-y-3 relative group transition-colors shadow-sm">
                      <button onClick={() => removeCertification(i)} className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all">
                        <Trash2 size={14} />
                      </button>
                      <div className="pr-8 space-y-3">
                        <input value={cert.name} onChange={e => updateCertification(i, 'name', e.target.value)} className={inputClass} placeholder="Certification Name" />
                        <input value={cert.issuer} onChange={e => updateCertification(i, 'issuer', e.target.value)} className={inputClass} placeholder="Issuing Organization" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="Languages" field="languages" onAdd={addLanguage} />
                {languages.length === 0 && <p className="text-sm text-muted-foreground italic font-medium">No languages added</p>}
                <div className="space-y-4">
                  {languages.map((lang, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-muted/5 rounded-2xl border border-border/50 flex flex-col gap-3 relative group transition-colors shadow-sm">
                      <button onClick={() => removeLanguage(i)} className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all z-10">
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-3 pr-8">
                        <Globe size={16} className="text-muted-foreground shrink-0" />
                        <input type="text" value={lang.language || ''} onChange={e => updateLanguage(i, 'language', e.target.value)} className={`${inputClass} flex-1`} placeholder="Language" />
                      </div>
                      <select value={lang.proficiency || ''} onChange={e => updateLanguage(i, 'proficiency', e.target.value)} className={`${inputClass} ml-7 font-medium appearance-none`}>
                        <option value="">Select Proficiency</option>
                        <option value="Native">Native or Bilingual</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Global Save Action */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 p-3 z-40 transition-all flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-primary transition-all btn-scale shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Profile
        </button>
      </div>

    </div>
  );
};




export default CandidateProfilePage;
