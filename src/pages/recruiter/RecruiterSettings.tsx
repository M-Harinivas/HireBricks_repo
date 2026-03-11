import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { apiService } from '@/lib/apiService';

const RecruiterSettings = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'company' | 'profile' | 'notifications'>('company');
  const defaultNotifs = { newApplication: true, evaluationComplete: true, offerResponse: true, interviewComplete: true, weeklyDigest: false };
  const [notifSettings, setNotifSettings] = useState((profile as any)?.notification_preferences || defaultNotifs);

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    name: (profile as any)?.organizations?.name || '',
    industry: (profile as any)?.organizations?.industry || '',
    size: (profile as any)?.organizations?.size || '',
    website: (profile as any)?.organizations?.website || ''
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setCompanyForm({
        name: (profile as any)?.organizations?.name || '',
        industry: (profile as any)?.organizations?.industry || '',
        size: (profile as any)?.organizations?.size || '',
        website: (profile as any)?.organizations?.website || ''
      });
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
      if ((profile as any)?.notification_preferences) {
        setNotifSettings((profile as any).notification_preferences);
      }
    }
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.organization_id) return;

    try {
      setIsUploading(true);
      const parts = file.name.split('.');
      const fileExt = parts.length > 1 ? parts.pop() : 'png';
      const fileName = `${profile.organization_id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // bucket is company_logos

      const { error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company_logos')
        .getPublicUrl(filePath);

      await apiService.updateOrganization(profile.organization_id, { logo_url: publicUrl });

      toast.success('Logo uploaded successfully!');
      setTimeout(() => window.location.reload(), 1000); // Reload to reflect the updated profile
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    try {
      setIsUploadingAvatar(true);
      const parts = file.name.split('.');
      const fileExt = parts.length > 1 ? parts.pop() : 'png';
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await apiService.updateProfile(profile.id, { avatar_url: publicUrl });

      toast.success('Avatar uploaded successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!profile?.organization_id) return;
    try {
      setIsSavingCompany(true);
      await apiService.updateOrganization(profile.organization_id, companyForm);
      toast.success('Company settings saved!');
    } catch (error: any) {
      console.error('Save company error:', error);
      toast.error(error.message || 'Failed to save company settings');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    try {
      setIsSavingProfile(true);
      await apiService.updateProfile(profile.id, profileForm);
      toast.success('Profile saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!profile?.id) return;
    try {
      setIsSavingNotifs(true);
      await apiService.updateProfile(profile.id, { notification_preferences: notifSettings });
      toast.success('Notification settings saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save notifications');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  return (
    <div className="page-container space-y-4">
      <h1 className="text-page-title">Settings</h1>
      <div className="flex gap-0.5 bg-muted p-0.5 rounded-md w-fit">
        {(['company', 'profile', 'notifications'] as const).map(t =>
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t === 'company' ? 'Company Profile' : t === 'profile' ? 'My Profile' : 'Notifications'}</button>
        )}
      </div>

      {tab === 'company' && (
        <div className="glass-card p-5 space-y-3 max-w-xl">
          <div>
            <label className="text-sm font-medium block mb-1.5">Company Name</label>
            <input
              value={companyForm.name}
              onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Industry</label>
              <input
                value={companyForm.industry}
                onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Company Size</label>
              <input
                value={companyForm.size}
                onChange={e => setCompanyForm({ ...companyForm, size: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Website</label>
            <input
              value={companyForm.website}
              onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Logo</label>
            <div
              className="group relative border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/[0.02] transition-all duration-300 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleLogoUpload} disabled={isUploading} />

              {isUploading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Uploading Logo...</p>
                </div>
              ) : (profile as any)?.organizations?.logo_url ? (
                <div className="relative group/logo py-4">
                  <div className="w-32 h-32 mx-auto bg-white rounded-xl shadow-sm border border-border flex items-center justify-center p-4 transition-transform group-hover:scale-[1.02]">
                    <img
                      src={(profile as any).organizations.logo_url}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-accent">Click to change logo</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Supports: PNG, JPG, SVG, WebP</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <Upload size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Drop logo here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1 underline">Supports: PNG, JPG, JPEG, SVG, WebP</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSaveCompany}
            disabled={isSavingCompany}
            className="gradient-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            {isSavingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
            {isSavingCompany ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'profile' && (
        <div className="glass-card p-5 space-y-3 max-w-xl">
          <div>
            <label className="text-sm font-medium block mb-1.5">Full Name</label>
            <input
              value={profileForm.full_name}
              onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Phone</label>
            <input
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Avatar</label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors relative"
              onClick={() => avatarInputRef.current?.click()}
            >
              <input type="file" ref={avatarInputRef} className="hidden" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              {isUploadingAvatar ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading avatar...</p>
                </div>
              ) : profile?.avatar_url ? (
                <div className="flex flex-col items-center justify-center">
                  <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-border" />
                  <p className="text-sm text-accent font-medium">Change avatar</p>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload avatar</p>
                  <p className="text-xs text-muted-foreground mt-1 underline">Supports: PNG, JPG, JPEG, SVG, WebP</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="gradient-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-card p-5 space-y-3 max-w-xl">
          {Object.entries(notifSettings).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <button onClick={() => setNotifSettings({ ...notifSettings, [key]: !val })} className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-accent' : 'bg-muted'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform ${val ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
          <button
            onClick={handleSaveNotifications}
            disabled={isSavingNotifs}
            className="gradient-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
            {isSavingNotifs ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecruiterSettings;
