import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        <div className="relative w-full h-full">
          {/* Replace with your actual image */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
          <Image
            src="/auth.png"
            alt="Authentication background"
            fill
            className="object-cover opacity-30"
            priority
          />

          {/* Logo */}
          <div className="absolute top-8 left-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">N</span>
              </div>
              <span className="text-white font-semibold text-xl">Nexus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
