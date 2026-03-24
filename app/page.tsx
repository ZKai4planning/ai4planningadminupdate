import { BlueprintBackground } from "@/components/blueprint-background";
import { BlueprintLeftSection } from "@/components/blueprint-left-section";
import { FloatingToolbar } from "@/components/floating-toolbar";
import { LoginFooter } from "@/components/login-footer";
import {ClientLogin} from "@/components/clientloginform";
import { LoginHeader } from "@/components/login-header";


export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      {/* <LoginHeader /> */}

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
        {/* Blueprint Background Elements */}
        <BlueprintBackground />

        {/* Login Container */}
        <div className="relative z-10 grid w-full max-w-[1000px] grid-cols-1 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:min-h-[600px] lg:grid-cols-12">
          {/* Left Section */}
           {/* <div className="hidden lg:block lg:col-span-5">
            <BlueprintLeftSection />
          </div> */}
          <BlueprintLeftSection />

          {/* Right Section - Login Form */}
          <ClientLogin />
          {/* <LoginForm /> */}
        </div>

        {/* Floating Toolbar */}
        <div className="hidden md:block">
          <FloatingToolbar />
        </div>
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  )
}
