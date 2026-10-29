import { FIGURES_LIBRARY } from '@/data/figures';
import ChatClient from './ChatClient';

// Pre-build one static chat page per figure (required for GitHub Pages)
export function generateStaticParams() {
  return FIGURES_LIBRARY.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ChatClient slug={slug} />;
}
