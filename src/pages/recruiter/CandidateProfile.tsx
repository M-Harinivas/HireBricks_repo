import { useParams, Link } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { Mail, Phone, MapPin, Award, Briefcase, GraduationCap, CheckCircle, XCircle, ArrowRight, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { downloadResume } from '@/services/resumeService';
import toast from 'react-hot-toast';

const CandidateProfile = () => {
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedApp = await apiService.getApplicationById(id);
        if (fetchedApp) setApplication(fetchedApp);
      } catch (err) {
        console.error("Error fetching application details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const updated = await apiService.updateApplicationStatus(application.id, newStatus);
      if (updated) {
        setApplication((prev: any) => ({ ...prev, status: newStatus }));
        toast.success(`Candidate marked as ${newStatus.replace(/_/g, ' ')}`);
      }
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }; const handleDownloadResume = async () => {
    const resumePath = application.profiles?.resume_url;
    if (!resumePath) {
      toast.error('No resume uploaded by candidate');
      return;
    }

    setIsLoading(true);
    try {
      const url = await downloadResume(resumePath);
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error('Failed to download resume');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-full py-20 min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-accent w-10 h-10" />
        <p className="text-muted-foreground animate-pulse">Loading candidate profile...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex justify-center flex-col items-center h-full py-20 min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold">Candidate Not Found</h2>
        <Link to="/recruiter/candidates" className="text-accent hover:underline flex items-center gap-1"><ArrowLeft size={16} /> Back to Candidates</Link>
      </div>
    );
  }

  const profile = application.profiles;
  const cp = application.candidate_profiles;

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-4">
            <Link to={`/recruiter/jobs/${application.job_id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> Back to Job</Link>
          </div>
          <div className="card-elevated p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-accent-foreground text-xl font-bold">{profile?.full_name?.[0] || 'U'}</div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{profile?.full_name || 'Candidate Name'}</h1>
                <p className="text-sm text-muted-foreground">
                  {cp?.profile_name || profile?.title || 'Candidate'} · {cp?.experience && typeof cp.experience === 'string' ? cp.experience : 'Profile'}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 break-all"><Mail size={12} className="flex-shrink-0" />{profile?.email || '-'}</span>
                  {profile?.phone && <span className="flex items-center gap-1"><Phone size={12} />{profile.phone}</span>}
                  <span className="flex items-center gap-1"><MapPin size={12} />{profile?.location || '-'}</span>
                </div>
              </div>
              <StatusBadge status={application.status} />
            </div>
          </div>

          {profile?.summary && (
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-3">Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.summary}</p>
            </div>
          )}

          {profile?.experience_history && (
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Briefcase size={16} /> Experience</h3>
              <div className="space-y-4">
                {(typeof profile.experience_history === 'string' ? JSON.parse(profile.experience_history) : profile.experience_history).map((w: any, i: number) => (
                  <div key={i} className="relative pl-6 border-l-2 border-accent/30 pb-4 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-accent" />
                    <h4 className="text-sm font-semibold">{w.title || w.role}</h4>
                    <p className="text-xs text-muted-foreground">{w.company} · {w.duration || `${w.startDate} - ${w.endDate}`}</p>
                    {w.description && <p className="text-sm text-muted-foreground mt-1">{w.description}</p>}
                    {w.achievements && Array.isArray(w.achievements) && w.achievements.map((a: string, j: number) => (
                      <p key={j} className="text-sm text-muted-foreground mt-1">- {a}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile?.education && (
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><GraduationCap size={16} /> Education</h3>
              {(typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education).map((e: any, i: number) => (
                <div key={i} className="mb-2 last:mb-0"><p className="text-sm font-medium">{e.degree}</p><p className="text-xs text-muted-foreground">{e.institution} · {e.year || e.graduationYear}</p></div>
              ))}
            </div>
          )}

          {profile?.skills && (
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">{(typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills).map((s: string) => <span key={s} className="px-3 py-1.5 bg-accent/10 text-accent text-xs rounded-full font-medium">{s}</span>)}</div>
            </div>
          )}

          {profile?.certifications && (
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Award size={16} /> Certifications</h3>
              <ul className="space-y-1">{(typeof profile.certifications === 'string' ? JSON.parse(profile.certifications) : profile.certifications).map((cert: any, i: number) => <li key={i} className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle size={14} className="text-success" />{typeof cert === 'string' ? cert : cert.name}</li>)}</ul>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="card-elevated p-6 sticky top-6">
            <h3 className="font-semibold mb-4 text-lg">Recruiter Actions</h3>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Update Pipeline Status</label>

              <div className="grid grid-cols-1 gap-2">
                <button disabled={application.status === 'APPLIED'} onClick={() => handleStatusChange('APPLIED')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${application.status === 'APPLIED' ? 'bg-muted border-border font-semibold' : 'border-border hover:bg-muted/50'}`}>
                  New Application
                </button>
                <button disabled={application.status === 'SHORTLISTED'} onClick={() => handleStatusChange('SHORTLISTED')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${application.status === 'SHORTLISTED' ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold' : 'border-border hover:bg-muted/50'}`}>
                  Shortlist
                </button>
                <button disabled={application.status === 'INTERVIEW_INVITED'} onClick={() => handleStatusChange('INTERVIEW_INVITED')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${application.status === 'INTERVIEW_INVITED' ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold' : 'border-border hover:bg-muted/50'}`}>
                  Invite to Interview
                </button>
                <button disabled={application.status === 'HIRED'} onClick={() => handleStatusChange('HIRED')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${application.status === 'HIRED' ? 'bg-success/10 border-success/30 text-success font-semibold' : 'border-border hover:bg-muted/50'}`}>
                  <CheckCircle size={16} className={application.status === 'HIRED' ? 'text-success' : 'text-muted-foreground'} /> Mark as Hired
                </button>
                <button disabled={application.status === 'REJECTED'} onClick={() => handleStatusChange('REJECTED')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${application.status === 'REJECTED' ? 'bg-destructive/10 border-destructive/30 text-destructive font-semibold' : 'border-border hover:bg-muted/50'}`}>
                  <XCircle size={16} className={application.status === 'REJECTED' ? 'text-destructive' : 'text-muted-foreground'} /> Reject
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Documents</label>
              <button
                onClick={handleDownloadResume}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
              >
                <FileText size={16} /> Download Resume
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <a href={`mailto:${profile?.email}?subject=Regarding your application for ${application.jobs?.title} at ${application.jobs?.organizations?.name}`} className="w-full bg-foreground text-background py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Mail size={16} /> Contact Candidate
              </a>
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">APPLICATION TIMELINE</h4>
              <div className="space-y-3">
                {[{ event: 'Applied', date: new Date(application.created_at).toLocaleDateString() }, { event: application.status.replace(/_/g, ' '), date: 'Current' }].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-muted-foreground">{t.event}</span><span className="ml-auto text-muted-foreground">{t.date}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
