import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import { UserIcon, MailIcon, LockIcon, MapPinIcon, BuildingIcon, EyeIcon, EyeOffIcon } from "../components/Icons";

// ─── University & town data ───────────────────────────────────────────────────
const UNIS = [
  { value:"",label:"Choose your university...",short:"",type:null },
  ...([
    ["University of Moratuwa","UOM","state"],["University of Colombo","UOC","state"],
    ["University of Kelaniya","UOK","state"],["University of Peradeniya","UOP","state"],
    ["University of Sri Jayewardenepura","USJP","state"],["University of Jaffna","UOJ","state"],
    ["University of Ruhuna","UOR","state"],["Eastern University Sri Lanka","EUSL","state"],
    ["South Eastern University of Sri Lanka","SEUSL","state"],["Rajarata University of Sri Lanka","RUSL","state"],
    ["Sabaragamuwa University of Sri Lanka","SUSL","state"],["Wayamba University of Sri Lanka","WUSL","state"],
    ["Uva Wellassa University","UWU","state"],["Open University of Sri Lanka","OUSL","state"],
    ["General Sir John Kotelawala Defence University","KDU","state"],
    ["SLIIT","SLIIT","private"],["NSBM Green University","NSBM","private"],
    ["APIIT Sri Lanka","APIIT","private"],["Informatics Institute of Technology","IIT","private"],
    ["CINEC Campus","CINEC","private"],["Horizon Campus","Horizon","private"],
    ["Esoft Metro Campus","Esoft","private"],["ICBT Campus","ICBT","private"],["NIBM","NIBM","private"],
  ].map(([value,short,type])=>({ value, label:`${value} (${short})`, short, type }))),
];
const TOWNS = {
  "University of Moratuwa":["Katubedda","Moratuwa Town","Angulana","Lunawa"],
  "University of Colombo":["Colombo 3","Thurstan","Borella"],
  "University of Kelaniya":["Kelaniya","Dalugama","Wattala"],
  "University of Peradeniya":["Peradeniya","Kandy City","Getambe"],
  "University of Sri Jayewardenepura":["Nugegoda","Gangodawila","Maharagama"],
  "University of Jaffna":["Thirunelveli","Jaffna Town"],
  "University of Ruhuna":["Wellamadama","Matara Town"],
  "Eastern University Sri Lanka":["Vantharumoolai","Chenkalady"],
  "South Eastern University of Sri Lanka":["Oluvil","Sammanthurai"],
  "Rajarata University of Sri Lanka":["Mihintale","Anuradhapura"],
  "Sabaragamuwa University of Sri Lanka":["Belihuloya","Ratnapura"],
  "Wayamba University of Sri Lanka":["Kuliyapitiya","Makandura"],
  "Uva Wellassa University":["Badulla","Passara Road"],
  "Open University of Sri Lanka":["Nawala","Nugegoda"],
  "General Sir John Kotelawala Defence University":["Ratmalana","Werahera"],
  "SLIIT":["Malabe","Colombo 3"],"NSBM Green University":["Pitipana","Homagama"],
  "APIIT Sri Lanka":["Colombo 3"],"Informatics Institute of Technology":["Colombo 6"],
  "CINEC Campus":["Malabe"],"Horizon Campus":["Malabe","Nugegoda"],
  "Esoft Metro Campus":["Colombo 3","Kandy","Galle"],
  "ICBT Campus":["Colombo 3","Kandy"],"NIBM":["Colombo 7","Kandy"],
};
const YEARS=[{v:"",l:"Select year..."},{v:"1",l:"Year 1 — First Year"},{v:"2",l:"Year 2 — Second Year"},{v:"3",l:"Year 3 — Third Year"},{v:"4",l:"Year 4 — Fourth Year"},{v:"5",l:"Year 5 — Postgraduate"}];

// ─── Tiny primitives ──────────────────────────────────────────────────────────
function FInput({ label, err, icon, suffix, ...p }) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <span className={`text-[11px] font-bold tracking-[0.6px] uppercase transition-colors ${err ? 'text-red-500' : 'text-slate-500 focus-within:text-primary-600'}`}>{label}</span>
      <div className="relative group">
        {icon && <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none transition-colors ${err ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`}>{icon}</span>}
        <input 
          className={`w-full rounded-xl text-[13.5px] font-medium outline-none transition-all duration-200 
            ${icon ? 'pl-10' : 'pl-3.5'} 
            ${suffix ? 'pr-11' : 'pr-3.5'} py-2.5
            ${err 
              ? 'bg-red-50/50 border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 hover:border-slate-300'
            } border-2`}
          {...p}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 flex">{suffix}</span>}
      </div>
      {err && <span className="text-[11.5px] text-red-500 font-semibold">{err}</span>}
    </div>
  );
}

function FSel({ label, err, icon, opts=[], ...p }) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <span className={`text-[11px] font-bold tracking-[0.6px] uppercase transition-colors ${err ? 'text-red-500' : 'text-slate-500 focus-within:text-primary-600'}`}>{label}</span>
      <div className="relative group">
        {icon && <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none transition-colors ${err ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`}>{icon}</span>}
        <select 
          className={`w-full rounded-xl text-[13.5px] font-medium outline-none appearance-none cursor-pointer transition-all duration-200 
            ${icon ? 'pl-10' : 'pl-3.5'} pr-10 py-2.5
            ${err 
              ? 'bg-red-50/50 border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 hover:border-slate-300'
            } border-2 ${!p.value ? 'text-slate-500' : 'text-slate-900'}`}
          {...p}
        >
          {opts.map(({v,l})=><option key={v} value={v}>{l}</option>)}
        </select>
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      {err && <span className="text-[11.5px] text-red-500 font-semibold">{err}</span>}
    </div>
  );
}

function PBtn({ children, loading, outline, full, type="button", onClick, className="" }) {
  if (outline) return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-primary-600 font-bold text-[13.5px] transition-all hover:bg-primary-50 hover:border-primary-200 ${full ? 'w-full' : 'w-auto'} ${className}`}>
      {children}
    </button>
  );
  return (
    <button type={type} onClick={onClick} className={`relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-none bg-gradient-to-br from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-[13.5px] transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 overflow-hidden group ${full ? 'w-full' : 'w-auto'} ${className}`}>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      {loading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin relative z-10">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2 w-full">{children}</span>
      )}
    </button>
  );
}

// ─── Left purple panel (same style as Login) ─────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden w-[45%] h-screen bg-slate-900 p-12">
      {/* Background photo */}
      <img
        src="/auth-bg.jpg"
        alt="Campus"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      
      {/* Dark gradient overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(30,0,60,.08) 0%, rgba(60,20,120,.12) 40%, rgba(60,20,100,.72) 70%, #2E0A5A 100%)"
        }}
      />

      {/* brand */}
      <div className="flex items-center gap-3 relative z-10 mb-auto">
        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
            <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/>
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-black text-white tracking-tight leading-none mb-1">Smart UniCompanion</div>
          <div className="text-[9.5px] font-bold text-white/50 tracking-[0.8px] uppercase">Campus Life Platform</div>
        </div>
      </div>
      {/* copy */}
      <div className="relative z-10 mt-auto">
        <h1 className="text-2xl font-black text-white tracking-tight leading-[1.15] mb-2">
          Join thousands of<br/>
          <span className="bg-gradient-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">Sri Lankan students.</span>
        </h1>
        <p className="text-[13px] text-white/70 leading-relaxed mb-4 max-w-[300px] font-medium">
          Personalised boardings, food and transport — for every Sri Lankan university.
        </p>
        <div className="flex gap-2">
          {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l])=>(
            <div key={l} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-2 px-1.5 text-center">
              <div className="text-lg font-black text-white leading-none mb-1">{v}</div>
              <div className="text-[10px] font-bold text-white/60 tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Register component ──────────────────────────────────────────────────
/* ─── Main component ──────────────────────────────────────────────────────────── */
export default function Register({ isChild }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({name:"",email:"",password:"",confirmPassword:"",university:"",town:"",yearOfStudy:"",role:"ROLE_STUDENT"});
  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [step, setStep]             = useState(1);
  const [ready, setReady]           = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [dir, setDir]               = useState("fwd");

  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const pwScore = (() => {
    const p=form.password; if(!p) return 0;
    return Math.min([p.length>=6,p.length>=10,/[A-Z]/.test(p),/[0-9]/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length,5);
  })();
  const pwCol=["","bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500","bg-emerald-600"];
  const pwText=["","text-red-500","text-orange-500","text-yellow-500","text-green-500","text-emerald-600"];
  const pwLbl=["","Too short","Weak","Fair","Good","Strong"];

  const v1=()=>{
    const e={};
    if(!form.name.trim()) e.name="Enter your full name.";
    else if(form.name.trim().length<3) e.name="At least 3 characters.";
    if(!form.email.trim()) e.email="Enter your email.";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Enter a valid email.";
    if(!form.password) e.password="Create a password.";
    else if(form.password.length<6) e.password="At least 6 characters.";
    if(!form.confirmPassword) e.confirmPassword="Confirm your password.";
    else if(form.password!==form.confirmPassword) e.confirmPassword="Passwords don't match.";
    return e;
  };
  const v2=()=>{
    const e={};
    if(!form.university) e.university="Select your university.";
    if(form.university&&!form.town) e.town="Select your town.";
    if(!form.yearOfStudy) e.yearOfStudy="Select your year.";
    return e;
  };

  const goNext=()=>{ const e=v1(); if(Object.keys(e).length){setErrors(e);return;} setErrors({}); setDir("fwd"); setStep(2); };
  const goBack=()=>{ setDir("back"); setStep(1); };
  const goLogin=()=>{ setLeaving(true); setTimeout(()=>navigate("/login"),360); };

  const handleSubmit=async(ev)=>{
    ev.preventDefault(); setServerError("");
    const e=v2(); if(Object.keys(e).length){setErrors(e);return;} setErrors({});
    setLoading(true);
    const {confirmPassword,...payload}=form;
    const res=await registerUser({...payload,area:form.town,yearOfStudy:Number(form.yearOfStudy)});
    setLoading(false);
    if(!res.success){setServerError(res.message);return;}
    setDir("fwd"); setStep(3);
  };

  const towns=(TOWNS[form.university]||[]).map(t=>({v:t,l:t}));

  const content = (
    <div className="w-full max-w-[420px]">

      <div className="mb-6">
        <button type="button" onClick={() => { setLeaving(true); setTimeout(() => navigate("/"), 360); }} className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-primary-600 transition-colors">
          &larr; Back to Home
        </button>
      </div>

      {/* step progress */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              {[1,2].map((n,i)=>(
                <div key={n} className={`flex items-center gap-2 transition-all duration-300 ${n === step ? 'flex-[2]' : 'flex-1'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 
                    ${step > n ? 'bg-primary-600 text-white' : 
                      step === n ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-[0_0_0_4px_rgba(8,145,178,0.15)]' : 
                      'bg-slate-100 text-slate-400'}`}>
                    {step > n ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : n}
                  </div>
                  {step === n && <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">{n === 1 ? "Account Details" : "Campus Setup"}</span>}
                  {i < 1 && <div className={`flex-1 h-0.5 rounded-full min-w-[20px] transition-colors duration-300 ${step > 1 ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                </div>
              ))}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50/80 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <span className="text-[13px] text-red-700 dark:text-red-400 font-bold">{serverError}</span>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className={`animate-${dir === "back" ? "slideRight" : "slideLeft"}`}>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Create account</h2>
              <p className="text-[13.5px] text-slate-500 font-medium mb-6">Start with your personal details.</p>
              
              <div className="flex flex-col gap-4">
                <FInput label="Full Name" placeholder="e.g. Kamal Perera" icon={<UserIcon size={16}/>} value={form.name} err={errors.name} onChange={e=>set("name",e.target.value)}/>
                <FInput label="Email" type="email" placeholder="yourname@uni.ac.lk" icon={<MailIcon size={16}/>} value={form.email} err={errors.email} onChange={e=>set("email",e.target.value)}/>
                
                <div>
                  <FInput label="Password" type={showPw?"text":"password"} placeholder="Min. 6 characters" icon={<LockIcon size={16}/>} value={form.password} err={errors.password} onChange={e=>set("password",e.target.value)}
                    suffix={
                      <button type="button" onClick={()=>setShowPw(p=>!p)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                        {showPw ? <EyeOffIcon size={15}/> : <EyeIcon size={15}/>}
                      </button>
                    }/>
                  {form.password.length > 0 && (
                    <div className="mt-2 text-left">
                      <div className="flex gap-1 mb-1.5">
                        {[1,2,3,4,5].map(i=>(
                          <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${i <= pwScore ? pwCol[pwScore] : "bg-slate-200 dark:bg-slate-700"}`} />
                        ))}
                      </div>
                      {pwScore > 0 && <span className={`text-[11px] font-bold ${pwText[pwScore]}`}>{pwLbl[pwScore]} password</span>}
                    </div>
                  )}
                </div>
                
                <FInput label="Confirm Password" type={showPw?"text":"password"} placeholder="Re-enter password" icon={<LockIcon size={16}/>} value={form.confirmPassword} err={errors.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)}/>
                
                <PBtn onClick={goNext} full className="mt-2">
                  Continue to Campus Setup
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </PBtn>
              </div>
              
              <p className="text-center text-[13.5px] font-medium text-slate-500 mt-6">
                Already have an account?{" "}
                <button onClick={goLogin} className="bg-transparent border-none text-primary-600 dark:text-primary-400 font-bold cursor-pointer p-0 hover:underline hover:text-primary-700">Sign in</button>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className={`animate-${dir === "back" ? "slideRight" : "slideLeft"}`}>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Campus setup</h2>
              <p className="text-[13.5px] text-slate-500 font-medium mb-6">This controls which listings you see.</p>
              
              <div className="flex flex-col gap-4">
                {/* university grouped select */}
                <div className="flex flex-col gap-1.5 w-full relative">
                  <span className={`text-[11px] font-bold tracking-[0.6px] uppercase transition-colors flex items-center gap-1.5 ${errors.university ? 'text-red-500' : 'text-slate-500'}`}>
                    <BuildingIcon size={13} className={errors.university ? "text-red-500" : "text-slate-400"} /> University
                  </span>
                  <div className="relative group">
                    <select 
                      value={form.university} 
                      onChange={e=>{set("university",e.target.value);set("town","");}}
                      className={`w-full rounded-xl text-[13.5px] font-medium outline-none appearance-none cursor-pointer transition-all duration-200 
                        pl-3.5 pr-10 py-2.5
                        ${errors.university 
                          ? 'bg-red-50/50 border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 hover:border-slate-300'
                        } border-2 ${!form.university ? 'text-slate-500' : 'text-slate-900'}`}
                    >
                      <option value="">Choose your university...</option>
                      <optgroup label="State Universities (UGC)">
                        {UNIS.filter(u=>u.type==="state").map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                      <optgroup label="Private / Degree-Awarding Institutes">
                        {UNIS.filter(u=>u.type==="private").map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                  {errors.university && <span className="text-[11.5px] text-red-500 font-semibold">{errors.university}</span>}
                </div>
                
                {/* town */}
                {form.university && <FSel label="Town / Area near campus" icon={<MapPinIcon size={15}/>} value={form.town} err={errors.town} onChange={e=>set("town",e.target.value)} opts={[{v:"",l:"Select area..."},...towns]}/>}
                
                {/* year */}
                <FSel label="Year of Study" value={form.yearOfStudy} err={errors.yearOfStudy} onChange={e=>set("yearOfStudy",e.target.value)} opts={YEARS}/>
                
                {/* preview */}
                {form.university && form.town && (
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-xl p-3 flex gap-3 items-center mt-1 shadow-sm">
                    <MapPinIcon size={16} className="text-primary-600 dark:text-primary-400"/>
                    <span className="text-[12.5px] text-primary-900 dark:text-primary-100 font-medium">
                      Listings near <strong className="font-bold">{form.town}</strong> &middot; {UNIS.find(u=>u.value===form.university)?.short}
                      {form.yearOfStudy && ` · Year ${form.yearOfStudy}`}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-3 mt-4">
                  <PBtn outline onClick={goBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Back
                  </PBtn>
                  <PBtn type="submit" full loading={loading}>Create my account</PBtn>
                </div>
              </div>
            </form>
          )}

          {/* ── STEP 3 success ── */}
          {step === 3 && (
            <div className="text-center py-4 animate-scaleUp">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 border-4 border-green-200 dark:border-green-800 rounded-full flex items-center justify-center mx-auto mb-5 animate-popIn">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" className="dark:stroke-green-400"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">You're all set!</h2>
              <p className="text-[13.5px] text-slate-500 font-medium leading-relaxed mb-8 max-w-[300px] mx-auto">
                Account created for <strong className="text-slate-900 dark:text-white">{form.town||"your campus"}</strong>. Sign in to explore listings.
              </p>
              <PBtn full onClick={()=>navigate("/login",{state:{registered:true}})}>
                Go to sign in
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </PBtn>
            </div>
          )}
    </div>
  );

  if (isChild) return content;

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <LeftPanel/>
      <div className={`flex-1 h-screen flex items-center justify-center p-6 md:p-10 transition-all duration-300 ease-out ${ready && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        {content}
      </div>
    </div>
  );
}
