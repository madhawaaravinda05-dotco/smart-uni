import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/api";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, ShieldCheckIcon, BuildingIcon } from "../components/Icons";

/* ─── shared tiny components ───────────────────────────────────────────────── */
function PInput({ label, error, icon, suffix, ...p }) {
  const [f, setF] = useState(false);
  return (
    <label style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:".6px", textTransform:"uppercase",
        color: f ? "#7C3AED" : error ? "#DC2626" : "#6B7280", transition:"color .15s" }}>{label}</span>
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
          color: f ? "#7C3AED" : "#C4B5FD", display:"flex", pointerEvents:"none" }}>{icon}</span>}
        <input onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{ width:"100%",
            padding: `11px ${suffix?"40px":"13px"} 11px ${icon?"38px":"13px"}`,
            border: `1.5px solid ${f?"#7C3AED":error?"#FCA5A5":"#DDD6FE"}`,
            borderRadius:10, fontSize:13.5, fontFamily:"inherit",
            background: error?"#FEF2F2" : f?"#fff":"#F9F7FF",
            color:"#1E1B4B", outline:"none", transition:"all .15s",
            boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none" }} {...p}/>
        {suffix && <span style={{ position:"absolute", right:12, top:"50%",
          transform:"translateY(-50%)", display:"flex" }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize:11.5, color:"#DC2626", fontWeight:500 }}>{error}</span>}
    </label>
  );
}

function PBtn({ children, loading, outline, full, type="button", onClick }) {
  const [hov, setHov] = useState(false);
  if (outline) return (
    <button type={type} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
        padding:"10px 20px", borderRadius:10, border:"1.5px solid #DDD6FE",
        background: hov?"#EDE9FE":"#F5F3FF", color:"#7C3AED",
        fontFamily:"inherit", fontSize:13.5, fontWeight:600, cursor:"pointer",
        width:full?"100%":"auto", transition:"all .15s" }}>
      {children}
    </button>
  );
  return (
    <button type={type} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
        padding:"12px 20px", borderRadius:10, border:"none",
        background: `linear-gradient(135deg,${hov?"#6D28D9":"#7C3AED"},${hov?"#7C3AED":"#A855F7"})`,
        color:"#fff", fontFamily:"inherit", fontSize:13.5, fontWeight:700, cursor:"pointer",
        width:full?"100%":"auto", transition:"all .2s",
        boxShadow: hov?"0 8px 24px rgba(124,58,237,.45)":"0 4px 14px rgba(124,58,237,.3)" }}>
      {loading
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" style={{animation:"spin .7s linear infinite"}}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        : children}
    </button>
  );
}

/* ─── decorative SVG panel ─────────────────────────────────────────────────── */
function LeftPanel() {
  return (
    <div style={{ flex:"0 0 44%", height:"100vh", background:"linear-gradient(160deg,#4C1D95 0%,#7C3AED 45%,#9333EA 100%)",
      display:"flex", flexDirection:"column", padding:"40px 44px", position:"relative", overflow:"hidden" }}>

      {/* decorative circles */}
      <div style={{ position:"absolute", top:"-80px", right:"-80px", width:320, height:320,
        borderRadius:"50%", background:"rgba(255,255,255,.06)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-60px", left:"-60px", width:260, height:260,
        borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"38%", right:"10%", width:180, height:180,
        borderRadius:"50%", background:"rgba(255,255,255,.05)", pointerEvents:"none" }}/>

      {/* brand */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"auto", zIndex:1 }}>
        <div style={{ width:42, height:42, borderRadius:13, background:"rgba(255,255,255,.2)",
          border:"1px solid rgba(255,255,255,.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
            <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/>
            <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#fff", letterSpacing:"-.3px" }}>Smart UniCompanion</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", letterSpacing:".8px", textTransform:"uppercase" }}>Campus Life Platform</div>
        </div>
      </div>

      {/* main illustration — SVG university scene */}
      <svg viewBox="0 0 380 260" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width:"100%", maxWidth:380, margin:"auto 0", filter:"drop-shadow(0 20px 40px rgba(0,0,0,.25))" }}>
        {/* ground */}
        <ellipse cx="190" cy="245" rx="160" ry="14" fill="rgba(255,255,255,.08)"/>
        {/* main building */}
        <rect x="80" y="100" width="220" height="140" rx="6" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
        {/* roof / top block */}
        <rect x="120" y="56" width="140" height="52" rx="5" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
        {/* door */}
        <rect x="168" y="170" width="44" height="70" rx="4" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.38)" strokeWidth="1.5"/>
        <circle cx="207" cy="207" r="3" fill="rgba(255,255,255,.7)"/>
        {/* windows row 1 */}
        {[92,132,174,216,256].map((x,i)=>(
          <rect key={i} x={x} y="116" width="24" height="20" rx="3" fill="rgba(255,255,255,.13)" stroke="rgba(255,255,255,.25)" strokeWidth="1"/>
        ))}
        {/* windows row 2 */}
        {[92,132,256].map((x,i)=>(
          <rect key={i} x={x} y="148" width="24" height="20" rx="3" fill="rgba(255,255,255,.11)" stroke="rgba(255,255,255,.22)" strokeWidth="1"/>
        ))}
        {/* flag */}
        <line x1="190" y1="18" x2="190" y2="57" stroke="rgba(255,255,255,.5)" strokeWidth="2"/>
        <path d="M190 18 L218 28 L190 38 Z" fill="rgba(255,255,255,.4)"/>
        {/* books left */}
        <rect x="32" y="196" width="16" height="28" rx="2" fill="#C4B5FD" opacity=".85"/>
        <rect x="50" y="192" width="16" height="32" rx="2" fill="#A78BFA"/>
        <rect x="68" y="200" width="16" height="24" rx="2" fill="#DDD6FE" opacity=".8"/>
        {/* grad cap right */}
        <ellipse cx="314" cy="208" rx="24" ry="7" fill="rgba(255,255,255,.28)"/>
        <path d="M314 188 L338 208 H290 Z" fill="rgba(255,255,255,.22)"/>
        <line x1="338" y1="208" x2="338" y2="222" stroke="rgba(255,255,255,.4)" strokeWidth="2"/>
        <circle cx="338" cy="224" r="3" fill="rgba(255,255,255,.55)"/>
        {/* sparkles */}
        {[[30,46],[342,62],[352,155],[24,175],[300,42]].map(([cx,cy],i)=>(
          <g key={i} transform={`translate(${cx},${cy})`} opacity=".65">
            <circle r="2.5" fill="rgba(255,255,255,.7)"/>
            <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(255,255,255,.35)" strokeWidth="1.2"/>
            <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(255,255,255,.35)" strokeWidth="1.2"/>
          </g>
        ))}
      </svg>

      {/* headline + stats */}
      <div style={{ zIndex:1 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:"-0.8px",
          lineHeight:1.15, marginBottom:10 }}>
          Your campus life,<br/>
          <span style={{ background:"linear-gradient(90deg,#E9D5FF,#C4B5FD)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>simplified.</span>
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:20, maxWidth:320 }}>
          Verified boardings, food spots and transport routes — for every Sri Lankan university student.
        </p>
        {/* mini stat chips */}
        <div style={{ display:"flex", gap:10 }}>
          {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l])=>(
            <div key={l} style={{ flex:1, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)",
              borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#fff", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.55)", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Login page ────────────────────────────────────────────────────────────── */
export default function Login() {
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
  }, []);

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

  const demoLogin = (key) => {
    const D = {
      student: { user:{ name:"Kamal Perera", email:"kamal@mrt.ac.lk", role:"ROLE_STUDENT", university:"University of Moratuwa", area:"Katubedda", yearOfStudy:2 }, token:"demo-student" },
      admin:   { user:{ name:"Admin Silva",  email:"admin@mrt.ac.lk",  role:"ROLE_ADMIN",  university:"University of Moratuwa", area:"Katubedda" }, token:"demo-admin" },
      master:  { user:{ name:"Master Admin", email:"master@uni.lk",    role:"ROLE_MASTER_ADMIN", university:"All Universities", area:"National" }, token:"demo-master" },
    };
    const d = D[key]; login(d.user, d.token);
    navigate(key === "master" ? "/master" : key === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", display:"flex",
      background:"#F4F0FF" }}>

      {/* left branding panel */}
      <LeftPanel />

      {/* right form area */}
      <div style={{ flex:1, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        padding:"32px 40px", background:"#F4F0FF",
        transition:"opacity .36s ease, transform .36s ease",
        opacity: ready && !leaving ? 1 : 0,
        transform: leaving ? "translateX(40px)" : ready ? "translateX(0)" : "translateX(40px)" }}>

        <div style={{ width:"100%", maxWidth:400 }}>

          {/* heading */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7,
              background:"#EDE9FE", border:"1px solid #DDD6FE", borderRadius:99,
              padding:"4px 13px", marginBottom:14 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E",
                boxShadow:"0 0 6px #22C55E" }}/>
              <span style={{ fontSize:11.5, color:"#6D28D9", fontWeight:700 }}>
                Available at 39+ universities
              </span>
            </div>
            <h2 style={{ fontSize:28, fontWeight:900, color:"#1E1B4B", letterSpacing:"-.6px",
              lineHeight:1.15, marginBottom:6 }}>Welcome back</h2>
            <p style={{ fontSize:13.5, color:"#6B7280" }}>
              Sign in to your UniCompanion account
            </p>
          </div>

          {/* success */}
          {successMsg && (
            <div style={{ background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:12,
              padding:"11px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:9 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A"
                strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:13, color:"#15803D", fontWeight:600 }}>{successMsg}</span>
            </div>
          )}

          {/* server error */}
          {serverError && (
            <div style={{ background:"#FEF2F2", border:"1.5px solid #FCA5A5", borderRadius:12,
              padding:"11px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:9 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626"
                strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize:13, color:"#DC2626", fontWeight:500 }}>{serverError}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }} noValidate>
            <PInput label="University Email" type="email" placeholder="yourname@uni.ac.lk"
              icon={<MailIcon size={14}/>} value={form.email} error={errors.email}
              onChange={e=>setForm({...form,email:e.target.value})}/>
            <PInput label="Password" type={showPw?"text":"password"} placeholder="Enter your password"
              icon={<LockIcon size={14}/>} value={form.password} error={errors.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              suffix={
                <button type="button" onClick={()=>setShowPw(p=>!p)}
                  style={{ background:"none", border:"none", color:"#C4B5FD", cursor:"pointer",
                    display:"flex", padding:3, borderRadius:6 }}>
                  {showPw ? <EyeOffIcon size={14}/> : <EyeIcon size={14}/>}
                </button>
              }/>
            <PBtn type="submit" full loading={loading}>Sign in to your account</PBtn>
          </form>

          {/* divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"#DDD6FE" }}/>
            <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase",
              letterSpacing:".6px", whiteSpace:"nowrap" }}>or try a demo</span>
            <div style={{ flex:1, height:1, background:"#DDD6FE" }}/>
          </div>

          {/* demo buttons */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { key:"student", label:"Student",      Icon:UserIcon,        color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE" },
              { key:"admin",   label:"Campus Admin",  Icon:ShieldCheckIcon, color:"#16A34A", bg:"#F0FDF4", border:"#86EFAC" },
              { key:"master",  label:"Master Admin",  Icon:BuildingIcon,    color:"#EA580C", bg:"#FFF7ED", border:"#FED7AA" },
            ].map(({key,label,Icon,color,bg,border})=>(
              <button key={key} onClick={()=>demoLogin(key)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                  borderRadius:11, border:`1.5px solid ${border}`, background:bg,
                  cursor:"pointer", fontFamily:"inherit", transition:"all .18s",
                  textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 4px 16px ${color}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <div style={{ width:30, height:30, borderRadius:9, background:"rgba(255,255,255,.8)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={14} color={color}/>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color, flex:1 }}>Continue as {label}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color}
                  strokeWidth="2.5" strokeLinecap="round" opacity=".5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}
          </div>

          <p style={{ textAlign:"center", fontSize:13.5, color:"#6B7280", marginTop:22 }}>
            Don't have an account?{" "}
            <button onClick={goRegister}
              style={{ background:"none", border:"none", color:"#7C3AED", fontWeight:700,
                fontSize:13.5, cursor:"pointer", padding:0, fontFamily:"inherit" }}>
              Create one free →
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
