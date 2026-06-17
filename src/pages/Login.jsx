import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/api";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, ShieldCheckIcon, BuildingIcon, UnifyLogoIcon } from "../components/Icons";

/* ─── shared tiny components ───────────────────────────────────────────────── */
function PInput({ label, error, icon, suffix, ...p }) {
  return (
    <label className="flex flex-col gap-1.5 w-full relative">
      <span className={`text-[11px] font-bold tracking-[0.6px] uppercase transition-colors ${error ? 'text-red-500' : 'text-slate-500 focus-within:text-primary-600'}`}>
        {label}
      </span>
      <div className="relative group">
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`}>
            {icon}
          </span>
        )}
        <input 
          className={`w-full rounded-xl text-[13.5px] font-medium outline-none transition-all duration-200 
            ${icon ? 'pl-10' : 'pl-3.5'} 
            ${suffix ? 'pr-11' : 'pr-3.5'} py-2.5
            ${error 
              ? 'bg-red-50/50 border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 hover:border-slate-300'
            } border-2`}
          {...p} 
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-[11.5px] text-red-500 font-semibold">{error}</span>}
    </label>
  );
}

function PBtn({ children, loading, outline, full, type="button", onClick }) {
  if (outline) return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-primary-600 font-bold text-[13.5px] transition-all hover:bg-primary-50 hover:border-primary-200 ${full ? 'w-full' : 'w-auto'}`}>
      {children}
    </button>
  );
  return (
    <button type={type} onClick={onClick} className={`relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-none bg-gradient-to-br from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-[13.5px] transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 overflow-hidden group ${full ? 'w-full' : 'w-auto'}`}>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      {loading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin relative z-10">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
}

/* ─── decorative SVG panel ─────────────────────────────────────────────────── */
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
      <div className="flex items-center gap-3 mt-0 mb-auto relative z-10">
        <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
          <UnifyLogoIcon size={24} />
        </div>
        <div>
          <div className="text-[17px] font-black text-white tracking-tight leading-none mb-1">Unify</div>
          <div className="text-[10px] font-bold text-white/50 tracking-[0.8px] uppercase">Campus Life Platform</div>
        </div>
      </div>

      {/* headline + stats */}
      <div className="relative z-10 mt-auto mb-4">
        <h1 className="text-3xl font-black text-white tracking-tight leading-[1.15] mb-3">
          Your campus life,<br/>
          <span className="bg-gradient-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">simplified.</span>
        </h1>
        <p className="text-[13.5px] text-white/70 leading-relaxed mb-6 max-w-xs font-medium">
          Verified boardings, food spots and transport routes — for every Sri Lankan university student.
        </p>
        {/* mini stat chips */}
        <div className="flex gap-3">
          {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l])=>(
            <div key={l} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-2 text-center">
              <div className="text-xl font-black text-white leading-none mb-1.5">{v}</div>
              <div className="text-[10px] font-bold text-white/60 tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Login page ────────────────────────────────────────────────────────────── */
export default function Login({ isChild }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const [form, setForm]             = useState({ email:"", password:"" });
  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [ready, setReady]           = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    if (location.state?.registered) setSuccessMsg("Account created! Sign in to continue.");
  }, [location.state]);

  const goRegister = () => {
    setLeaving(true);
    setTimeout(() => navigate("/register"), 360);
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Please enter your password.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setServerError("");
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    const res = await loginUser(form); setLoading(false);
    if (!res.success) { setServerError(res.message); return; }
    login(res.data.user, res.data.token);
    const role = res.data.user.role;
    navigate(role === "ROLE_MASTER_ADMIN" ? "/master" : role === "ROLE_ADMIN" ? "/admin" : "/dashboard");
  };


  const content = (
    <div className="w-full max-w-[400px]">

      <div className="mb-6">
        <button type="button" onClick={() => { setLeaving(true); setTimeout(() => navigate("/"), 360); }} className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-primary-600 transition-colors">
          &larr; Back to Home
        </button>
      </div>

      {/* heading */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
          <span className="text-[11.5px] text-primary-700 dark:text-primary-400 font-bold">
            Available at 39+ universities
          </span>
        </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">Welcome back</h2>
            <p className="text-[13.5px] text-slate-500 font-medium">
              Sign in to your Unify account
            </p>
          </div>

          {/* success */}
          {successMsg && (
            <div className="bg-green-50/80 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-3.5 mb-5 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-green-400"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-[13px] text-green-700 dark:text-green-400 font-bold">{successMsg}</span>
            </div>
          )}

          {/* server error */}
          {serverError && (
            <div className="bg-red-50/80 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3.5 mb-5 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-red-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <span className="text-[13px] text-red-700 dark:text-red-400 font-bold">{serverError}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <PInput label="University Email" type="email" placeholder="yourname@uni.ac.lk"
              icon={<MailIcon size={16}/>} value={form.email} error={errors.email}
              onChange={e=>setForm({...form,email:e.target.value})}/>
            <PInput label="Password" type={showPw?"text":"password"} placeholder="Enter your password"
              icon={<LockIcon size={16}/>} value={form.password} error={errors.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              suffix={
                <button type="button" onClick={()=>setShowPw(p=>!p)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                  {showPw ? <EyeOffIcon size={15}/> : <EyeIcon size={15}/>}
                </button>
              }/>
            <div className="mt-2">
              <PBtn type="submit" full loading={loading}>Sign in to your account</PBtn>
            </div>
          </form>



      <p className="text-center text-[13.5px] font-medium text-slate-500 mt-8">
        Don't have an account?{" "}
        <button type="button" onClick={goRegister} className="bg-transparent border-none text-primary-600 dark:text-primary-400 font-bold cursor-pointer p-0 hover:underline hover:text-primary-700">
          Create one free &rarr;
        </button>
      </p>
    </div>
  );

  if (isChild) return content;

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      {/* left branding panel */}
      <LeftPanel />

      {/* right form area */}
      <div 
        className={`flex-1 flex items-center justify-center p-6 md:p-12 transition-all duration-300 ease-out
          ${ready && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
      >
        {content}
      </div>
    </div>
  );
}
