export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-3 px-8 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-white">
        <span className="text-white">©</span>
        <span className="text-white">
          <span className="text-[#FFDF6B] font-semibold">Snowkap 2025</span>
        </span>
      </div>
      <a
        href="#"
        className="text-[#FFDF6B] hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Terms of Service
      </a>
    </footer>
  );
} 