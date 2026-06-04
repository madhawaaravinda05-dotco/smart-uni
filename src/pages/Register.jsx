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
  const [f,setF] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={{fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:f?"#7C3AED":err?"#DC2626":"#6B7280"}}>{label}</span>
      <div style={{position:"relative"}}>
        {icon&&<span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:f?"#7C3AED":"#C4B5FD",display:"flex",pointerEvents:"none"}}>{icon}</span>}
        <input onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{width:"100%",padding:`10px ${suffix?"38px":"12px"} 10px ${icon?"36px":"12px"}`,
            border:`1.5px solid ${f?"#7C3AED":err?"#FCA5A5":"#DDD6FE"}`,borderRadius:10,
            fontSize:13,fontFamily:"inherit",background:err?"#FEF2F2":f?"#fff":"#F9F7FF",
            color:"#1E1B4B",outline:"none",transition:"all .15s",
            boxShadow:f?"0 0 0 3px rgba(124,58,237,.1)":"none"}} {...p}/>
        {suffix&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",display:"flex"}}>{suffix}</span>}
      </div>
      {err&&<span style={{fontSize:11,color:"#DC2626",fontWeight:500}}>{err}</span>}
    </div>
  );
}
function FSel({ label, err, icon, opts=[], ...p }) {
  const [f,setF] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={{fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:f?"#7C3AED":err?"#DC2626":"#6B7280"}}>{label}</span>
      <div style={{position:"relative"}}>
        {icon&&<span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:f?"#7C3AED":"#C4B5FD",display:"flex",pointerEvents:"none"}}>{icon}</span>}
        <select onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{width:"100%",padding:`10px 32px 10px ${icon?"36px":"12px"}`,
            border:`1.5px solid ${f?"#7C3AED":err?"#FCA5A5":"#DDD6FE"}`,borderRadius:10,
            fontSize:13,fontFamily:"inherit",appearance:"none",
            background:err?"#FEF2F2":f?"#fff":"#F9F7FF",
            color:p.value?"#1E1B4B":"#9CA3AF",outline:"none",cursor:"pointer",
            boxShadow:f?"0 0 0 3px rgba(124,58,237,.1)":"none",transition:"all .15s"}} {...p}>
          {opts.map(({v,l})=><option key={v} value={v}>{l}</option>)}
        </select>
        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#C4B5FD"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      {err&&<span style={{fontSize:11,color:"#DC2626",fontWeight:500}}>{err}</span>}
    </div>
  );
}
function PBtn({ children, loading, outline, full, type="button", onClick }) {
  const [h,setH]=useState(false);
  if (outline) return (
    <button type={type} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 18px",borderRadius:10,border:"1.5px solid #DDD6FE",background:h?"#EDE9FE":"#F5F3FF",color:"#7C3AED",fontFamily:"inherit",fontSize:13.5,fontWeight:600,cursor:"pointer",width:full?"100%":"auto",transition:"all .15s"}}>
      {children}
    </button>
  );
  return (
    <button type={type} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"11px 18px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${h?"#6D28D9":"#7C3AED"},${h?"#7C3AED":"#A855F7"})`,color:"#fff",fontFamily:"inherit",fontSize:13.5,fontWeight:700,cursor:loading?"wait":"pointer",width:full?"100%":"auto",transition:"all .2s",boxShadow:h?"0 8px 24px rgba(124,58,237,.4)":"0 4px 14px rgba(124,58,237,.25)"}}>
      {loading?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{animation:"rSpin .7s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>:children}
    </button>
  );
}

// ─── Left purple panel (same style as Login) ─────────────────────────────────
function LeftPanel() {
  return (
    <div style={{flex:"0 0 44%",height:"100vh",background:"linear-gradient(160deg,#4C1D95 0%,#7C3AED 45%,#9333EA 100%)",display:"flex",flexDirection:"column",padding:"36px 44px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-80px",right:"-80px",width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,.06)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-60px",left:"-60px",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>
      {/* brand */}
      <div style={{display:"flex",alignItems:"center",gap:11,zIndex:1,marginBottom:"auto"}}>
        <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.32)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
            <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/>
          </svg>
        </div>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:"#fff",letterSpacing:"-.2px"}}>Smart UniCompanion</div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,.45)",letterSpacing:".8px",textTransform:"uppercase"}}>Campus Life Platform</div>
        </div>
      </div>
      {/* illustration */}
      <svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",margin:"auto 0",filter:"drop-shadow(0 14px 28px rgba(0,0,0,.22))"}}>
        <ellipse cx="180" cy="208" rx="145" ry="11" fill="rgba(255,255,255,.07)"/>
        <rect x="80" y="88" width="200" height="116" rx="6" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.26)" strokeWidth="1.5"/>
        <rect x="118" y="48" width="124" height="46" rx="5" fill="rgba(255,255,255,.11)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
        <rect x="158" y="152" width="44" height="52" rx="4" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.32)" strokeWidth="1.5"/>
        <circle cx="197" cy="179" r="3" fill="rgba(255,255,255,.65)"/>
        {[92,128,162,198,232].map((x,i)=><rect key={i} x={x} y="102" width="21" height="17" rx="3" fill="rgba(255,255,255,.11)" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>)}
        {[92,128,232].map((x,i)=><rect key={i} x={x} y="130" width="21" height="17" rx="3" fill="rgba(255,255,255,.09)" stroke="rgba(255,255,255,.18)" strokeWidth="1"/>)}
        <line x1="180" y1="12" x2="180" y2="49" stroke="rgba(255,255,255,.45)" strokeWidth="2"/>
        <path d="M180 12 L206 24 L180 36 Z" fill="rgba(255,255,255,.38)"/>
        {/* check badge */}
        <circle cx="234" cy="190" r="21" fill="#16A34A" opacity=".92"/>
        <polyline points="224,190 232,199 246,180" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* books */}
        <rect x="28" y="168" width="13" height="25" rx="2" fill="#C4B5FD" opacity=".85"/>
        <rect x="43" y="164" width="13" height="29" rx="2" fill="#A78BFA"/>
        <rect x="58" y="172" width="13" height="21" rx="2" fill="#DDD6FE" opacity=".8"/>
        {[[26,40],[336,56],[348,146],[20,166],[306,36]].map(([cx,cy],i)=>(
          <g key={i} transform={`translate(${cx},${cy})`} opacity=".6">
            <circle r="2.5" fill="rgba(255,255,255,.7)"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="rgba(255,255,255,.35)" strokeWidth="1.2"/>
            <line x1="0" y1="-7" x2="0" y2="7" stroke="rgba(255,255,255,.35)" strokeWidth="1.2"/>
          </g>
        ))}
      </svg>
      {/* copy */}
      <div style={{zIndex:1}}>
        <h1 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.8px",lineHeight:1.15,marginBottom:8}}>
          Join thousands of<br/>
          <span style={{background:"linear-gradient(90deg,#E9D5FF,#C4B5FD)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Sri Lankan students.</span>
        </h1>
        <p style={{fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.7,marginBottom:16,maxWidth:300}}>
          Personalised boardings, food and transport — for every Sri Lankan university.
        </p>
        <div style={{display:"flex",gap:8}}>
          {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l])=>(
            <div key={l} style={{flex:1,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:11,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:17,fontWeight:900,color:"#fff",lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.55)",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Register component ──────────────────────────────────────────────────
export default function Register() {
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
  const pwCol=["","#EF4444","#F97316","#EAB308","#22C55E","#16A34A"];
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

  const formAnim={
    transition:"opacity .36s ease, transform .36s ease",
    opacity:ready&&!leaving?1:0,
    transform:leaving?"translateX(-40px)":ready?"translateX(0)":"translateX(-40px)",
  };

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",display:"flex",background:"#F4F0FF"}}>
      <LeftPanel/>

      {/* right form area */}
      <div style={{flex:1,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 40px",background:"#F4F0FF",...formAnim}}>
        <div style={{width:"100%",maxWidth:420}}>

          {/* step progress */}
          {step < 3 && (
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:22}}>
              {[1,2].map((n,i)=>(
                <div key={n} style={{display:"flex",alignItems:"center",gap:6,flex:n===step?2:1}}>
                  <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0,
                    background:step>n?"#7C3AED":step===n?"linear-gradient(135deg,#7C3AED,#A855F7)":"#EDE9FE",
                    color:step>=n?"#fff":"#C4B5FD",
                    boxShadow:step===n?"0 0 0 4px rgba(124,58,237,.15)":"none",
                    transition:"all .3s"}}>
                    {step>n
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : n}
                  </div>
                  {step===n&&<span style={{fontSize:12,fontWeight:700,color:"#7C3AED",whiteSpace:"nowrap"}}>{n===1?"Account Details":"Campus Setup"}</span>}
                  {i<1&&<div style={{flex:1,height:2,borderRadius:99,background:step>1?"#7C3AED":"#DDD6FE",transition:"background .4s",minWidth:20}}/>}
                </div>
              ))}
            </div>
          )}

          {serverError&&(
            <div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",borderRadius:11,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:9}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{fontSize:13,color:"#DC2626",fontWeight:500}}>{serverError}</span>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step===1&&(
            <div style={{animation:`${dir==="back"?"rSlideL":"rSlideR"} .28s ease both`}}>
              <h2 style={{fontSize:26,fontWeight:900,color:"#1E1B4B",letterSpacing:"-.5px",marginBottom:4}}>Create account</h2>
              <p style={{fontSize:13.5,color:"#6B7280",marginBottom:22}}>Start with your personal details.</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FInput label="Full Name" placeholder="e.g. Kamal Perera" icon={<UserIcon size={14}/>} value={form.name} err={errors.name} onChange={e=>set("name",e.target.value)}/>
                <FInput label="Email" type="email" placeholder="yourname@uni.ac.lk" icon={<MailIcon size={14}/>} value={form.email} err={errors.email} onChange={e=>set("email",e.target.value)}/>
                <div>
                  <FInput label="Password" type={showPw?"text":"password"} placeholder="Min. 6 characters" icon={<LockIcon size={14}/>} value={form.password} err={errors.password} onChange={e=>set("password",e.target.value)}
                    suffix={<button type="button" onClick={()=>setShowPw(p=>!p)} style={{background:"none",border:"none",color:"#C4B5FD",cursor:"pointer",display:"flex",padding:3}}>{showPw?<EyeOffIcon size={14}/>:<EyeIcon size={14}/>}</button>}/>
                  {form.password.length>0&&(
                    <div style={{marginTop:6}}>
                      <div style={{display:"flex",gap:2,marginBottom:3}}>
                        {[1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=pwScore?pwCol[pwScore]:"#EDE9FE",transition:"background .3s"}}/>)}
                      </div>
                      {pwScore>0&&<span style={{fontSize:11,fontWeight:700,color:pwCol[pwScore]}}>{pwLbl[pwScore]} password</span>}
                    </div>
                  )}
                </div>
                <FInput label="Confirm Password" type={showPw?"text":"password"} placeholder="Re-enter password" icon={<LockIcon size={14}/>} value={form.confirmPassword} err={errors.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)}/>
                <PBtn onClick={goNext} full style={{marginTop:4}}>
                  Continue to Campus Setup
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </PBtn>
              </div>
              <p style={{textAlign:"center",fontSize:13.5,color:"#6B7280",marginTop:18}}>
                Already have an account?{" "}
                <button onClick={goLogin} style={{background:"none",border:"none",color:"#7C3AED",fontWeight:700,fontSize:13.5,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Sign in</button>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step===2&&(
            <form onSubmit={handleSubmit} noValidate style={{animation:`${dir==="back"?"rSlideL":"rSlideR"} .28s ease both`}}>
              <h2 style={{fontSize:26,fontWeight:900,color:"#1E1B4B",letterSpacing:"-.5px",marginBottom:4}}>Campus setup</h2>
              <p style={{fontSize:13.5,color:"#6B7280",marginBottom:20}}>This controls which listings you see.</p>
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                {/* university grouped select */}
                <div>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:errors.university?"#DC2626":"#6B7280",display:"flex",alignItems:"center",gap:4,marginBottom:5}}>
                    <BuildingIcon size={11} color={errors.university?"#DC2626":"#6B7280"}/> University
                  </span>
                  <div style={{position:"relative"}}>
                    <select value={form.university} onChange={e=>{set("university",e.target.value);set("town","");}}
                      style={{width:"100%",padding:"10px 32px 10px 12px",border:`1.5px solid ${errors.university?"#FCA5A5":"#DDD6FE"}`,borderRadius:10,fontSize:13,fontFamily:"inherit",appearance:"none",background:errors.university?"#FEF2F2":"#F9F7FF",color:form.university?"#1E1B4B":"#9CA3AF",outline:"none",cursor:"pointer"}}>
                      <option value="">Choose your university...</option>
                      <optgroup label="State Universities (UGC)">
                        {UNIS.filter(u=>u.type==="state").map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                      <optgroup label="Private / Degree-Awarding Institutes">
                        {UNIS.filter(u=>u.type==="private").map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#C4B5FD"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                  {errors.university&&<span style={{fontSize:11,color:"#DC2626",fontWeight:500}}>{errors.university}</span>}
                </div>
                {/* town */}
                {form.university&&<FSel label="Town / Area near campus" icon={<MapPinIcon size={13}/>} value={form.town} err={errors.town} onChange={e=>set("town",e.target.value)} opts={[{v:"",l:"Select area..."},...towns]}/>}
                {/* year */}
                <FSel label="Year of Study" value={form.yearOfStudy} err={errors.yearOfStudy} onChange={e=>set("yearOfStudy",e.target.value)} opts={YEARS}/>
                {/* preview */}
                {form.university&&form.town&&(
                  <div style={{background:"linear-gradient(135deg,#F5F3FF,#F0FDF4)",border:"1.5px solid #DDD6FE",borderRadius:11,padding:"10px 13px",display:"flex",gap:9,alignItems:"center"}}>
                    <MapPinIcon size={14} color="#7C3AED"/>
                    <span style={{fontSize:12.5,color:"#1E1B4B",fontWeight:500}}>
                      Listings near <strong>{form.town}</strong> · {UNIS.find(u=>u.value===form.university)?.short}
                      {form.yearOfStudy&&` · Year ${form.yearOfStudy}`}
                    </span>
                  </div>
                )}
                <div style={{display:"flex",gap:9,marginTop:2}}>
                  <PBtn outline onClick={goBack}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Back
                  </PBtn>
                  <PBtn type="submit" full loading={loading}>Create my account</PBtn>
                </div>
              </div>
            </form>
          )}

          {/* ── STEP 3 success ── */}
          {step===3&&(
            <div style={{textAlign:"center",padding:"8px 0",animation:"rScale .4s ease both"}}>
              <div style={{width:72,height:72,background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",animation:"rCheck .5s .1s ease both"}}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{fontSize:24,fontWeight:900,color:"#1E1B4B",marginBottom:8}}>You're all set!</h2>
              <p style={{fontSize:13.5,color:"#6B7280",lineHeight:1.75,marginBottom:24,maxWidth:300,margin:"0 auto 24px"}}>
                Account created for <strong style={{color:"#1E1B4B"}}>{form.town||"your campus"}</strong>. Sign in to explore listings.
              </p>
              <PBtn full onClick={()=>navigate("/login",{state:{registered:true}})}>
                Go to sign in
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </PBtn>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes rSpin{to{transform:rotate(360deg)}}
        @keyframes rSlideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes rSlideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes rScale{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes rCheck{0%{transform:scale(0) rotate(-12deg);opacity:0}65%{transform:scale(1.12) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
      `}</style>
    </div>
  );
}
