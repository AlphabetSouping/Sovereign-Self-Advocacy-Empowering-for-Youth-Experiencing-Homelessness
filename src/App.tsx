import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Shield, 
  Users, 
  ChevronRight, 
  Instagram, 
  MessageSquare, 
  Video, 
  Lock, 
  ArrowRight,
  Menu,
  X,
  FileText,
  Globe,
  Heart,
  TrendingDown,
  Navigation,
  Share2,
  AlertTriangle,
  HeartPulse,
  Ghost,
  Sparkles,
  Clapperboard,
  Tv,
  Skull,
  UserCheck2,
  Headset,
  Ear,
  LogOut,
  UserCircle
} from 'lucide-react';

// Firebase Imports
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup } from './lib/firebase';
import { generateNarrative } from './services/geminiService';

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Context ---

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Initialize user doc if needed
        const userRef = doc(db, 'users', u.uid);
        getDoc(userRef).then((snap) => {
          if (!snap.exists()) {
            setDoc(userRef, {
              uid: u.uid,
              displayName: u.displayName,
              sovereigntyLevel: 50,
              updatedAt: serverTimestamp()
            }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`));
          }
        });
      }
    });
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signIn, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-sovereign-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-accent fill-accent" size={24} />
          <span className="font-display font-bold text-xl tracking-tighter uppercase">The Sovereign Core</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-display text-xs tracking-widest uppercase">
          <a href="#pillars" className="hover:text-accent transition-colors">Pillars</a>
          <a href="#strategy" className="hover:text-accent transition-colors">Strategy</a>
          <a href="#portal" className="hover:text-accent transition-colors">Education</a>
          <a href="#toolkit" className="hover:text-accent transition-colors">Toolkit</a>
          <a href="#fellowship" className="hover:text-accent transition-colors">Fellowship</a>
          <a href="#crisis" className="hover:text-accent transition-colors">Crisis Hub</a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] opacity-60">SOVEREIGN_ID: {user.uid.slice(0, 6)}</span>
              <button onClick={logout} className="hover:text-accent transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="bristol-border-accent bg-accent text-white px-4 py-2 hover:bg-white hover:text-accent font-bold transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-sovereign-black border-b border-white/10 p-6 flex flex-col gap-6 font-display text-lg tracking-widest uppercase"
          >
            <a href="#pillars" onClick={() => setIsOpen(false)}>Pillars</a>
            <a href="#strategy" onClick={() => setIsOpen(false)}>Strategy</a>
            <a href="#portal" onClick={() => setIsOpen(false)}>Education</a>
            <a href="#toolkit" onClick={() => setIsOpen(false)}>Toolkit</a>
            <a href="#fellowship" onClick={() => setIsOpen(false)}>Fellowship</a>
            <a href="#crisis" onClick={() => setIsOpen(false)}>Crisis Hub</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Background Text Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none opacity-5">
        <h1 className="text-[20vw] leading-none font-display font-black uppercase text-white/10">Sovereign</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-accent font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Liberation Psychology // CRT Framework</span>
          <h1 className="text-6xl md:text-9xl font-display font-black leading-[0.9] uppercase mb-8">
            Your Narrative.<br />
            <span className="text-stroke">Your Power.</span><br />
            <span className="text-accent">Your Future.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Moving beyond charity and service-referrals. We foster internal and systemic power for youth experiencing homelessness.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="group relative bg-white text-sovereign-black px-10 py-5 font-display font-black uppercase text-xl hover:bg-accent hover:text-white transition-all overflow-hidden flex items-center gap-2">
              Explore the core
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bristol-border px-10 py-5 font-display font-black uppercase text-xl hover:bg-white hover:text-sovereign-black transition-all">
              Download Toolkit
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <TrendingDown className="text-white/30" />
      </motion.div>
    </section>
  );
};

const Pillars = () => {
  const pillars = [
    {
      title: "Sovereign Core Authenticity",
      icon: Shield,
      desc: "Your identity and body are your own sovereign territory. You define yourself, not your housing status.",
      detail: "Based on Indigenous Sovereignty models. Identity is a constant, housing is a circumstance."
    },
    {
      title: "Radical Self-Advocacy",
      icon: Zap,
      desc: "Challenge the system. Your needs are human rights, not charity requests. Demand systemic accountability.",
      detail: "Learn to navigate and dismantle systemic barriers through informed resistance."
    },
    {
      title: "Diffusion of Power",
      icon: Users,
      desc: "Dismantle 'adultism'. Demand shared decision-making in the programs that serve you. Take a seat at the table.",
      detail: "Rooted in Youth Participatory Action Research (YPAR). No decisions about us, without us."
    }
  ];

  return (
    <section id="pillars" className="py-32 bg-white text-sovereign-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group p-8 border-l-4 border-sovereign-black hover:bg-sovereign-black hover:text-white transition-all duration-500"
            >
              <pillar.icon className="mb-6 group-hover:text-accent transition-colors" size={48} />
              <h3 className="text-3xl font-display font-black mb-4">{pillar.title}</h3>
              <p className="text-lg opacity-80 mb-6">{pillar.desc}</p>
              <div className="pt-6 border-t border-sovereign-black/10 group-hover:border-white/10 text-sm font-mono uppercase tracking-wider">
                {pillar.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentStrategy = () => {
  const items = [
    { theme: "Sovereign Authenticity", format: "I Am Not My Status", msg: "My housing status is a circumstance; my Core is a constant.", icon: Shield },
    { theme: "Radical Self-Advocacy", format: "Know Your Rights", msg: "When a shelter says 'no,' ask for the written policy.", icon: Zap },
    { theme: "Diffusion of Power", format: "Ask Why Reels", msg: "If there isn't a Youth Board at the table, there is no seat for the truth.", icon: Users },
    { theme: "Wellness", format: "Somatic Power Poses", msg: "Systems try to make us small. Today, take up space.", icon: Heart },
  ];

  return (
    <section id="strategy" className="py-32 bg-sovereign-black">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl font-black mb-20 text-stroke">Content Strategy</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-white/20 text-left font-display text-xs tracking-widest uppercase text-white/50">
                <th className="py-6 px-4">Theme</th>
                <th className="py-6 px-4">Format</th>
                <th className="py-6 px-4">Sample Messaging</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors group"
                >
                  <td className="py-8 px-4">
                    <div className="flex items-center gap-3">
                      <item.icon className="text-accent" size={20} />
                      <span className="font-display font-bold uppercase">{item.theme}</span>
                    </div>
                  </td>
                  <td className="py-8 px-4 font-mono text-sm text-accent">{item.format}</td>
                  <td className="py-8 px-4 italic text-lg opacity-80 group-hover:opacity-100">&quot;{item.msg}&quot;</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const InstagramCheckIn = () => {
  const [step, setStep] = useState<'poll' | 'slider'>('poll');
  const [pollChoice, setPollChoice] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(50);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    const text = step === 'poll' 
      ? `My Sovereign Power source today: ${pollChoice || 'Undecided'}. Join the #SovereignCore`
      : `My Sovereignty is at ${sliderVal}% today. We demand better. #SovereignCore`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Sovereign Core',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    }
  };

  return (
    <div className="aspect-square bg-white/5 bristol-border p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4 z-10 font-mono text-[8px] uppercase tracking-widest opacity-40">
        <span>Authenticity Check-in</span>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleShare}
            className="hover:text-white text-accent transition-colors flex items-center gap-1"
          >
            <Share2 size={10} />
            <span className="text-[7px]">{sharing ? 'Link Copied' : 'Share'}</span>
          </button>
          <div className="flex gap-1 w-16">
            <div className={`h-0.5 flex-1 transition-all ${step === 'poll' ? 'bg-accent' : 'bg-white/20'}`} />
            <div className={`h-0.5 flex-1 transition-all ${step === 'slider' ? 'bg-accent' : 'bg-white/20'}`} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'poll' ? (
          <motion.div
            key="poll"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h4 className="text-xl font-display font-black mb-6 uppercase tracking-tight">How do you define your power today?</h4>
            <div className="space-y-3">
              <button 
                onClick={() => setPollChoice('Internal')}
                className={`w-full p-4 border-2 transition-all font-display font-bold uppercase flex justify-between items-center text-xs ${pollChoice === 'Internal' ? 'bg-accent border-accent text-white' : 'border-white/20 hover:border-white'}`}
              >
                Internal Peace {pollChoice && <span className="font-mono text-[10px]">68%</span>}
              </button>
              <button 
                onClick={() => setPollChoice('External')}
                className={`w-full p-4 border-2 transition-all font-display font-bold uppercase flex justify-between items-center text-xs ${pollChoice === 'External' ? 'bg-accent border-accent text-white' : 'border-white/20 hover:border-white'}`}
              >
                Systemic Change {pollChoice && <span className="font-mono text-[10px]">32%</span>}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slider"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h4 className="text-xl font-display font-black mb-6 uppercase tracking-tight">How Sovereign is your core today?</h4>
            <div className="space-y-8">
              <div className="relative pt-1">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderVal}
                  onChange={(e) => setSliderVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[8px] uppercase font-bold mt-4 opacity-50 tracking-[0.2em]">
                  <span>Suppressed</span>
                  <span>Absolved</span>
                </div>
              </div>
              <div className="text-center font-display font-black text-5xl text-accent">
                {sliderVal}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setStep(step === 'poll' ? 'slider' : 'poll')}
        className="mt-6 w-full py-3 border border-white/20 hover:border-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
      >
        {step === 'poll' ? 'Next Slide' : 'Restart'} <ArrowRight size={14} />
      </button>
    </div>
  );
};

const SocialHub = () => {
  return (
    <section className="py-32 bg-sovereign-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* TikTok */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Video className="text-accent" />
              <h3 className="text-2xl font-display font-black tracking-tighter">TikTok: Authenticity Hub</h3>
            </div>
            <div className="aspect-[9/16] bg-white/5 bristol-border overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-bold mb-2">@SovereignCore</div>
                <div className="text-sm opacity-80">Sovereign Scripts: Radical Advocacy with case workers. #PowerShift</div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="text-white animate-pulse" size={48} />
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Instagram className="text-accent" />
              <h3 className="text-2xl font-display font-black tracking-tighter">IG: Empowerment Gallery</h3>
            </div>
            <InstagramCheckIn />
            <p className="text-sm text-white/50 italic text-center">Interactive stories for unbiased processing.</p>
          </div>

          {/* Discord/WhatsApp */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-accent" />
              <h3 className="text-2xl font-display font-black tracking-tighter">The Diffusion Den</h3>
            </div>
            <div className="p-8 bg-accent text-white bristol-border min-h-[400px] flex flex-col justify-between">
              <Lock size={32} />
              <div>
                <h4 className="text-3xl font-display font-black uppercase mb-4 leading-none text-white/90">Closed.<br />Safe.<br />Collective.</h4>
                <p className="mb-8 font-light italic">Peer-led organizing and underground resource mapping.</p>
                <button className="w-full py-4 bg-sovereign-black text-white font-display font-black uppercase hover:bg-white hover:text-sovereign-black transition-colors">
                  Apply for entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AdvocacyTranslator = () => {
  const [active, setActive] = useState(0);
  const scenarios = [
    { from: "I need help", to: "I am exercising my right to [service]" },
    { from: "Thank you for the charity", to: "I am demanding systemic accountability" },
    { from: "What am I allowed to do?", to: "I require a copy of the written policy" },
  ];

  return (
    <div className="bristol-border-accent p-8 bg-white/5">
      <h3 className="text-2xl font-display font-black mb-8 uppercase flex items-center gap-2">
        <ArrowRight className="text-accent" />
        Advocacy Translator
      </h3>
      <div className="space-y-4">
        {scenarios.map((s, i) => (
          <button 
            key={i}
            onClick={() => setActive(i)}
            className={`w-full text-left p-6 transition-all border-l-4 ${active === i ? 'bg-accent text-white border-white' : 'hover:bg-white/10 border-white/20'}`}
          >
            <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60">Traditional</div>
            <div className="text-lg line-through opacity-50 mb-4">&quot;{s.from}&quot;</div>
            <div className="text-[10px] uppercase tracking-widest mb-1 opacity-100">Sovereign Advocacy</div>
            <div className="text-xl font-display font-bold">&quot;{s.to}&quot;</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SystemMap = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const entities = [
    {
      id: 'hud',
      tier: 'Federal',
      name: 'HUD (Housing & Urban Development)',
      influence: 'Funding & Federal Mandates',
      power: 'Absolute',
      contact: 'hud-local-office@gov.us',
      notes: 'Controls Section 8 and massive block grants. They demand compliance with federal civil rights.'
    },
    {
      id: 'council',
      tier: 'Municipal',
      name: 'City Council / Mayor',
      influence: 'Zoning & Local Budget',
      power: 'High',
      contact: 'cityhall-housing@civic.gov',
      notes: 'Votes on local shelter placements and non-profit funding. They are elected—your vote is the leverage.'
    },
    {
      id: 'coc',
      tier: 'Municipal',
      name: 'CoC (Continuum of Care)',
      influence: 'Grant Distribution',
      power: 'High',
      contact: 'coc-leadership@local.org',
      notes: 'The regional planning body that decides which non-profits get funding.'
    },
    {
      id: 'boards',
      tier: 'Operational',
      name: 'Non-Profit Boards',
      influence: 'Policy & Shelter Rules',
      power: 'Medium',
      contact: 'board-of-directors@shelter-x.org',
      notes: 'Often invisible. They set the rules for transitional housing. Demand a youth seat here.'
    },
    {
      id: 'management',
      tier: 'Operational',
      name: 'Shelter Management',
      influence: 'Day-to-Day Operations',
      power: 'Direct',
      contact: 'program-director@local-services.com',
      notes: 'Execution of policy. They handle grievances and intake.'
    }
  ];

  return (
    <div className="bristol-border bg-sovereign-black p-8 relative min-h-[500px] overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-[8px] uppercase tracking-widest text-white/40">Power Node</span>
        </div>
      </div>

      <h3 className="text-xl font-display font-black uppercase mb-8 flex items-center gap-2 text-white">
        <Navigation className="text-accent" size={20} />
        System Power Mapping
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Map View */}
        <div className="relative flex flex-col justify-center border-r border-white/10 pr-8">
          {entities.map((e, i) => (
            <motion.button
              key={e.id}
              onClick={() => setSelected(e.id)}
              whileHover={{ x: 10 }}
              className={`text-left p-4 mb-2 flex items-center gap-4 transition-all ${selected === e.id ? 'bg-accent text-white scale-105 z-10' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
            >
              <div className="font-mono text-[10px] w-12 opacity-50">{e.tier}</div>
              <div className="flex-1 font-display font-bold uppercase text-[12px] leading-tight">{e.name}</div>
              <div className={`w-2 h-2 rounded-full ${selected === e.id ? 'bg-white' : 'bg-accent'}`} />
            </motion.button>
          ))}
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-white/20 to-transparent" />
        </div>

        {/* Info View */}
        <div className="flex flex-col justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {entities.find(e => e.id === selected) && (
                  <>
                    <div>
                      <div className="text-accent font-mono text-[8px] uppercase tracking-[0.3em] mb-2">Power Source</div>
                      <h4 className="text-2xl font-display font-black uppercase text-white leading-none">
                        {entities.find(e => e.id === selected)?.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10">
                        <div className="text-[10px] text-accent font-bold uppercase mb-1">Influence</div>
                        <div className="text-xs text-white/80">{entities.find(e => e.id === selected)?.influence}</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10">
                        <div className="text-[10px] text-accent font-bold uppercase mb-1">Leverage</div>
                        <div className="text-xs text-white/80">{entities.find(e => e.id === selected)?.power} Power</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs leading-relaxed text-white/60 italic">
                        &quot;{entities.find(e => e.id === selected)?.notes}&quot;
                      </div>
                      <div className="flex flex-col gap-2 p-4 bg-white text-sovereign-black">
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-50">Direct Contact</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold">{entities.find(e => e.id === selected)?.contact}</span>
                          <button 
                            className="bg-accent text-white px-2 py-1 text-[8px] font-black uppercase"
                            onClick={() => window.location.href = `mailto:${entities.find(e => e.id === selected)?.contact}`}
                          >
                            Email Direct
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="text-center opacity-20 border-2 border-dashed border-white/20 p-12">
                <Shield size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Select a node to identify power leakage</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Toolkit = () => {
  const [activeTab, setActiveTab] = useState<'translator' | 'map'>('translator');

  return (
    <section id="toolkit" className="py-32 bg-white text-sovereign-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-20">
          <div className="flex-1">
            <h2 className="text-6xl md:text-8xl font-black mb-8 leading-none">The Anti-Paternalism Toolkit</h2>
            <p className="text-xl mb-12 opacity-80 leading-relaxed">
              Dismantle systems of control with knowledge. This toolkit provides the linguistic and tactical weapons needed to demand your rights.
            </p>
            
            <div className="flex gap-4 mb-12 border-b-2 border-sovereign-black/10 pb-4">
              <button 
                onClick={() => setActiveTab('translator')}
                className={`font-display font-black uppercase text-xs tracking-widest pb-4 -mb-[18px] transition-all ${activeTab === 'translator' ? 'border-b-4 border-accent text-accent' : 'opacity-40 hover:opacity-100'}`}
              >
                Advocacy Translator
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`font-display font-black uppercase text-xs tracking-widest pb-4 -mb-[18px] transition-all ${activeTab === 'map' ? 'border-b-4 border-accent text-accent' : 'opacity-40 hover:opacity-100'}`}
              >
                The System Map
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-sovereign-black hover:bg-sovereign-black hover:text-white transition-all group">
                <FileText className="mb-4 group-hover:text-accent" />
                <h4 className="text-xl font-display font-black uppercase mb-2">Policy Decoder</h4>
                <p className="text-sm opacity-70">Turn clinical jargon into understandable rights-based demands.</p>
              </div>
              <div className="p-6 border-2 border-sovereign-black hover:bg-sovereign-black hover:text-white transition-all group">
                <Globe className="mb-4 group-hover:text-accent" />
                <h4 className="text-xl font-display font-black uppercase mb-2">Digital Discretion</h4>
                <p className="text-sm opacity-70">VPN and Burner account setup for secure advocacy.</p>
              </div>
            </div>
            <button className="mt-12 w-full py-6 bg-accent text-white font-display font-black uppercase text-2xl hover:bg-sovereign-black transition-all">
              Download Full Toolkit .ZIP
            </button>
          </div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'translator' ? (
                <motion.div key="translator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <AdvocacyTranslator />
                </motion.div>
              ) : (
                <motion.div key="map" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SystemMap />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const Fellowship = () => {
  return (
    <section id="fellowship" className="py-32 bg-sovereign-black">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-8xl font-black mb-8 uppercase italic text-stroke-accent">Sovereign Creators</h2>
        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-20 leading-relaxed">
          The face and voice of the campaign are those who have walked the path. Paid fellowships for lived experience consultants.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[1,2,3,4,5].map(i => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
              className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden grayscale hover:grayscale-0 transition-all cursor-crosshair"
            >
              <Users className="text-white/20" size={48} />
              <div className="absolute inset-0 bg-accent/20 opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Creator #{i}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bristol-border-accent bg-accent/5 inline-block text-left max-w-2xl">
          <h4 className="text-2xl font-display font-black mb-4 uppercase">Role: Content Autonomy</h4>
          <p className="text-white/80 italic mb-0">
            &quot;They create the content, moderate the Den, and ensure the language never becomes clinical or paternalistic.&quot;
          </p>
        </div>
      </div>
    </section>
  );
};

const EducationPortal = () => {
  const [genre, setGenre] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const genres = [
    { id: 'anime', label: 'Anime', icon: Ghost, color: 'bg-purple-600' },
    { id: 'reality', label: 'Reality TV', icon: Tv, color: 'bg-pink-600' },
    { id: 'bio', label: 'Bio/Doc', icon: Skull, color: 'bg-stone-700' },
    { id: 'drama', label: 'Drama', icon: Clapperboard, color: 'bg-red-600' },
    { id: 'ai', label: 'AI Narrative', icon: Sparkles, color: 'bg-cyan-600' },
  ];

  const topics = [
    { id: 'advocacy', label: 'Self-Advocacy' },
    { id: 'rights', label: 'Legal Rights' },
    { id: 'data', label: 'Data Privacy' },
    { id: 'power', label: 'Power Dynamics' },
  ];

  const handleGenerate = async () => {
    if (!genre || !topic) return;
    setLoading(true);
    setPlaying(true);
    try {
      const res = await generateNarrative(genre, topic);
      setNarrative(res);
    } catch (error) {
      setNarrative("The narrative bypass has failed. Reconnect your core.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="portal" className="py-32 bg-sovereign-black overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-8xl font-black mb-4 uppercase text-stroke-accent">Education Portal</h2>
        <p className="text-xl text-white/60 mb-16 max-w-2xl font-light italic">Pick your vibe. Learn your rights. Own your narrative.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Picker */}
          <div className="space-y-12">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-6 text-accent">Step 01: Select Genre</h3>
              <div className="flex flex-wrap gap-4">
                {genres.map((g) => (
                  <button 
                    key={g.id}
                    onClick={() => {setGenre(g.id); setPlaying(false); setNarrative(null);}}
                    className={`flex items-center gap-3 px-6 py-4 border-2 transition-all font-display font-black uppercase text-sm ${genre === g.id ? 'bg-white text-sovereign-black border-white' : 'border-white/10 hover:border-white'}`}
                  >
                    <g.icon size={18} />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-6 text-accent">Step 02: Select Topic</h3>
              <div className="grid grid-cols-2 gap-4">
                {topics.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => {setTopic(t.id); setPlaying(false); setNarrative(null);}}
                    className={`px-6 py-4 border-2 transition-all font-display font-bold uppercase text-[10px] tracking-widest ${topic === t.id ? 'bg-accent border-accent' : 'border-white/10 hover:border-white'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={!genre || !topic || loading}
              onClick={handleGenerate}
              className="w-full py-6 bg-white text-sovereign-black font-display font-black uppercase text-xl disabled:opacity-20 hover:bg-accent hover:text-white transition-all transform hover:scale-[1.01]"
            >
              {loading ? "Decrypting Narrative..." : "Generate Story Experience"}
            </button>
          </div>

          {/* Screen */}
          <div className="aspect-video bg-white/5 bristol-border relative flex flex-col items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {playing ? (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black to-transparent"
                >
                  <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">LIVE {genre?.toUpperCase()} FEED</span>
                  </div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-h-full overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-white/20 w-3/4" />
                        <div className="h-4 bg-white/20 w-1/2" />
                        <div className="h-20 bg-white/20 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="bg-white text-sovereign-black p-4 inline-block font-display font-black uppercase italic text-xs mb-4">
                          Scenario: {topic?.toUpperCase()}
                        </div>
                        <div className="text-lg md:text-xl font-display font-black uppercase leading-tight mb-4 text-white">
                          {narrative?.split('\n')[0] || "Incoming Sovereign Signal..."}
                        </div>
                        <p className="text-white/70 text-sm mb-6 max-w-lg italic font-mono">
                          {narrative?.split('\n').slice(1).join('\n') || "Loading encrypted data stream..."}
                        </p>
                        <div className="flex gap-4">
                          <button onClick={() => setPlaying(false)} className="flex-1 py-3 bg-accent font-bold uppercase text-[10px] tracking-widest">End Session</button>
                          <button onClick={handleGenerate} className="flex-1 py-3 bg-white/20 font-bold uppercase text-[10px] tracking-widest hover:bg-white/40">New Chapter</button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="text-center p-12">
                  <Clapperboard size={64} className="mx-auto mb-6 opacity-20" />
                  <h4 className="text-xl font-display font-black uppercase text-white/30">Ready for Broadcast</h4>
                  <p className="text-xs text-white/20 mt-2 uppercase tracking-widest">Select genre & topic to begin</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const CrisisHub = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sos' | 'chat' | 'rep'>('sos');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'peer_chat'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'peer_chat'));
  }, [user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, 'peer_chat'), {
        userId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'peer_chat');
    }
  };

  const handleCrisisReport = async (type: string) => {
    if (!user) {
      signIn();
      return;
    }
    try {
      await addDoc(collection(db, 'crisis_reports'), {
        userId: user.uid,
        type,
        details: "Rapid report initiated from dashboard.",
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("Report dispatched to rapid response network.");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'crisis_reports');
    }
  };

  return (
    <div id="crisis" className="fixed bottom-10 right-10 z-[60]">
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[450px] bg-sovereign-black border-2 border-accent shadow-[0_0_50px_rgba(255,75,43,0.3)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-accent p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <h3 className="font-display font-black uppercase text-xl tracking-tight">Rapid Response Hub</h3>
              </div>
              <button onClick={() => setOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            {/* Nav */}
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setActiveTab('sos')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sos' ? 'bg-white/10 text-accent' : 'hover:bg-white/5 opacity-50'}`}
              >
                Immediate Help
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white/10 text-accent' : 'hover:bg-white/5 opacity-50'}`}
              >
                Peer Support
              </button>
              <button 
                onClick={() => setActiveTab('rep')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rep' ? 'bg-white/10 text-accent' : 'hover:bg-white/5 opacity-50'}`}
              >
                Mirror Rep
              </button>
            </div>

            {/* Content */}
            <div className="p-8 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === 'sos' && (
                  <motion.div key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <p className="text-sm opacity-70 italic mb-8">Rapid reporting for safety concerns, housing denial, or systemic harm.</p>
                    <button 
                      onClick={() => handleCrisisReport('crisis')}
                      className="w-full p-6 border-2 border-accent font-display font-black uppercase text-left group hover:bg-accent transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">Report Immediate Crisis</span>
                        <Navigation size={18} />
                      </div>
                      <div className="text-[10px] opacity-60">Connected to local rapid response networks</div>
                    </button>
                    <button 
                      onClick={() => handleCrisisReport('safe_passage')}
                      className="w-full p-6 border-2 border-white/20 font-display font-black uppercase text-left hover:border-white transition-all group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span>Safe Passage Request</span>
                        <Shield size={18} />
                      </div>
                      <div className="text-[10px] opacity-60">Verified peer escort in your area</div>
                    </button>
                    {!user && (
                      <p className="text-[10px] text-accent text-center animate-pulse">SIGN IN REQUIRED FOR CRISIS DISPATCH</p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                    <div className="flex-1 bg-white/5 p-4 space-y-4 mb-4 overflow-y-auto max-h-[300px] custom-scrollbar">
                      {chatMessages.length === 0 && (
                        <div className="text-white/20 text-[10px] uppercase text-center mt-20">The Den is quiet. Speak your truth.</div>
                      )}
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold ${msg.userId === user?.uid ? 'bg-white text-black' : 'bg-accent text-white'}`}>
                            {msg.userId === user?.uid ? 'ME' : 'PEER'}
                          </div>
                          <div className="bg-white/10 p-3 text-xs max-w-[80%] rounded-r-lg rounded-bl-lg">
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    {user ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type anonymously..."
                          className="flex-1 bg-transparent border border-white/20 p-4 text-xs font-mono focus:border-accent outline-none"
                        />
                        <button onClick={handleSend} className="bg-accent px-4 flex items-center justify-center hover:bg-white hover:text-accent transition-colors"><ArrowRight size={18} /></button>
                      </div>
                    ) : (
                      <button onClick={signIn} className="w-full py-4 bristol-border-accent bg-accent font-display font-black uppercase">Sign in to join the Den</button>
                    )}
                  </motion.div>
                )}

                {activeTab === 'rep' && (
                  <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <UserCheck2 size={48} className="mx-auto mb-6 text-accent" />
                    <h4 className="text-2xl font-display font-black mb-4 uppercase">The Mirror Rep</h4>
                    <p className="text-sm opacity-70 mb-8 italic">
                      Our trauma-informed AI reflects the insights of professionally trained human therapists. Immediate, mirrored support.
                    </p>
                    <div className="p-4 bg-white/5 border border-white/10 text-left text-xs space-y-2 mb-8 italic opacity-60">
                      <p>• Verified Trauma-Informed</p>
                      <p>• Professional Therapist Oversight</p>
                      <p>• 100% Data Sovereignty/Encryption</p>
                    </div>
                    <button className="w-full py-4 bg-white text-sovereign-black font-display font-black uppercase text-[10px] tracking-widest hover:bg-accent hover:text-white transition-all">
                      Commence Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setOpen(!open)}
        className="w-16 h-16 rounded-full bg-accent border-4 border-white shadow-[0_0_30px_rgba(255,75,43,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
      >
        {open ? <X className="text-white" /> : <HeartPulse className="text-white group-hover:scale-125 transition-transform" />}
        {!open && (
           <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
        )}
      </button>
    </div>
  );
};

const SuccessMetrics = () => {
  const metrics = [
    { label: "Shift in Language", value: "82%", icon: MessageSquare },
    { label: "Resource Link-throughs", value: "14.2k", icon: Globe },
    { label: "Real-world Action", value: "320+", icon: Navigation },
  ];

  return (
    <section className="py-20 bg-white text-sovereign-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:max-w-md">
            <h2 className="text-4xl font-black uppercase mb-4">Evaluating Success</h2>
            <p className="opacity-70">We measure power shifts, not just likes. High engagement reflects actual mobilization and language adoption.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto">
            {metrics.map((m, i) => (
              <div key={i} className="text-center p-8 bg-sovereign-black text-white hover:bg-accent transition-all">
                <m.icon className="mx-auto mb-4" />
                <div className="text-4xl font-display font-black mb-2">{m.value}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const RadicalDemand = () => {
  const [demand, setDemand] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { user, signIn } = useAuth();

  const handleDemand = async () => {
    if (!demand.trim()) return;
    if (!user) {
      signIn();
      return;
    }
    try {
      await addDoc(collection(db, 'demands'), {
        userId: user.uid,
        text: demand,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'demands');
    }
  };

  return (
    <section id="radicle" className="py-32 bg-accent text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none opacity-10">
        <h2 className="text-[15vw] leading-none font-display font-black uppercase whitespace-nowrap">Not Good Enough</h2>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-8xl font-black mb-4 uppercase leading-none">Not Good Enough.</h2>
          <p className="text-xl md:text-2xl font-display font-bold uppercase mb-12 tracking-tight">
            We need better and we need it <span className="underline decoration-white decoration-4 underline-offset-8">now</span>.
          </p>

          <div className="bg-sovereign-black p-8 md:p-12 bristol-border shadow-2xl">
            <h3 className="text-2xl font-display font-black uppercase mb-6 text-left border-b border-white/20 pb-4">
              Voice the Unimagined Change
            </h3>
            
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  exit={{ opacity: 0, y: -20 }}
                >
                  <textarea 
                    value={demand}
                    onChange={(e) => setDemand(e.target.value)}
                    placeholder="WHAT IS THE CHANGE NO ONE ELSE IS BRAVE ENOUGH TO IMAGINE?"
                    className="w-full h-48 bg-transparent border-2 border-white/20 p-6 font-mono text-lg focus:border-white focus:outline-none placeholder:text-white/20 mb-8 resize-none"
                  />
                  <button 
                    onClick={handleDemand}
                    className="w-full py-6 bg-white text-accent font-display font-black uppercase text-2xl hover:bg-sovereign-black hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {user ? "Demand Action" : "Sign in to Demand Action"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12"
                >
                  <Zap className="mx-auto mb-6 h-16 w-16" />
                  <h4 className="text-4xl font-display font-black uppercase mb-4">Demand Received.</h4>
                  <p className="text-xl opacity-80 italic">Your voice is now part of the Sovereign Core collective. We do not ask. We demand.</p>
                  <button 
                    onClick={() => {setSubmitted(false); setDemand("");}}
                    className="mt-8 text-xs font-mono uppercase tracking-[0.3em] border-b border-white hover:text-white/60 hover:border-white/60"
                  >
                    Make another demand
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="mt-20 flex overflow-hidden whitespace-nowrap opacity-20 font-display font-black uppercase text-2xl tracking-widest py-4 border-y border-white/20">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-20 pr-20"
        >
          <span>Sovereignty Now</span>
          <span>Dismantle Control</span>
          <span>We are the Table</span>
          <span>Power Shift</span>
          <span>Not Good Enough</span>
          <span>Sovereignty Now</span>
          <span>Dismantle Control</span>
          <span>We are the Table</span>
          <span>Power Shift</span>
          <span>Not Good Enough</span>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-20 bg-sovereign-black border-t border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="text-accent fill-accent" size={32} />
            <h2 className="text-3xl font-display font-black tracking-tighter uppercase">The Sovereign Core</h2>
          </div>
          <p className="text-white/40 max-w-sm uppercase text-[10px] tracking-widest leading-loose font-bold">
            Rooted in Liberation Psychology & Critical Race Theory. 
            All Rights to the Individual. 
            Dismantle Sovereignty-Denied Systems.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-20">
          <div className="space-y-4">
            <h4 className="font-display font-black text-accent uppercase text-xs tracking-widest">Connect</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-display font-black text-accent uppercase text-xs tracking-widest">Safety</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="hover:text-white transition-colors">VPN Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Peer Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ethical Code</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Burner Setup</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none select-none">
        <h1 className="text-[40vw] font-black uppercase text-white leading-none">Power</h1>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  useEffect(() => {
    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href')?.substring(1);
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen selection:bg-accent selection:text-white">
        <Navbar />
        <Hero />
        <Pillars />
        <ContentStrategy />
        <EducationPortal />
        <SocialHub />
        <Toolkit />
        <Fellowship />
        <RadicalDemand />
        <SuccessMetrics />
        <CrisisHub />
        <Footer />
      </div>
    </AuthProvider>
  );
}
