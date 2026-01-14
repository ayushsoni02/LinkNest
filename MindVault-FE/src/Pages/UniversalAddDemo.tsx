import UniversalAddBar from '../components/UniversalAddBar';

export default function UniversalAddDemo() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Magic URL Input ✨
          </h1>
          <p className="text-slate-400 text-lg">
            Paste any URL and watch AI work its magic
          </p>
        </div>

        <UniversalAddBar onSuccess={() => console.log('Success!')} />

        {/* Demo Instructions */}
        <div className="mt-16 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            Try it out:
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">1.</span>
              Copy this URL: <code className="text-indigo-300 bg-slate-800 px-2 py-1 rounded">https://www.youtube.com/watch?v=example</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">2.</span>
              Click the input and paste (Cmd/Ctrl + V)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">3.</span>
              Watch the magic happen! ✨
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
