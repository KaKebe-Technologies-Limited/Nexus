import Link from "next/link";
import { Button } from "../../components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Nexus</span>
          </div>

          {/* Styled Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-black text-white hover:bg-zinc-800 rounded-lg px-6 shadow-sm hover:shadow-md transition-all active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/office.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="relative z-10 flex flex-col items-center justify-center pt-20 pb-12 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl tracking-tight text-white">
            Nexus
          </h1>

          <p className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
            Streamlining Operations, Empowering Business
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="px-10 h-14 text-lg bg-white text-black hover:bg-slate-100 border-none rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Explore Modules
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="px-10 h-14 text-lg text-white border-white/40 hover:border-white hover:bg-white/10 bg-transparent rounded-xl backdrop-blur-sm transition-all"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
