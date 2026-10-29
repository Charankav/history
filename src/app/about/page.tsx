import { Header } from '@/components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">About Chat Past &amp; How It Works</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-800">
          <strong>Chat Past (“Talk to the past”)</strong> is an educational digital history museum designed for students aged 8–16. It allows young learners to explore Indian and world history by asking questions to carefully curated AI simulations of historical figures.
        </p>
        <h2 className="mt-8 font-serif text-xl font-bold text-ink-900">How the AI Historical Simulation Works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-800">
          <li>Every historical figure is backed by a verified server-side historical profile containing documented dates, achievements, primary sources, and known historical uncertainties.</li>
          <li>When you select an age band (8–10, 11–13, or 14–16), the simulation adjusts its vocabulary and explanations to match your reading level.</li>
          <li>The simulated figure speaks in the first person (“I”) as an educational teaching device, but it is <strong>not the real historical person</strong> and never invents undocumented quotes or memories.</li>
        </ul>
      </main>
    </div>
  );
}
