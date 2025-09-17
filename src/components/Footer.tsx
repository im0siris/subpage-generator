import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-none transform rotate-45 shadow-lg shadow-cyan-500/30">
                  <div className="w-full h-full flex items-center justify-center transform -rotate-45">
                    <BuildingOfficeIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">Subpage Generator</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
                Create professional, AI-powered subpages for your business with intelligent location targeting.
                Boost your local SEO and reach customers in specific geographic areas.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-slate-700 hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center cursor-pointer group">
                  <div className="w-4 h-4 bg-slate-400 group-hover:bg-white transition-colors duration-300"></div>
                </div>
                <div className="w-8 h-8 bg-slate-700 hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center cursor-pointer group">
                  <div className="w-4 h-4 bg-slate-400 group-hover:bg-white transition-colors duration-300"></div>
                </div>
                <div className="w-8 h-8 bg-slate-700 hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center cursor-pointer group">
                  <div className="w-4 h-4 bg-slate-400 group-hover:bg-white transition-colors duration-300"></div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-wider">Features</h3>
              <ul className="space-y-3">
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">AI-Powered Content</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Location Targeting</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">SEO Optimization</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Multi-City Support</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">TSX Export</li>
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-wider">Resources</h3>
              <ul className="space-y-3">
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Documentation</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">API Reference</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Examples</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Support</li>
                <li className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Status</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-slate-400 text-sm">
                © 2024 Subpage Generator. Powered by AI technology.
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm">Privacy Policy</span>
                <span className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm">Terms of Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}