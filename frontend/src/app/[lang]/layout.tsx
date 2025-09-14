import React, { memo } from 'react';
import { ReactNode } from 'react';

interface LangLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default memo(async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  
  return (
    <div data-lang={lang}>
      {children}
    </div>
  );
});
