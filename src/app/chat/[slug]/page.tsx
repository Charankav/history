'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { getFigureBySlug } from '@/data/figures';
import { AgeBand, ChatMessage } from '@/types/figure';
import { APP_CONFIG } from '@/config/limits';
import { Header } from '@/components/Header';
import { PortraitImage } from '@/components/PortraitImage';

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const figure = getFigureBySlug(slug);

  const [hasEntered, setHasEntered] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('11-13');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!figure) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink-900">Historical Figure Not Found</h1>
          <p className="mt-2 text-sm text-ink-800">
            We could not find that person in the museum archive.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-bronze-600 px-5 py-2.5 text-sm font-semibold text-white">
            Return to Collection
          </Link>
        </main>
      </div>
    );
  }

  const startSession = (skipName = false) => {
    const cleanName = skipName ? '' : studentName.trim().slice(0, 30);
    if (skipName) setStudentName('');
    setHasEntered(true);
    setMessages([]);
    setErrorMsg(null);
  };

  const greetingName = studentName.trim() ? `, ${studentName.trim()}` : '';
  const initialGreeting = `Hi${greetingName}! How are you? I am ${figure.displayName} (${figure.lifePeriodLabel}). I can share my experiences and help you explore the events and ideas that shaped my time.`;

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;
    if (messages.length >= APP_CONFIG.limits.maxMessagesPerConversation) {
      setErrorMsg('You have reached the 12-message limit for this session. Please clear or start a new conversation.');
      return;
    }

    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(updatedMessages);
    setInput('');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureSlug: figure.slug,
          ageBand,
          messages: updatedMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not reach the museum server. Please try again.');
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setErrorMsg('Network connection error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput('');
    setErrorMsg(null);
  };

  const resetEntireFlow = () => {
    setMessages([]);
    setInput('');
    setErrorMsg(null);
    setStudentName('');
    setHasEntered(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-50">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
        {!hasEntered ? (
          <section aria-labelledby="entry-heading" className="mx-auto my-auto w-full max-w-lg rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 border-b border-parchment-200 pb-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-parchment-300">
                <PortraitImage portrait={figure.portrait} displayName={figure.displayName} priority />
              </div>
              <div>
                <span className="text-xs font-semibold text-bronze-700">{figure.lifePeriodLabel}</span>
                <h1 id="entry-heading" className="font-serif text-xl font-bold text-ink-900">
                  Meet {figure.name}
                </h1>
                <p className="text-xs text-ink-800">{figure.region}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="student-name" className="block text-xs font-bold uppercase tracking-wider text-ink-800">
                  Your First Name or Nickname (Optional)
                </label>
                <input
                  id="student-name"
                  type="text"
                  maxLength={30}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Aisha or Alex"
                  className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3.5 py-2 text-sm text-ink-900 focus:border-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-600/20"
                />
                <p className="mt-1 text-[11px] text-ink-800/80">
                  Privacy tip: Never enter your last name, school, email, or phone number. Your nickname stays in memory only for this screen.
                </p>
              </div>

              <fieldset>
                <legend className="block text-xs font-bold uppercase tracking-wider text-ink-800">
                  Select Your Age Band (Adapts Vocabulary &amp; Explanations)
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2.5">
                  {(['8-10', '11-13', '14-16'] as AgeBand[]).map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setAgeBand(band)}
                      aria-pressed={ageBand === band}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                        ageBand === band
                          ? 'border-bronze-600 bg-bronze-600 text-white'
                          : 'border-parchment-300 bg-parchment-50 text-ink-900 hover:bg-parchment-200'
                      }`}
                    >
                      Ages {band}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="rounded-xl border border-bronze-500/30 bg-parchment-100 p-3 text-xs text-ink-800">
                <strong>AI Historical Simulation Notice:</strong> You will be chatting with an educational AI simulation grounded in historical records, not the real {figure.displayName}.
              </div>

              <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => startSession(false)}
                  className="flex-1 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-bronze-700"
                >
                  Start Conversation
                </button>
                <button
                  type="button"
                  onClick={() => startSession(true)}
                  className="rounded-xl border border-parchment-300 bg-parchment-50 px-4 py-2.5 text-xs font-semibold text-ink-800 hover:bg-parchment-200"
                >
                  Skip Name &amp; Continue
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-parchment-300 bg-white shadow-sm">
            {/* Top Figure Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-200 bg-parchment-100 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-parchment-300">
                  <PortraitImage portrait={figure.portrait} displayName={figure.displayName} priority />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold text-ink-900 sm:text-lg">
                    {figure.name}
                  </h1>
                  <p className="text-xs text-bronze-700">
                    {figure.lifePeriodLabel} &bull; {figure.region} &bull; Age Band: {ageBand}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={clearConversation}
                  className="rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-parchment-200"
                >
                  Clear Conversation
                </button>
                <button
                  type="button"
                  onClick={resetEntireFlow}
                  className="rounded-lg border border-bronze-600/40 bg-parchment-200 px-3 py-1.5 text-xs font-semibold text-bronze-700 hover:bg-parchment-300"
                >
                  New Session / Change Age
                </button>
              </div>
            </div>

            {/* Always-Visible AI Simulation Disclaimer Banner */}
            <div className="border-b border-parchment-200 bg-parchment-50 px-4 py-2 text-xs text-ink-800">
              <strong>AI Simulation Reminder:</strong> I’m an AI simulation based on historical sources, not the real person. Some answers may simplify events or reflect uncertainty in the historical record.
            </div>

            {/* Chat Transcript Area */}
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {/* Initial Personalised Greeting Bubble */}
              <div className="max-w-2xl rounded-2xl border border-parchment-200 bg-parchment-100/80 p-4 text-sm text-ink-900">
                <p className="font-semibold text-bronze-700 mb-1">{figure.displayName} (AI Simulation)</p>
                <p>{initialGreeting}</p>
              </div>

              {/* Suggested Question Prompts */}
              <div className="rounded-xl border border-parchment-200 bg-parchment-50/70 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-bronze-700">
                  Suggested Questions for {figure.displayName}:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {figure.suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isLoading}
                      onClick={() => sendQuestion(q)}
                      className="rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-left text-xs font-medium text-ink-900 transition hover:border-bronze-500 hover:bg-parchment-100 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-ink-900 text-parchment-50'
                        : 'border border-parchment-200 bg-parchment-100/80 text-ink-900'
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-semibold opacity-80">
                      {m.role === 'user'
                        ? studentName.trim() || 'Student'
                        : `${figure.displayName} (AI Simulation)`}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-parchment-200 bg-parchment-100 px-4 py-3 text-xs font-medium text-bronze-700">
                    {figure.displayName} is consulting the historical archive...
                  </div>
                </div>
              )}

              {errorMsg && (
                <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-900">
                  <p className="font-semibold">Notice:</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion(input);
              }}
              className="border-t border-parchment-200 bg-parchment-50 p-3 sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  rows={2}
                  maxLength={APP_CONFIG.limits.maxUserMessageChars}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendQuestion(input);
                    }
                  }}
                  placeholder={`Ask ${figure.displayName} a question... (Press Enter to send, Shift+Enter for new line)`}
                  className="flex-1 resize-none rounded-xl border border-parchment-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-600/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl bg-bronze-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-ink-800/80">
                <span>Do not share private personal information in chat.</span>
                <span>
                  {input.length}/{APP_CONFIG.limits.maxUserMessageChars} chars &bull; {messages.length}/{APP_CONFIG.limits.maxMessagesPerConversation} session messages
                </span>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
