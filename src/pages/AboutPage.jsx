import React from "react";
import { motion } from "framer-motion";
import PublicNavbar from "../components/PublicNavbar";
import {
  BuildingIcon,
  MapPinIcon,
  ShieldCheckIcon,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  MailIcon
} from "../components/Icons";

const TEAM_MEMBERS = [
  { 
    id: 1, 
    name: "Madhawa Aravinda", 
    role: "Creator, Lead Developer & Fullstack Dev", 
    description: "The visionary who conceptualized the idea and played a major role in developing the core system.",
    image: "/madhawa_aravinda.jpeg", 
    github: "https://github.com/madhawaaravinda05-dotco/", 
    linkedin: "https://www.linkedin.com/in/madhawa-aravinda-ab4bb8319/", 
    instagram: "https://www.instagram.com/aravinda_molagoda/", 
    email: "mailto:madhawaaravinda05@gmail.com" 
  },
  { 
    id: 2, 
    name: "Sacheera Nimesh", 
    role: "Lead Backend Developer", 
    description: "A skilled backend developer who played a crucial role in guiding the team to success.",
    image: "/sacheera_nimesh.jpeg", 
    github: "https://github.com/Sacheera127", 
    linkedin: "https://www.linkedin.com/in/sacheera-nimesh-38a5b638b/", 
    instagram: "https://www.instagram.com/sacheera_nimesh/", 
    email: "mailto:sacheeranimesh0513@gmail.com" 
  },
  { 
    id: 3, 
    name: "Chamath Jayasekara", 
    role: "Backend Developer", 
    description: "A talented backend developer dedicated to building robust and scalable systems.",
    image: "/chamath_jayasekara.jpeg", 
    github: "https://github.com/chamathjayasekara/", 
    linkedin: "https://www.linkedin.com/in/chamath-jayasekara-a5241a324/", 
    instagram: "https://www.instagram.com/chamath_frenzzy/", 
    email: "mailto:chamathgayanasara2002@gmail.com" 
  },
  { 
    id: 4, 
    name: "Yohan Wimalasooriya", 
    role: "Backend Developer", 
    description: "A passionate backend developer ensuring smooth operations behind the scenes.",
    image: "/Yohan.jpeg", 
    github: "https://github.com/YohanWimalasooriya/", 
    linkedin: "https://www.linkedin.com/in/yohan-wimalasooriya-692690390?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", 
    instagram: "https://www.instagram.com/_primeyohan?igsh=bjVhc3pkODRxd2w5%2F", 
    email: "mailto:yohanwimalasooriya0001@gmail.com" 
  },
  { 
    id: 5, 
    name: "Vikum Madhushanka", 
    role: "Backend Developer", 
    description: "A focused backend developer specializing in system logic and architecture.",
    image: "/Vikum.jpeg", 
    github: "https://github.com/Vikum-Madhushanka", 
    linkedin: "#", 
    instagram: "#", 
    email: "mailto:vikumworkml@gmail.com" 
  },
  { 
    id: 6, 
    name: "Vihangi Pabasara", 
    role: "Frontend Team Leader", 
    description: "A brilliant frontend developer who leads the team in creating engaging user interfaces.",
    image: "/vihagi.jpeg", 
    github: "https://github.com/vpb03", 
    linkedin: "https://www.linkedin.com/in/vihangipabasara?utm_source=share_via&utm_content=profile&utm_medium=member_ios", 
    instagram: "https://www.instagram.com/vihangi_pabasara?igsh=aGFja2c2NWtienYw&utm_source=qr", 
    email: "mailto:vpbrahmana@students.nsbm.ac.lk" 
  },
  { id: 7, name: "Student Seven", role: "Fullstack Dev", image: "https://i.pravatar.cc/150?img=17", github: "#", linkedin: "#", instagram: "#", email: "mailto:student7@example.com" },
  { id: 8, name: "Student Eight", role: "Marketing", image: "https://i.pravatar.cc/150?img=18", github: "#", linkedin: "#", instagram: "#", email: "mailto:student8@example.com" },
  { id: 9, name: "Student Nine", role: "Support Lead", image: "https://i.pravatar.cc/150?img=19", github: "#", linkedin: "#", instagram: "#", email: "mailto:student9@example.com" },
];

export default function AboutPage() {
  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      <PublicNavbar transparentOnTop={false} />

      {/* ── What is this / About Section ─────────────────────────────────────── */}
      <section id="about" className="pt-32 pb-24 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl font-black mb-6 tracking-tight">What is our goal?</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Finding a good boarding place, knowing the best local food spots, and figuring out the quickest bus routes shouldn't be a hassle. 
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                UniCompanion centralizes this information. We empower senior students to act as Campus Admins, verifying and maintaining a pristine directory of resources specific to their university, ensuring new students have a seamless transition into campus life.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <BuildingIcon size={32} className="text-primary-500 mb-4" />
                  <div className="text-3xl font-black mb-1">31+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Universities</div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <MapPinIcon size={32} className="text-indigo-500 mb-4" />
                  <div className="text-3xl font-black mb-1">1000+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Local Listings</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="aspect-square rounded-3xl border border-white/50 dark:border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                <img src="/campus_students.png" alt="University Students" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-8 right-8 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <ShieldCheckIcon size={28} className="text-green-500" />
                </motion.div>
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 left-8 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <BuildingIcon size={28} className="text-indigo-500" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Team Section ─────────────────────────────────────────────────────── */}
      <section id="team" className="py-24 px-6 relative z-10 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The passionate minds behind UniCompanion. We are a dedicated group of 9 students striving to make university life better for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/50 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="w-32 h-32 rounded-full mb-6 p-1 bg-gradient-to-tr from-primary-500 to-indigo-500 relative z-10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800" />
                </div>
                
                <h3 className="text-xl font-black mb-1 relative z-10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{member.name}</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 relative z-10 uppercase tracking-wide">{member.role}</p>

                {member.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 relative z-10 px-2 italic">"{member.description}"</p>
                )}

                <div className="flex items-center gap-3 relative z-10 mt-auto">
                  <a href={member.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors">
                    <GithubIcon size={18} />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors">
                    <LinkedinIcon size={18} />
                  </a>
                  <a href={member.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-500 transition-colors">
                    <InstagramIcon size={18} />
                  </a>
                  <a href={member.email} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-colors">
                    <MailIcon size={18} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <p>© 2026 UniCompanion. All rights reserved.</p>
      </footer>
    </div>
  );
}
