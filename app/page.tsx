import SongForm from "@/components/SongForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Song Mood Analyzer
          </h1>
          <p className="text-foreground/60">
            Enter a song and artist to discover its emotional mood.
          </p>
        </div>
        <SongForm />
      </main>
    </div>
  );
}
