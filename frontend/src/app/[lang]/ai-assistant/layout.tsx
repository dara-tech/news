import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Assistant - RazeWire',
  description: 'Get intelligent assistance for content creation, analysis, and management',
};

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
