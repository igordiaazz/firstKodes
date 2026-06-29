import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="mt-auto w-full py-6">
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-zinc-500 flex-wrap">
        <span>made with luv by</span>
        <a
          href="https://github.com/igordiaazz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 transition-colors hover:text-purple-400"
        >
          Igor Dias
          <FontAwesomeIcon icon={faGithub} className="text-zinc-500" />
        </a>
      </div>
    </footer>
  );
}
