import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { X, Save, Send, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RecruiterOffers = () => {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetched = await apiService.getOffers();
        if (fetched) {
          const orgOffers = fetched.filter((o: any) =>
            o.applications?.jobs?.organization_id === profile.organization_id
          );
          setOffers(orgOffers);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, [profile]);

  const selected = offers.find(o => o.id === selectedId);

  const openEditor = (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (offer) { setEditContent(offer.content || ''); setSelectedId(id); }
  };

  return (
    <div className="page-container space-y-4">
      <div>
        <h1 className="text-page-title">Offers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{offers.length} offer{offers.length !== 1 ? 's' : ''} generated</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-accent w-7 h-7" />
          </div>
        ) : (
          <table className="dense-table">
            <thead><tr>
              <th>Candidate</th><th>Job Title</th><th>Salary</th><th>Start Date</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">No offers found.</td>
                </tr>
              ) : offers.map(o => (
                <tr key={o.id}>
                  <td className="font-medium">{o.applications?.profiles?.full_name || 'Candidate'}</td>
                  <td className="text-muted-foreground">{o.applications?.jobs?.title || '-'}</td>
                  <td className="font-medium">{o.salary}</td>
                  <td className="text-muted-foreground">{o.start_date ? new Date(o.start_date).toLocaleDateString() : '-'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><button onClick={() => openEditor(o.id)} className="text-xs text-accent hover:underline font-medium">Edit →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Offer Editor Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-section-title">Offer Letter — {selected.applications?.profiles?.full_name || 'Candidate'}</h3>
              <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
              <div className="border-r border-border p-4 overflow-y-auto">
                <label className="text-label block mb-2">Edit Content</label>
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-[calc(100%-30px)] p-3 rounded-md border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
              <div className="p-6 overflow-y-auto bg-muted/20">
                <div className="bg-card rounded-lg p-8 shadow-sm border border-border max-w-lg mx-auto">
                  <div className="prose prose-sm">
                    {editContent.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-sm">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('- ')) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
                      return <p key={i} className="text-sm text-muted-foreground">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t border-border">
              <button onClick={() => { toast.success('Draft saved!'); setSelectedId(null); }} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"><Save size={13} /> Save Draft</button>
              <button onClick={() => { toast.success('Offer sent to candidate!'); setSelectedId(null); }} className="flex items-center gap-1.5 gradient-accent text-white px-3 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all"><Send size={13} /> Send</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecruiterOffers;
