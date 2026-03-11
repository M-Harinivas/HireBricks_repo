import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [flags, setFlags] = useState({ proctoring: true, resumeParse: true, offerGen: true });
  const [weights, setWeights] = useState([20, 20, 20, 20, 20]);
  const labels = ['Technical Skills', 'Communication', 'Experience', 'Cultural Fit', 'Problem Solving'];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Platform Settings</h1>
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Feature Flags</h3>
        {Object.entries(flags).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <span className="text-sm font-medium capitalize">{key === 'proctoring' ? 'AI Proctoring' : key === 'resumeParse' ? 'Resume Auto-Parse' : 'Offer Generator'}</span>
            <button onClick={() => setFlags({ ...flags, [key]: !val })} className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-accent' : 'bg-muted'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform ${val ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Default Evaluation Weights</h3>
        {labels.map((l, i) => (
          <div key={i} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{l}</span><span className="text-muted-foreground">{weights[i]}%</span></div>
            <input type="range" min={0} max={100} value={weights[i]} onChange={e => { const w = [...weights]; w[i] = +e.target.value; setWeights(w); }} className="w-full accent-accent" />
          </div>
        ))}
      </div>
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Platform Branding</h3>
        <div className="space-y-4">
          <div><label className="text-sm font-medium block mb-1.5">Platform Name</label><input defaultValue="HireBricks" className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm" /></div>
          <div><label className="text-sm font-medium block mb-1.5">Logo</label><div className="border-2 border-dashed border-border rounded-lg p-8 text-center"><Upload size={24} className="mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Upload logo</p></div></div>
        </div>
      </div>
      <button onClick={() => toast.success('Settings saved!')} className="gradient-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"><Save size={14} /> Save Settings</button>
    </div>
  );
};
export default AdminSettings;
