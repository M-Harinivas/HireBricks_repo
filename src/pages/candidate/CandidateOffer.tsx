import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { FileText, MapPin, Briefcase, Calendar } from 'lucide-react';

const CandidateOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [offer, setOffer] = useState<any>(null);
  const [showModal, setShowModal] = useState<'accept' | 'decline' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        if (id) {
          const fetchedOffers = await apiService.getOffers({});
          const found = fetchedOffers?.find((o: any) => o.id === id);
          if (found) setOffer(found);
        } else {
          // Fallback to latest offer if no ID provided in URL (for top nav links)
          if (profile) {
            const offers = await apiService.getOffers({});
            const myApps = await apiService.getApplications({ candidate_id: profile.id });
            const myAppIds = new Set(myApps?.map((a: any) => a.id));
            const myOffer = offers?.find((o: any) => myAppIds.has(o.application_id));
            if (myOffer) setOffer(myOffer);
          }
        }
      } catch (e) {
        console.error("Error fetching offer:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id, profile]);



  const handleAccept = () => {
    setShowModal(null);
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#9b59b6', '#2ecc71', '#f1c40f'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#9b59b6', '#2ecc71', '#f1c40f'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    toast.success('Offer accepted! Welcome to the team! 🎉', { duration: 4000 });
    setTimeout(() => navigate('/candidate/dashboard'), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto py-8 space-y-6 fade-in">
        <div className="card-elevated p-10 h-[600px] flex flex-col gap-6">
          <div className="w-64 h-8 shimmer rounded-lg mx-auto mb-2"></div>
          <div className="w-32 h-4 shimmer rounded-md mx-auto mb-8"></div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-16 shimmer rounded-xl"></div>
            <div className="h-16 shimmer rounded-xl"></div>
          </div>

          {[...Array(8)].map((_, i) => (
            <div key={i} className={`${i % 3 === 0 ? 'w-full' : i % 2 === 0 ? 'w-[90%]' : 'w-[95%]'} h-4 shimmer rounded-md`}></div>
          ))}
          <div className="w-1/2 h-4 shimmer rounded-md mt-8"></div>
        </div>
      </div>
    );
  }

  if (!offer && !loading) {
    return (
      <div className="max-w-[800px] mx-auto py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><FileText size={24} className="text-muted-foreground" /></div>
        <h3 className="font-display font-bold text-xl">No active offer found</h3>
        <p className="text-muted-foreground mt-2 mb-6">You don't have any pending job offers at this time.</p>
        <button onClick={() => navigate('/candidate/dashboard')} className="btn-scale px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">Back to Dashboard</button>
      </div>
    );
  }

  // Dynamically replace hardcoded names from the mock with the authenticated user's name
  const personalizedContent = offer?.content ? offer.content.replace(/Arjun Reddy|Sneha Kapoor|Arjun Mehta/, profile?.full_name || 'Candidate') : '';

  return (
    <div className="max-w-[800px] mx-auto py-8 space-y-8 fade-in h-auto min-h-full pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Review Your Offer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Please review the terms of your employment.</p>
        </div>
      </div>

      <div className="card-elevated overflow-hidden border border-border/60 shadow-xl">
        {/* Header Ribbon */}
        <div className="gradient-navy p-8 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-primary-foreground font-display font-bold text-3xl mb-4 border border-white/30 backdrop-blur-md shadow-lg">
              {offer?.applications?.jobs?.organizations?.name?.charAt(0) || 'H'}
            </div>
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider mb-1">Offer of Employment</h2>
            <p className="text-primary-foreground/80 font-medium">{offer?.applications?.jobs?.organizations?.name || 'HireBricks Company'}</p>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border bg-muted/20 border-b border-border">
          <div className="p-4 flex flex-col items-center text-center">
            <Briefcase className="text-accent mb-2" size={20} />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Role</span>
            <span className="font-semibold text-sm mt-0.5">{offer?.applications?.jobs?.title || 'Unknown Role'}</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center">
            <DollarSignIcon className="text-success mb-2" size={20} />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Compensation</span>
            <span className="font-semibold text-sm mt-0.5 text-success">{offer?.salary}</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center">
            <MapPin className="text-cyan mb-2" size={20} />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</span>
            <span className="font-semibold text-sm mt-0.5">{offer?.applications?.jobs?.location || 'Bengaluru (Hybrid)'}</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center">
            <Calendar className="text-warning mb-2" size={20} />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Start Date</span>
            <span className="font-semibold text-sm mt-0.5">{offer?.start_date ? new Date(offer.start_date).toLocaleDateString() : 'TBD'}</span>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-8 md:p-12 prose prose-sm md:prose-base max-w-none text-foreground prose-p:leading-relaxed prose-li:my-1">
          {personalizedContent.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} className="font-display font-bold text-lg mt-6 mb-3 text-foreground">{line.replace(/\*\*/g, '')}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
            if (line === '') return <div key={i} className="h-4" />;
            return <p key={i} className="text-muted-foreground font-medium">{line}</p>;
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-muted/10 border-t border-border flex flex-col sm:flex-row gap-4 justify-end items-center">
          <button onClick={() => setShowModal('decline')} className="w-full sm:w-auto px-6 py-3 font-semibold text-sm border-2 border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl transition-all btn-scale">
            Decline Offer
          </button>
          <button onClick={() => setShowModal('accept')} className="w-full sm:w-auto px-8 py-3 font-semibold text-sm bg-success text-success-foreground hover:brightness-110 rounded-xl transition-all btn-scale shadow-lg shadow-success/20 flex items-center justify-center gap-2">
            <FileText size={18} /> Accept Offer
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 fade-in px-4" onClick={() => setShowModal(null)}>
          <div className="card-elevated rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-2 border-border" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${showModal === 'accept' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              {showModal === 'accept' ? <FileText size={32} /> : <Briefcase size={32} />}
            </div>

            <h3 className="text-2xl font-display font-bold mb-3">{showModal === 'accept' ? 'Accept this Offer?' : 'Decline Offer?'}</h3>
            <p className="text-muted-foreground mb-8 font-medium leading-relaxed">
              {showModal === 'accept'
                ? `By clicking Confirm, you are officially accepting the employment offer from ${offer?.applications?.jobs?.organizations?.name || 'the company'}. Welcome aboard!`
                : 'Are you sure you want to decline this offer? This action cannot be undone and the recruiter will be notified.'}
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 border-2 border-border hover:bg-muted py-3 rounded-xl text-sm font-bold transition-colors">Cancel</button>
              <button
                onClick={showModal === 'accept' ? handleAccept : () => { toast('Offer declined.', { icon: '👋' }); setShowModal(null); navigate('/candidate/dashboard'); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-lg btn-scale ${showModal === 'accept' ? 'bg-success text-success-foreground hover:brightness-110 shadow-success/20' : 'bg-destructive text-destructive-foreground hover:brightness-110 shadow-destructive/20'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon fallback for DollarSign
const DollarSignIcon = ({ className, size }: { className: string, size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export default CandidateOffer;
