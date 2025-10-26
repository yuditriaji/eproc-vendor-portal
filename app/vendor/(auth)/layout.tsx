import { Building2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Building2 className="w-10 h-10 text-primary-500" />
            <h1 className="text-3xl font-bold text-white">E-Procurement</h1>
          </div>
          <p className="text-slate-400 mt-2">Vendor Portal</p>
        </div>
        
        {/* Auth Card with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {children}
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} E-Procurement. All rights reserved.
        </p>
      </div>
    </div>
  );
}
