'use client';

import { default as MDEditor } from '@uiw/react-md-editor';

export function ProblemStatement({ description }: { description: string }) {
  return (
    <div className="prose lg:prose-xl">
      <MDEditor.Markdown
        source={description}
        className="!bg-transparent"
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}
