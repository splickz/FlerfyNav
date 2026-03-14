import katex from 'katex';
import { useMemo } from 'react';

interface Props {
  math: string;
  display?: boolean;
  className?: string;
}

export function KatexBlock({ math, display = true, className = '' }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span class="text-red-500">Error rendering: ${math}</span>`;
    }
  }, [math, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
