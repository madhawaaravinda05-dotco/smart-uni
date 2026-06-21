import { useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { UnifyLogoIcon } from "../components/Icons";

export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative flex">
      
      {/* Sliding Image Panel */}
      <div 
        className="hidden lg:flex flex-col absolute top-0 bottom-0 w-[45%] bg-slate-900 p-12 z-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ left: isRegister ? "55%" : "0%" }}
      >
        <img
          src="/auth-bg.jpg"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(30,0,60,.08) 0%, rgba(60,20,120,.12) 40%, rgba(60,20,100,.72) 70%, #2E0A5A 100%)"
          }}
        />

        {/* brand */}
        <div className="flex items-center gap-3 relative z-10 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
            <UnifyLogoIcon size={20} />
          </div>
          <div>
            <div className="text-[15px] font-black text-white tracking-tight leading-none mb-1">Unify</div>
            <div className="text-[9.5px] font-bold text-white/50 tracking-[0.8px] uppercase">Campus Life Platform</div>
          </div>
        </div>

        {/* copy */}
        <div className="relative z-10 mt-auto">
          <h1 className="text-2xl font-black text-white tracking-tight leading-[1.15] mb-2">
            Join thousands of<br/>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Sri Lankan students.</span>
          </h1>
          <p className="text-[12.5px] text-white/70 leading-relaxed mb-6 max-w-xs font-medium">
            Personalised boardings, food and transport — for every Sri Lankan university.
          </p>
          <div className="flex gap-2">
            {[["39+","Universities"],["2.4k","Students"],["500+","Listings"]].map(([v,l])=>(
              <div key={l} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-2 px-1 text-center">
                <div className="text-[16px] font-black text-white leading-none mb-1">{v}</div>
                <div className="text-[8.5px] font-bold text-white/60 tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forms Container */}
      <div 
        className="absolute top-0 bottom-0 w-full lg:w-[55%] flex transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 bg-slate-50 dark:bg-slate-900"
        style={{ left: isRegister ? "0%" : "45%" }}
      >
        <div className="w-full h-full relative overflow-hidden flex">
           {/* Login Form wrapper */}
           <div 
             className={`absolute inset-0 flex items-center justify-center p-6 md:p-12 overflow-y-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isRegister ? 'opacity-0 translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0 pointer-events-auto delay-100'}`}
           >
             <Login isChild />
           </div>

           {/* Register Form wrapper */}
           <div 
             className={`absolute inset-0 flex items-center justify-center p-6 md:p-12 overflow-y-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${!isRegister ? 'opacity-0 -translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0 pointer-events-auto delay-100'}`}
           >
             <Register isChild />
           </div>
        </div>
      </div>
    </div>
  );
}
