export function BlueprintLeftSection() {
  return (
    <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-slate-50 p-6 dark:bg-slate-950/50 sm:min-h-[340px] sm:p-8 lg:col-span-7 lg:min-h-[400px]">
      {/* Graph Paper Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')]"></div>

      <div className="relative">
        {/* Status Badge */}
        <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          System Online: Active Schema
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          Accessing <br />
          <span className="text-primary italic">Structural Core</span>
        </h1>

        {/* Description */}
        <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Initialize authentication sequence to modify living blueprints and AI-optimized structural modules.
        </p>
      </div>

      {/* AI Insight Card */}
      <div className="relative w-full max-w-md cursor-help group">
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-white p-4 shadow-sm dark:bg-slate-900 sm:items-center sm:gap-4">
          <div className="flex-shrink-0 size-10 rounded bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI Insight #842</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generative layouts reduce material waste by <span className="font-bold text-primary">18.4%</span> in
              high-density residential zones.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Blueprint Sketch */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 opacity-20 sm:-bottom-20 sm:-right-20 sm:h-80 sm:w-80">
        <svg className="w-full h-full text-primary fill-none stroke-current stroke-1" viewBox="0 0 100 100">
          <rect height="60" width="80" x="10" y="10"></rect>
          <path d="M10 40 L90 40 M40 10 L40 70 M60 10 L60 70"></path>
          <circle cx="75" cy="25" r="5"></circle>
        </svg>
      </div>
    </div>
  )
}
