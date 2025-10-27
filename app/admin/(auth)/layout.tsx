import { Shield } from "lucide-react";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf62e_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf62e_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">E-Procurement</h1>
          </div>
          <p className="text-purple-300 mt-2 font-medium">Admin Portal</p>
        </div>
        
        {/* Auth Card with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-purple-500/30 rounded-2xl shadow-2xl p-8">
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
