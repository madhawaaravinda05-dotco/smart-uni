/**
 * Auth.jsx — Single-page Login + Register with slide transition.
 * Left panel: real photo background + purple gradient overlay.
 * Right panel: clean white form area (unchanged from original).
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/api";
import {
  MailIcon, LockIcon, EyeIcon, EyeOffIcon,
  UserIcon, ShieldCheckIcon, BuildingIcon, MapPinIcon, SucLogoIcon
} from "../components/Icons";

// ─── University data ──────────────────────────────────────────────────────────
const ST = [
  ["University of Moratuwa","UOM"],["University of Colombo","UOC"],
  ["University of Kelaniya","UOK"],["University of Peradeniya","UOP"],
  ["University of Sri Jayewardenepura","USJP"],["University of Jaffna","UOJ"],
  ["University of Ruhuna","UOR"],["Eastern University Sri Lanka","EUSL"],
  ["South Eastern University of Sri Lanka","SEUSL"],["Rajarata University of Sri Lanka","RUSL"],
  ["Sabaragamuwa University of Sri Lanka","SUSL"],["Wayamba University of Sri Lanka","WUSL"],
  ["Uva Wellassa University","UWU"],["Open University of Sri Lanka","OUSL"],
  ["General Sir John Kotelawala Defence University","KDU"],
];
const PV = [
  ["SLIIT","SLIIT"],["NSBM Green University","NSBM"],["APIIT Sri Lanka","APIIT"],
  ["Informatics Institute of Technology","IIT"],["CINEC Campus","CINEC"],
  ["Horizon Campus","Horizon"],["Esoft Metro Campus","Esoft"],
  ["ICBT Campus","ICBT"],["NIBM","NIBM"],
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
const YRS=[{v:"",l:"Select year..."},{v:"1",l:"Year 1 — First Year"},{v:"2",l:"Year 2 — Second Year"},{v:"3",l:"Year 3 — Third Year"},{v:"4",l:"Year 4 — Fourth Year"},{v:"5",l:"Year 5 — Postgraduate"}];

// ─── Shared primitives ────────────────────────────────────────────────────────
const P = "#7C3AED";

function Inp({ label, err, icon, suffix, ...p }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && (
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:".7px",
          textTransform:"uppercase", color: err?"#DC2626":"#6B7280" }}>
          {label}
        </span>
      )}
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:14, top:"50%",
            transform:"translateY(-50%)", color: f?P:"#C4B5FD",
            display:"flex", pointerEvents:"none", transition:"color .15s" }}>
            {icon}
          </span>
        )}
        <input
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{
            width:"100%",
            padding:`13px ${suffix?"42px":"15px"} 13px ${icon?"40px":"15px"}`,
            border: `1.5px solid ${f?P:err?"#FCA5A5":"#E5E7EB"}`,
            borderRadius:12, fontSize:14, fontFamily:"inherit",
            background: "#F9FAFB",
            color:"#111827", outline:"none", transition:"all .18s",
            boxShadow: f?`0 0 0 4px rgba(124,58,237,.1)`:"none",
          }}
          {...p}
        />
        {suffix && (
          <span style={{ position:"absolute", right:13, top:"50%",
            transform:"translateY(-50%)", display:"flex" }}>
            {suffix}
          </span>
        )}
      </div>
      {err && <span style={{ fontSize:11.5, color:"#DC2626", fontWeight:500 }}>{err}</span>}
    </div>
  );
}

function Sel({ label, err, icon, opts=[], ...p }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && (
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:".7px",
          textTransform:"uppercase", color:err?"#DC2626":"#6B7280" }}>
          {label}
        </span>
      )}
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:14, top:"50%",
            transform:"translateY(-50%)", color:f?P:"#C4B5FD",
            display:"flex", pointerEvents:"none" }}>
            {icon}
          </span>
        )}
        <select
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{
            width:"100%",
            padding:`13px 36px 13px ${icon?"40px":"15px"}`,
            border:`1.5px solid ${f?P:err?"#FCA5A5":"#E5E7EB"}`,
            borderRadius:12, fontSize:14, fontFamily:"inherit", appearance:"none",
            background:"#F9FAFB", color:p.value?"#111827":"#9CA3AF",
            outline:"none", cursor:"pointer", transition:"all .18s",
            boxShadow:f?`0 0 0 4px rgba(124,58,237,.1)`:"none",
          }}
          {...p}
        >
          {opts.map(({v,l})=><option key={v} value={v}>{l}</option>)}
        </select>
        <span style={{ position:"absolute", right:13, top:"50%",
          transform:"translateY(-50%)", pointerEvents:"none", color:"#C4B5FD" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      {err && <span style={{ fontSize:11.5, color:"#DC2626", fontWeight:500 }}>{err}</span>}
    </div>
  );
}

function Btn({ ch, loading, ghost, full, type="button", onClick }) {
  const [h, setH] = useState(false);
  if (ghost) return (
    <button type={type} onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
        gap:6, padding:"13px 22px", borderRadius:12,
        border:`1.5px solid #DDD6FE`,
        background:h?"#EDE9FE":"transparent", color:P,
        fontFamily:"inherit", fontSize:14, fontWeight:600,
        cursor:"pointer", width:full?"100%":"auto", transition:"all .15s" }}>
      {ch}
    </button>
  );
  return (
    <button type={type} onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
        gap:7, padding:"14px 22px", borderRadius:12, border:"none",
        background:`linear-gradient(135deg,${h?"#6D28D9":P},${h?P:"#9333EA"})`,
        color:"#fff", fontFamily:"inherit", fontSize:14, fontWeight:700,
        cursor:loading?"wait":"pointer",
        width:full?"100%":"auto", transition:"all .2s",
        boxShadow:h?"0 10px 28px rgba(124,58,237,.45)":"0 4px 16px rgba(124,58,237,.32)",
        transform:h?"translateY(-1px)":"none" }}>
      {loading
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2.5" strokeLinecap="round"
            style={{animation:"xSpin .7s linear infinite"}}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        : ch}
    </button>
  );
}

// ─── Left panel — photo bg + purple gradient overlay ──────────────────────────
function Left({ mode }) {
  const isL = mode === "login";
  return (
    <div className="hide-on-mobile" style={{
      flex:"0 0 44%", height:"100vh", position:"relative", overflow:"hidden",
      flexDirection:"column",
    }}>

      {/* ── Background photo ── */}
      <img
        src="/auth-bg.jpg"
        alt=""
        style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center top",
        }}
      />

      {/* ── Light overlay — clear image on top, dark only at bottom for text ── */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(to bottom, rgba(30,0,60,.08) 0%, rgba(60,20,120,.12) 40%, rgba(60,20,100,.72) 70%, #2E0A5A 100%)",
      }}/>

      {/* ── Content ── */}
      <div style={{
        position:"relative", zIndex:1, display:"flex", flexDirection:"column",
        height:"100%", padding:"36px 40px",
      }}>

        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <SucLogoIcon size={48} />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:"#fff", letterSpacing:"-.2px" }}>
              Smart UniCompanion
            </div>
            <div style={{ fontSize:9.5, color:"rgba(255,255,255,.55)", textTransform:"uppercase", letterSpacing:".8px" }}>
              Campus Life Platform
            </div>
          </div>
        </div>

        {/* Spacer pushes headline to bottom */}
        <div style={{ flex:1 }}/>

        {/* Headline block */}
        <div>
          <h1 style={{
            fontSize:32, fontWeight:900, color:"#fff",
            letterSpacing:"-1px", lineHeight:1.18, marginBottom:10,
          }}>
            {isL
              ? <>Your campus life,<br/><span style={{ color:"#DDD6FE" }}>simplified.</span></>
              : <>Join thousands of<br/>Sri Lankan students.</>
            }
          </h1>
          <p style={{
            fontSize:13.5, color:"rgba(255,255,255,.72)", lineHeight:1.75,
            marginBottom:24, maxWidth:320,
          }}>
            {isL
              ? "Verified boardings, food spots and transport routes — for every Sri Lankan university student."
              : "Personalised boardings, food and transport — for every Sri Lankan university."
            }
          </p>

          {/* Stat chips */}
          <div style={{ display:"flex", gap:8 }}>
            {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l]) => (
              <div key={l} style={{
                flex:1, background:"rgba(255,255,255,.15)",
                border:"1px solid rgba(255,255,255,.25)", borderRadius:12,
                padding:"11px 8px", textAlign:"center",
                backdropFilter:"blur(8px)",
              }}>
                <div style={{ fontSize:19, fontWeight:900, color:"#fff", lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10.5, color:"rgba(255,255,255,.65)", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Auth component ───────────────────────────────────────────────────────
export default function Auth() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [mode, setMode]   = useState(() => location.pathname === "/register" ? "register" : "login");
  const [slide, setSlide] = useState("idle");

  // login state
  const [lF, setLF] = useState({ email:"", password:"" });
  const [lE, setLE] = useState({});
  const [lSrv, setLSrv] = useState("");
  const [lLoad, setLLoad] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [ok, setOk] = useState(location.state?.registered ? "Account created! Sign in to continue." : "");

  // register state
  const [rF, setRF] = useState({ name:"", email:"", password:"", confirmPassword:"", university:"", town:"", yearOfStudy:"", role:"ROLE_STUDENT" });
  const [rE, setRE] = useState({});
  const [rSrv, setRSrv] = useState("");
  const [rLoad, setRLoad] = useState(false);
  const [showRP, setShowRP] = useState(false);
  const [step, setStep] = useState(1);
  const [sDir, setSDir] = useState("fwd");

  useEffect(()=>{ navigate(mode==="/register"?"/register":"/login",{replace:true}); },[mode]);

  const trans = (toMode, exitDir) => {
    const enterDir = exitDir === "left" ? "right" : "left";
    setSlide(`exit-${exitDir}`);
    setTimeout(()=>{ setMode(toMode); setSlide(`enter-${enterDir}`); }, 360);
    setTimeout(()=>setSlide("idle"), 680);
  };

  const goRegister = () => trans("register","left");
  const goLogin    = () => trans("login","right");

  const panelStyle = {
    transition: "opacity .34s ease, transform .34s cubic-bezier(.4,0,.2,1)",
    opacity:    slide==="exit-left"||slide==="exit-right"||slide==="enter-left"||slide==="enter-right" ? 0 : 1,
    transform:  slide==="exit-left"   ? "translateX(-56px)" :
                slide==="exit-right"  ? "translateX(56px)"  :
                slide==="enter-right" ? "translateX(56px)"  :
                slide==="enter-left"  ? "translateX(-56px)" : "translateX(0)",
  };

  // login helpers
  const lSet = (k,v)=>{ setLF(f=>({...f,[k]:v})); setLE(e=>({...e,[k]:""})); };
  const lVal = () => {
    const e={};
    if(!lF.email.trim()) e.email="Enter your email.";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lF.email)) e.email="Enter a valid email address.";
    if(!lF.password) e.password="Enter your password.";
    return e;
  };
  const doLogin = async(ev)=>{
    ev.preventDefault(); setLSrv("");
    const e=lVal(); if(Object.keys(e).length){setLE(e);return;}
    setLE({}); setLLoad(true);
    const res=await loginUser(lF); setLLoad(false);
    if(!res.success){setLSrv(res.message);return;}
    login(res.data.user);
    const r=res.data.user.role;
    navigate(r==="ROLE_MASTER_ADMIN"?"/master":r==="ROLE_ADMIN"?"/admin":"/dashboard");
  };

  // register helpers
  const rSet=(k,v)=>{setRF(f=>({...f,[k]:v}));setRE(e=>({...e,[k]:""}));};
  const pwS=(()=>{const p=rF.password;if(!p)return 0;return Math.min([p.length>=6,p.length>=10,/[A-Z]/.test(p),/[0-9]/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length,5);})();
  const pwC=["","#EF4444","#F97316","#EAB308","#22C55E","#16A34A"];
  const pwL=["","Too short","Weak","Fair","Good","Strong"];
  const rV1=()=>{const e={};if(!rF.name.trim())e.name="Enter your name.";else if(rF.name.trim().length<3)e.name="At least 3 characters.";if(!rF.email.trim())e.email="Enter your email.";else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rF.email))e.email="Enter a valid email.";if(!rF.password)e.password="Create a password.";else if(rF.password.length<6)e.password="At least 6 characters.";if(!rF.confirmPassword)e.confirmPassword="Confirm your password.";else if(rF.password!==rF.confirmPassword)e.confirmPassword="Passwords don't match.";return e;};
  const rV2=()=>{const e={};if(!rF.university)e.university="Select your university.";if(rF.university&&!rF.town)e.town="Select your area.";if(!rF.yearOfStudy)e.yearOfStudy="Select your year.";return e;};
  const goN=()=>{const e=rV1();if(Object.keys(e).length){setRE(e);return;}setRE({});setSDir("fwd");setStep(2);};
  const goB=()=>{setSDir("back");setStep(1);};
  const doReg=async(ev)=>{ev.preventDefault();setRSrv("");const e=rV2();if(Object.keys(e).length){setRE(e);return;}setRE({});setRLoad(true);const{confirmPassword,...pl}=rF;const res=await registerUser({...pl,area:rF.town,yearOfStudy:Number(rF.yearOfStudy)});setRLoad(false);if(!res.success){setRSrv(res.message);return;}setSDir("fwd");setStep(3);};
  const towns=(TOWNS[rF.university]||[]).map(t=>({v:t,l:t}));

  return (
    <div className="app-layout" style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#F9FAFB"}}>
      <Left mode={mode}/>

      {/* right sliding area */}
      <div className="main-content xScroll" style={{display:"flex",alignItems:"center",
        justifyContent:"center", ...panelStyle}}>

        <div style={{width:"100%",maxWidth:440}}>

          {/* ═══ LOGIN ═══ */}
          {mode==="login" && (
            <div>
              <div style={{marginBottom:28}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EDE9FE",
                  border:"1px solid #DDD6FE",borderRadius:99,padding:"4px 13px",marginBottom:16}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>
                  <span style={{fontSize:11.5,color:"#6D28D9",fontWeight:700}}>Available at 39+ universities</span>
                </div>
                <h2 style={{fontSize:30,fontWeight:900,color:"#111827",letterSpacing:"-.6px",lineHeight:1.15,marginBottom:6}}>Welcome back</h2>
                <p style={{fontSize:14,color:"#6B7280"}}>Sign in to your UniCompanion account</p>
              </div>

              {ok&&<div style={{background:"#F0FDF4",border:"1.5px solid #86EFAC",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:9}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg><span style={{fontSize:13.5,color:"#15803D",fontWeight:600}}>{ok}</span></div>}
              {lSrv&&<div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:9}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span style={{fontSize:13.5,color:"#DC2626",fontWeight:500}}>{lSrv}</span></div>}

              <form onSubmit={doLogin} style={{display:"flex",flexDirection:"column",gap:16}} noValidate>
                <Inp label="University Email" type="email" placeholder="yourname@uni.ac.lk"
                  icon={<MailIcon size={15}/>} value={lF.email} err={lE.email}
                  onChange={e=>lSet("email",e.target.value)}/>
                <Inp label="Password" type={showPw?"text":"password"} placeholder="Enter your password"
                  icon={<LockIcon size={15}/>} value={lF.password} err={lE.password}
                  onChange={e=>lSet("password",e.target.value)}
                  suffix={<button type="button" onClick={()=>setShowPw(x=>!x)} style={{background:"none",border:"none",color:"#C4B5FD",cursor:"pointer",display:"flex",padding:4}}>{showPw?<EyeOffIcon size={15}/>:<EyeIcon size={15}/>}</button>}/>
                <Btn type="submit" full loading={lLoad} ch={<>Sign in to your account</>}/>
              </form>

              <p style={{textAlign:"center",fontSize:14,color:"#6B7280",marginTop:22}}>
                Don't have an account?{" "}
                <button onClick={goRegister} style={{background:"none",border:"none",color:P,fontWeight:700,fontSize:14,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Create one free →</button>
              </p>
            </div>
          )}

          {/* ═══ REGISTER ═══ */}
          {mode==="register" && (
            <div>
              {step<3&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
                  {[1,2].map((n,i)=>(
                    <div key={n} style={{display:"flex",alignItems:"center",gap:8,flex:n===step?2:1}}>
                      <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0,
                        background:step>n?P:step===n?`linear-gradient(135deg,${P},#9333EA)`:"#EDE9FE",
                        color:step>=n?"#fff":"#A78BFA",
                        boxShadow:step===n?"0 0 0 4px rgba(124,58,237,.15)":"none",transition:"all .3s"}}>
                        {step>n?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>:n}
                      </div>
                      {step===n&&<span style={{fontSize:12.5,fontWeight:700,color:P,whiteSpace:"nowrap"}}>{n===1?"Account Details":"Campus Setup"}</span>}
                      {i<1&&<div style={{flex:1,height:2,borderRadius:99,background:step>1?P:"#E5E7EB",transition:"background .4s",minWidth:24}}/>}
                    </div>
                  ))}
                </div>
              )}

              {rSrv&&<div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",borderRadius:12,padding:"11px 15px",marginBottom:16,display:"flex",alignItems:"center",gap:9}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span style={{fontSize:13,color:"#DC2626",fontWeight:500}}>{rSrv}</span></div>}

              {step===1&&(
                <div style={{animation:`${sDir==="back"?"xL":"xR"} .26s ease both`}}>
                  <h2 style={{fontSize:28,fontWeight:900,color:"#111827",letterSpacing:"-.5px",marginBottom:4}}>Create account</h2>
                  <p style={{fontSize:14,color:"#6B7280",marginBottom:22}}>Start with your personal details.</p>
                  <div style={{display:"flex",flexDirection:"column",gap:15}}>
                    <Inp label="Full Name" placeholder="e.g. Kamal Perera" icon={<UserIcon size={15}/>} value={rF.name} err={rE.name} onChange={e=>rSet("name",e.target.value)}/>
                    <Inp label="Email" type="email" placeholder="yourname@uni.ac.lk" icon={<MailIcon size={15}/>} value={rF.email} err={rE.email} onChange={e=>rSet("email",e.target.value)}/>
                    <div>
                      <Inp label="Password" type={showRP?"text":"password"} placeholder="Min. 6 characters" icon={<LockIcon size={15}/>} value={rF.password} err={rE.password} onChange={e=>rSet("password",e.target.value)}
                        suffix={<button type="button" onClick={()=>setShowRP(x=>!x)} style={{background:"none",border:"none",color:"#C4B5FD",cursor:"pointer",display:"flex",padding:4}}>{showRP?<EyeOffIcon size={15}/>:<EyeIcon size={15}/>}</button>}/>
                      {rF.password.length>0&&<div style={{marginTop:6}}><div style={{display:"flex",gap:2,marginBottom:3}}>{[1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=pwS?pwC[pwS]:"#E5E7EB",transition:"background .3s"}}/>)}</div>{pwS>0&&<span style={{fontSize:11,fontWeight:700,color:pwC[pwS]}}>{pwL[pwS]} password</span>}</div>}
                    </div>
                    <Inp label="Confirm Password" type={showRP?"text":"password"} placeholder="Re-enter password" icon={<LockIcon size={15}/>} value={rF.confirmPassword} err={rE.confirmPassword} onChange={e=>rSet("confirmPassword",e.target.value)}/>
                    <Btn onClick={goN} full ch={<>Continue to Campus Setup <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></>}/>
                  </div>
                  <p style={{textAlign:"center",fontSize:14,color:"#6B7280",marginTop:18}}>Already have an account?{" "}<button onClick={goLogin} style={{background:"none",border:"none",color:P,fontWeight:700,fontSize:14,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Sign in</button></p>
                </div>
              )}

              {step===2&&(
                <form onSubmit={doReg} noValidate style={{animation:`${sDir==="back"?"xL":"xR"} .26s ease both`}}>
                  <h2 style={{fontSize:28,fontWeight:900,color:"#111827",letterSpacing:"-.5px",marginBottom:4}}>Campus setup</h2>
                  <p style={{fontSize:14,color:"#6B7280",marginBottom:20}}>This controls which listings you'll see.</p>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div>
                      <span style={{fontSize:11,fontWeight:700,letterSpacing:".7px",textTransform:"uppercase",color:rE.university?"#DC2626":"#6B7280",display:"flex",alignItems:"center",gap:4,marginBottom:6}}><BuildingIcon size={11} color={rE.university?"#DC2626":"#6B7280"}/> University</span>
                      <div style={{position:"relative"}}>
                        <select value={rF.university} onChange={e=>{rSet("university",e.target.value);rSet("town","");}}
                          style={{width:"100%",padding:"13px 32px 13px 14px",border:`1.5px solid ${rE.university?"#FCA5A5":"#E5E7EB"}`,borderRadius:12,fontSize:14,fontFamily:"inherit",appearance:"none",background:"#F9FAFB",color:rF.university?"#111827":"#9CA3AF",outline:"none",cursor:"pointer"}}>
                          <option value="">Choose your university...</option>
                          <optgroup label="State Universities (UGC)">{ST.map(([n,s])=><option key={n} value={n}>{n} ({s})</option>)}</optgroup>
                          <optgroup label="Private / Degree-Awarding">{PV.map(([n,s])=><option key={n} value={n}>{n} ({s})</option>)}</optgroup>
                        </select>
                        <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#C4B5FD"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>
                      </div>
                      {rE.university&&<span style={{fontSize:11.5,color:"#DC2626",fontWeight:500,marginTop:4,display:"block"}}>{rE.university}</span>}
                    </div>
                    {rF.university&&<Sel label="Town / Area near campus" icon={<MapPinIcon size={14}/>} value={rF.town} err={rE.town} onChange={e=>rSet("town",e.target.value)} opts={[{v:"",l:"Select area..."},...towns]}/>}
                    <Sel label="Year of Study" value={rF.yearOfStudy} err={rE.yearOfStudy} onChange={e=>rSet("yearOfStudy",e.target.value)} opts={YRS}/>
                    {rF.university&&rF.town&&(
                      <div style={{background:"linear-gradient(135deg,#F5F3FF,#F0FDF4)",border:"1.5px solid #DDD6FE",borderRadius:12,padding:"11px 14px",display:"flex",gap:9,alignItems:"center"}}>
                        <MapPinIcon size={14} color={P}/><span style={{fontSize:13,color:"#111827",fontWeight:500}}>Listings near <strong>{rF.town}</strong>{rF.yearOfStudy&&` · Year ${rF.yearOfStudy}`}</span>
                      </div>
                    )}
                    <div style={{display:"flex",gap:9}}>
                      <Btn ghost onClick={goB} ch={<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg> Back</>}/>
                      <Btn type="submit" full loading={rLoad} ch={<>Create my account</>}/>
                    </div>
                  </div>
                </form>
              )}

              {step===3&&(
                <div style={{textAlign:"center",padding:"16px 0 8px",animation:"xScale .4s ease both"}}>
                  <div style={{width:76,height:76,background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",animation:"xCheck .5s .1s ease both"}}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{fontSize:26,fontWeight:900,color:"#111827",marginBottom:8}}>You're all set!</h2>
                  <p style={{fontSize:14,color:"#6B7280",lineHeight:1.75,maxWidth:320,margin:"0 auto 24px"}}>Account created for <strong style={{color:"#111827"}}>{rF.town||"your campus"}</strong>. Sign in to explore listings.</p>
                  <Btn full onClick={()=>{setOk("Account created! Sign in to continue."); goLogin();}} ch={<>Go to sign in <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></>}/>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes xSpin{to{transform:rotate(360deg)}}
        @keyframes xR{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes xL{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes xScale{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes xCheck{0%{transform:scale(0) rotate(-12deg);opacity:0}65%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        .xScroll::-webkit-scrollbar{display:none}
        .xScroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
