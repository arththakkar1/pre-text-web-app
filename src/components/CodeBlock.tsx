"use client";

import React, { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="relative group">
      <pre className="text-xs font-mono leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 text-[10px] font-mono tracking-wider text-zinc-500 hover:text-orange-400 transition-colors px-2 py-1 rounded bg-zinc-900 border border-zinc-800 opacity-0 group-hover:opacity-100"
      >
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}
