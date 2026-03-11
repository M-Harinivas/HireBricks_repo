import re
import sys

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateProfilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { uploadResume, parseResume, loadFullProfile, saveProfileData } from '@/services/resumeService';",
    "import { uploadResume, uploadVariantResume, parseResume, loadFullProfile, saveProfileData } from '@/services/resumeService';\nimport { apiService } from '@/lib/apiService';\nimport type { CandidateProfileVariant } from '@/types/profile';"
)

# Add state for variants
state_str = """
  // Variants state
  const [variants, setVariants] = useState<CandidateProfileVariant[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('main');
  const [originalMainData, setOriginalMainData] = useState<any>(null);
"""
content = re.sub(r'(const \[extractedFields, setExtractedFields\].*?\n)', r'\1' + state_str, content)


# Modify useEffect to load variants and original data
use_effect_orig = """  useEffect(() => {
    if (!userId) return;
    loadFullProfile(userId).then(data => {
      if (data) {
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
      setMode('profile');
    }).catch(() => setMode('profile'));
  }, [userId]);"""

use_effect_new = """  useEffect(() => {
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
    } catch(err:any) {
      toast.error('Failed to delete profile');
    } finally {
      setSaving(false);
    }
  };
"""
content = content.replace(use_effect_orig, use_effect_new)

# Modify uploadResume based on activeProfileId
upload_orig = "const { path } = await uploadResume(file, userId);"
upload_new = """      let path;
      if (activeProfileId === 'main') {
        const res = await uploadResume(file, userId);
        path = res.path;
      } else {
        const res = await uploadVariantResume(file, userId);
        path = res.path;
      }"""
content = content.replace(upload_orig, upload_new)

# Modify handleSave
handle_save_orig = """    setSaving(true);
    try {
      await saveProfileData(userId, {
        name, email, phone, location, summary, skills,
        education, experience, certifications, projects, languages,
      });
      setExtractedFields(new Set());
      setMode('profile');
      setShowUploadZone(false);
      setHasWarnedMissing(false);
      toast.success('Profile saved successfully!');
    } catch (err: any) {"""

handle_save_new = """    setSaving(true);
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
    } catch (err: any) {"""
content = content.replace(handle_save_orig, handle_save_new)

# Add Profile Selector UI just before <div className="flex flex-col lg:flex-row gap-6">
ui_selector = """
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
"""
content = content.replace('<div className="flex flex-col lg:flex-row gap-6">', ui_selector)

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
