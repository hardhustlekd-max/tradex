import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  QrCode, 
  Eye, 
  EyeOff, 
  Wallet, 
  ChevronDown,
  Globe,
  ArrowRight,
  Zap
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LoginPageProps {
  onLogin: (userInfo: { email: string; name: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Navigation & Auth Mode
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [inputMethod, setInputMethod] = useState<'email' | 'phone' | 'qr'>('email');
  
  // Form State
  const [email, setEmail] = useState('demo.trader@tradex.io');
  const [phoneCountry, setPhoneCountry] = useState('+1');
  const [phone, setPhone] = useState('5550192834');
  const [password, setPassword] = useState('demo123456');
  const [referralCode, setReferralCode] = useState('TRADEX-99');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setIsLoading(true);

    const initialName = inputMethod === 'email' 
      ? (email.split('@')[0] || 'Demo Trader')
      : `Trader_${phone.slice(-4)}`;

    setTimeout(() => {
      soundFx.playOrderFilled();
      onLogin({
        email: inputMethod === 'email' ? email : `${phone}@mobile.tradex.io`,
        name: initialName,
      });
    }, 500);
  };

  const handleQuickDemoLogin = () => {
    soundFx.playClick();
    setIsLoading(true);
    setTimeout(() => {
      soundFx.playOrderFilled();
      onLogin({
        email: 'demo.trader@tradex.io',
        name: 'Demo Trader',
      });
    }, 400);
  };

  const handleSimulateQrScan = () => {
    soundFx.playClick();
    setQrScanned(true);
    setIsLoading(true);
    setTimeout(() => {
      soundFx.playOrderFilled();
      onLogin({
        email: 'mobile.app@tradex.io',
        name: 'Mobile Trader',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0d1117] text-[#f0f3f8] flex flex-col justify-between select-none relative font-sans overflow-x-hidden">
      
      {/* Top Header Navigation Bar */}
      <header className="w-full h-14 border-b border-white/10 bg-[#0d1117]/90 px-4 sm:px-8 flex items-center justify-between shrink-0 relative z-20">
        {/* Brand Logo - pure white NEXUS text */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleQuickDemoLogin}>
          <div className="w-8 h-8 rounded-xl bg-[#00c076] text-white font-black text-base flex items-center justify-center shadow-md shadow-[#00c076]/20">
            N
          </div>
          <span className="text-base font-black tracking-widest text-white uppercase leading-none">
            NEXUS
          </span>
        </div>

        {/* Top Right Language / Currency */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300 bg-[#181a20] border border-white/10 px-2.5 py-1.5 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[#00c076]" />
            <span>EN / USD</span>
          </div>
        </div>
      </header>

      {/* Main Centered Auth Form Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 relative z-10 w-full">
        <div className="w-full max-w-[380px] sm:max-w-[400px]">
          
          {/* Main Auth Card */}
          <div className="liquid-card rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/10 bg-[#181a20] transition-all">
            
            {/* Main Auth Mode Tabs: Log In | Register */}
            <div className="flex items-center justify-start gap-6 border-b border-white/10 mb-5 pb-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMode('login');
                }}
                className={`relative pb-1 text-base font-bold transition-colors cursor-pointer ${
                  authMode === 'login' ? 'text-[#00c076]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Log In
                {authMode === 'login' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-[#00c076] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMode('register');
                }}
                className={`relative pb-1 text-base font-bold transition-colors cursor-pointer ${
                  authMode === 'register' ? 'text-[#00c076]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Register
                {authMode === 'register' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-[#00c076] rounded-full" />
                )}
              </button>
            </div>

            {/* Sub Method Selector: Email | Mobile | QR */}
            <div className="flex items-center gap-2 mb-5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setInputMethod('email');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMethod === 'email'
                    ? 'bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30 shadow-sm'
                    : 'bg-[#161b22] text-zinc-400 border border-white/5 hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setInputMethod('phone');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMethod === 'phone'
                    ? 'bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30 shadow-sm'
                    : 'bg-[#161b22] text-zinc-400 border border-white/5 hover:text-zinc-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setInputMethod('qr');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMethod === 'qr'
                    ? 'bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30 shadow-sm'
                    : 'bg-[#161b22] text-zinc-400 border border-white/5 hover:text-zinc-200'
                }`}
                title="QR Code Login"
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            {/* QR Code Tab View */}
            {inputMethod === 'qr' ? (
              <div className="text-center py-4 space-y-4">
                <div className="relative w-36 h-36 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center border-2 border-amber-400">
                  <QrCode className="w-28 h-28 text-black" />
                  {qrScanned && (
                    <div className="absolute inset-0 bg-black/85 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-xs">
                      Confirmed!
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSimulateQrScan}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl liquid-btn-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Scan to Log In</span>
                </button>
              </div>
            ) : (
              /* Email or Mobile Form View */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Email Input Field */}
                {inputMethod === 'email' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full h-10 px-3.5 bg-[#0e0b06] border border-amber-500/20 focus:border-amber-400 rounded-xl text-xs font-medium font-sans text-white placeholder:font-sans placeholder:text-zinc-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Phone Input Field */}
                {inputMethod === 'phone' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-22 shrink-0">
                        <select
                          value={phoneCountry}
                          onChange={(e) => setPhoneCountry(e.target.value)}
                          className="w-full h-10 pl-2.5 pr-6 bg-[#0e0b06] border border-amber-500/20 focus:border-amber-400 rounded-xl text-xs font-medium font-sans text-amber-300 appearance-none focus:outline-none cursor-pointer"
                        >
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+86">+86</option>
                          <option value="+62">+62</option>
                          <option value="+251">+251</option>
                          <option value="+81">+81</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          required
                          className="w-full h-10 px-3.5 bg-[#0e0b06] border border-amber-500/20 focus:border-amber-400 rounded-xl text-xs font-medium font-sans text-white placeholder:font-sans placeholder:text-zinc-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full h-10 pl-3.5 pr-9 bg-[#0e0b06] border border-amber-500/20 focus:border-amber-400 rounded-xl text-xs font-medium font-sans text-white placeholder:font-sans placeholder:text-zinc-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Referral Code (Shown on Register) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Referral Code"
                      className="w-full h-10 px-3.5 bg-[#0e0b06] border border-amber-500/20 focus:border-amber-400 rounded-xl text-xs font-medium font-sans text-amber-300 placeholder:font-sans placeholder:text-zinc-500 uppercase tracking-wider focus:outline-none"
                    />
                  </div>
                )}

                {/* Checkbox Options */}
                {authMode === 'login' ? (
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-amber-500/30 bg-[#0e0b06] text-amber-500 focus:ring-0 w-3.5 h-3.5 accent-amber-500"
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <span className="text-amber-400 font-medium hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                ) : (
                  <div className="text-xs py-0.5">
                    <label className="flex items-start gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                        className="rounded border-amber-500/30 bg-[#0e0b06] text-amber-500 focus:ring-0 w-3.5 h-3.5 accent-amber-500 mt-0.5"
                      />
                      <span className="text-zinc-400 font-medium leading-snug">
                        I agree to <span className="text-amber-400 underline">Terms</span> and <span className="text-amber-400 underline">Privacy</span>.
                      </span>
                    </label>
                  </div>
                )}

                {/* Main Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl liquid-btn-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all disabled:opacity-50 mt-1"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Log In' : 'Register'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Web3 & One-Click Login Options */}
            <div className="mt-5 pt-4 border-t border-amber-500/15 space-y-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full h-9.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Demo Account Log In</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full h-9.5 px-3 rounded-xl bg-[#0e0b06] hover:bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Connect Web3 Wallet</span>
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-amber-500/15 py-3 px-4 sm:px-6 text-center text-xs font-medium text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 bg-[#0a0805]">
        <div>
          © 2026 NEXUS. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-amber-400 cursor-pointer">Privacy</span>
          <span className="hover:text-amber-400 cursor-pointer">Terms</span>
          <span className="hover:text-amber-400 cursor-pointer">Support</span>
        </div>
      </footer>

    </div>
  );
};
