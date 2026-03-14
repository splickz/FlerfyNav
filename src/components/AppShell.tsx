import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FlerfyNav" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-navy-900">FlerfyNav</h1>
              <p className="text-xs text-gray-400">Celestial navigation through vector geometry</p>
            </div>
          </div>
          <a
            href="https://mctoon.net/10ksextantv2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:text-sky-700 font-medium"
          >
            MCToon Challenge v2
          </a>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          FlerfyNav &mdash; An educational tool for celestial navigation geometry
        </div>
      </footer>
    </div>
  );
}
