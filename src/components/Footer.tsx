import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto w-full py-6">
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-zinc-500">
        <span>made with luv by</span>
        <a
          href="https://github.com/igordiaazz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 transition-colors hover:text-purple-400"
        >
          Igor Dias
          <Github className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
