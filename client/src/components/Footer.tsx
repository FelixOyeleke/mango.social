import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-lg mb-2">Mango</h3>
            <p className="text-sm text-gray-400">
              Connecting immigrants worldwide
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <Link to="/forum" className="text-gray-400 hover:text-white transition-colors">
              Feed
            </Link>
            <Link to="/communities" className="text-gray-400 hover:text-white transition-colors">
              Communities
            </Link>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

