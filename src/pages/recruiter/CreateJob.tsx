import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const STEPS = ['Job Basics', 'Description & Compensation', 'Review & Publish'];

const CreateJob = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', domain: '', skills: '', preferredSkills: '', toolsTech: '', education: '', experience: '', location: '', workMode: 'Remote', vacancies: 1,
    description: '', salaryMin: '', salaryMax: '',
    weights: [20, 20, 20, 20, 20] as number[],
  });

  const updateWeight = (i: number, val: number) => {
    const w = [...form.weights];
    w[i] = val;
    setForm({ ...form, weights: w });
  };

  const handlePublish = async () => {
    if (!profile?.organization_id) {
      toast.error('You must belong to an organization to post a job.');
      return;
    }

    setIsSubmitting(true);

    const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    const preferredSkillsArray = form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean);
    const toolsTechArray = form.toolsTech.split(',').map(s => s.trim()).filter(Boolean);
    const minSal = parseFloat(form.salaryMin);
    const maxSal = parseFloat(form.salaryMax);

    const { error } = await supabase.from('jobs').insert({
      organization_id: profile.organization_id,
      created_by: profile.id,
      title: form.title,
      department: form.department,
      domain: form.domain,
      location: form.location,
      work_mode: form.workMode,
      salary_min: isNaN(minSal) ? null : minSal,
      salary_max: isNaN(maxSal) ? null : maxSal,
      description: form.description,
      skills: skillsArray,
      required_skills: skillsArray,
      preferred_skills: preferredSkillsArray,
      tools_tech: toolsTechArray,
      education_requirements: form.education,
      experience: form.experience,
      vacancies: form.vacancies,
      status: 'LIVE'
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to create job: ' + error.message);
    } else {
      toast.success('Job published successfully!');
      navigate('/recruiter/jobs');
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Create New Job</h1>

      {/* Step Progress */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'gradient-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`ml-2 text-xs font-medium hidden md:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <div className="card-elevated p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium block mb-1.5">Job Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., Senior Product Manager" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Department</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., Engineering" /></div>
              <div><label className="text-sm font-medium block mb-1.5">Domain / Functional Area</label><input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., Frontend Development" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Experience</label><input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., 3-5 years" /></div>
              <div><label className="text-sm font-medium block mb-1.5">Education Requirements</label><input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., B.Tech in CS or equivalent" /></div>
            </div>

            <div className="pt-2 border-t border-border mt-4">
              <h4 className="text-sm font-semibold mb-3">Skills & Technology</h4>
              <div className="space-y-4">
                <div><label className="text-sm font-medium block mb-1.5">Required Skills (comma separated)</label><input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="React, Node.js, TypeScript" /></div>
                <div><label className="text-sm font-medium block mb-1.5">Preferred Skills (comma separated)</label><input value={form.preferredSkills} onChange={e => setForm({ ...form, preferredSkills: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="AWS, GraphQL, Docker" /></div>
                <div><label className="text-sm font-medium block mb-1.5">Tools & Technologies (comma separated)</label><input value={form.toolsTech} onChange={e => setForm({ ...form, toolsTech: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Jira, Figma, GitHub" /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div>
              <div><label className="text-sm font-medium block mb-1.5">Work Mode</label><select value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent"><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></div>
              <div><label className="text-sm font-medium block mb-1.5">Vacancies</label><input type="number" min={1} value={form.vacancies} onChange={e => setForm({ ...form, vacancies: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div><label className="text-sm font-medium block mb-1.5">Job Description</label><textarea rows={8} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" placeholder="Describe the role..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Min Salary (₹ LPA)</label><input value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div>
              <div><label className="text-sm font-medium block mb-1.5">Max Salary (₹ LPA)</label><input value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Your Job</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="font-medium">Title:</span> {form.title || 'Not set'}</p>
              <p><span className="font-medium">Department:</span> {form.department || 'Not set'} <span className="text-muted-foreground">({form.domain || 'No Domain'})</span></p>
              <p><span className="font-medium">Location:</span> {form.location || 'Not set'} ({form.workMode})</p>
              <p><span className="font-medium">Experience:</span> {form.experience || 'Not set'}</p>
              <p><span className="font-medium">Education:</span> {form.education || 'Not set'}</p>
              <p><span className="font-medium">Salary:</span> ₹{form.salaryMin || '?'}–{form.salaryMax || '?'}L</p>
              <p><span className="font-medium">Vacancies:</span> {form.vacancies}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-5 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 hover:bg-muted transition-colors">Back</button>
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} className="gradient-accent text-accent-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90">Next</button>
          ) : (
            <button onClick={handlePublish} disabled={isSubmitting} className="gradient-accent text-accent-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Publishing...' : 'Publish Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
