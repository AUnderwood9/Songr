import Header from "@/components/Header";
import SongForm from "@/components/SongForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-page p-4 md:p-5">
      <div className="max-w-[1200px] mx-auto bg-card rounded-[28px] md:rounded-[16px] shadow-wrapper wrapper-glow overflow-hidden">
        <Header />

        <main className="relative z-10 px-4 md:px-7 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-3 mb-8 animate-[fadeSlideUp_0.5s_ease-out]">
              <h1 className="text-[26px] md:text-[34px] font-display text-text-primary tracking-[-0.02em] font-bold">
                What are you <em className="text-accent">feeling</em>?
              </h1>
              <p className="font-mono text-[13px] text-text-secondary">
                drop a song. we&apos;ll read its mood.
              </p>
            </div>

            <SongForm />
          </div>
        </main>
      </div>
    </div>
  );
}
