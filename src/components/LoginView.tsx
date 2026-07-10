import React, { useState } from "react";
import { Shield, User, Lock, Building, ArrowRight, Eye, EyeOff, Info } from "lucide-react";
import { UserRole } from "../types";
import { SYSTEM_USERS } from "../data";

interface LoginViewProps {
  users: UserRole[];
  userPasswords?: Record<string, string>;
  systemName?: string;
  logoText?: string;
  logoImage?: string;
  onLogin: (user: UserRole) => void;
}

export default function LoginView({ 
  users, 
  userPasswords, 
  systemName = "AMADJE - COMERCIO GERAL", 
  logoText = "A", 
  logoImage = "",
  onLogin 
}: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Por favor, introduza o utilizador ou e-mail.");
      return;
    }
    if (!password.trim()) {
      setError("Por favor, introduza a palavra-passe.");
      return;
    }

    // Lookup user in users by username or email
    const foundUser = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (foundUser) {
      // Allow login with verification against custom password map
      const correctPassword = userPasswords?.[foundUser.username] || "admin";
      if (password === correctPassword) {
        onLogin(foundUser);
      } else {
        setError("Palavra-passe incorreta.");
      }
    } else {
      setError("Credenciais incorretas. Utilize 'admin' e 'admin' para entrar.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white relative font-sans overflow-hidden animate-fade-in">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-6 z-10">
        
        {/* Unified Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center font-display font-black text-3xl text-white shadow-xl shadow-brand-500/20 overflow-hidden">
              {logoImage ? (
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                logoText
              )}
            </div>
            <div>
              <span className="text-xl font-display font-black tracking-tight block uppercase">{systemName}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">ERP Enterprise Angola</span>
            </div>
          </div>

          <div className="space-y-1 text-center border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-display font-bold text-white">Acesso ao ERP {systemName}</h3>
            <p className="text-xs text-slate-400">Introduza as suas credenciais para gerir o stock.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Nome de Utilizador ou E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin@vbsp.ao"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Palavra-passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduza a palavra-passe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white focus:outline-hidden focus:border-brand-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[11px] text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>Entrar no Sistema AMADJE</span>
              <ArrowRight size={14} />
            </button>

          </form>

          {/* Footer of card */}
          <div className="text-[10px] text-center text-slate-500 border-t border-slate-800/60 pt-4">
            <span>AMADJE Stock Management System v2.4.0 (Windows runtime environment)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
