import { useState } from 'react';
import { useAppStore } from '../../store';
import { buildExportState, exportMarkdown, exportJSON, copyToClipboard, downloadJSON } from '.';

export function ExportPanel() {
  const store = useAppStore();
  const [copied, setCopied] = useState<string | null>(null);

  if (!store.solved) return null;

  const state = buildExportState({
    dataset: store.dataset,
    settings: store.settings,
    corrections: store.corrections,
    transformations: store.transformations,
    result: store.result,
  });

  const handleCopyMarkdown = async () => {
    const md = exportMarkdown(state);
    await copyToClipboard(md);
    setCopied('markdown');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadJSON = () => {
    const json = exportJSON(state);
    downloadJSON(json, `celnav-export-${Date.now()}.json`);
    setCopied('json');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-4">
        Method Summary &amp; Export
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Export a submission-ready summary of the dataset, method, corrections, equations,
        transformations, constants, and results.
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy-700 font-medium text-sm rounded-lg transition-colors"
        >
          {copied === 'markdown' ? 'Copied!' : 'Copy as Markdown'}
        </button>
        <button
          onClick={handleDownloadJSON}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy-700 font-medium text-sm rounded-lg transition-colors"
        >
          {copied === 'json' ? 'Downloaded!' : 'Export Full JSON'}
        </button>
      </div>
    </section>
  );
}
