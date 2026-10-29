import { Header } from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">Privacy Notice &amp; AI Simulation Disclaimer</h1>
        <div className="mt-6 space-y-6 text-sm leading-relaxed text-ink-800">
          <section>
            <h2 className="font-serif text-lg font-bold text-ink-900">1. No Student Accounts or Persistent Profiles</h2>
            <p className="mt-1">
              Chat Past does not require student accounts, passwords, email addresses, school names, or birthdates. If you enter an optional first name or nickname, it is held only in temporary browser memory for your greeting and cleared immediately when you clear or close the chat.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-lg font-bold text-ink-900">2. Ephemeral Conversations</h2>
            <p className="mt-1">
              Chat transcripts are stored only in active client-side React state during your current conversation. We do not store chat histories in localStorage, sessionStorage, cookies, or an application database, nor do we log student chat contents on our server.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-lg font-bold text-ink-900">3. Hosting &amp; AI Provider Processing</h2>
            <p className="mt-1">
              When you send a historical question, our server forwards only the selected figure’s historical profile, your selected age band, and the current session’s questions to the Anthropic Claude API over an encrypted connection. Hosting and AI providers may temporarily process request metadata for abuse prevention in accordance with their commercial API terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
