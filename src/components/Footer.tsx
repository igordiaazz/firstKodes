import { Github, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto w-full py-6">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Terminal size={14} className="text-purple-400" />
          <span className="font-medium text-zinc-500">
            first<span className="text-purple-400">Kodes</span>
          </span>
          <span className="hidden text-zinc-700 sm:inline">&bull;</span>
          <span className="hidden text-zinc-600 sm:inline">
            Sua jornada na programação
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-zinc-500">
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
      </div>
    </footer>
  );
}
