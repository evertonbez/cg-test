export function Header() {
  return (
    <header className="border-b border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Image Processing Hub
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Submit images for processing and track their progress in real-time
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
