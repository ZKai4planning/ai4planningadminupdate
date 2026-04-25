export default function JourneyNotes({ notes }: { notes: string[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
      <p className="text-xs font-semibold uppercase text-slate-500">
        Internal Notes
      </p>
      <div className="mt-3 space-y-3">
        {notes.map((note) => (
          <div
            key={note}
            className="flex items-start gap-2 border-b border-slate-100 pb-2"
          >
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-sm text-slate-700">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
