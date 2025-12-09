import React, { useState } from 'react';
import { Icons } from '../constants';
import { Button } from './Button';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  readOnly?: boolean;
  placeholder?: string;
  onClear?: () => void;
  isStreaming?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label,
  readOnly = false,
  placeholder,
  onClear,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-850 border-b border-gray-800">
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            {isStreaming && <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
            </span>}
        </div>
        <div className="flex items-center gap-1">
          {value && !readOnly && onClear && (
            <Button variant="icon" onClick={onClear} title="Clear">
              <Icons.Trash />
            </Button>
          )}
          <Button variant="icon" onClick={handleCopy} disabled={!value} title="Copy Markdown">
            {copied ? <Icons.Check /> : <Icons.Copy />}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 bg-gray-900/50">
        <textarea
          className={`w-full h-full p-4 bg-transparent text-sm font-mono leading-relaxed outline-none resize-none placeholder-gray-600 ${
            readOnly ? 'text-gray-300' : 'text-gray-100'
          }`}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          placeholder={placeholder}
        />
        
        {/* Helper overlay for empty states in readOnly mode */}
        {readOnly && !value && !isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none">
                <Icons.Sparkles />
                <span className="mt-2 text-sm">Translation will appear here</span>
            </div>
        )}
      </div>
      
      {/* Footer Info (Word Count) */}
      <div className="px-4 py-2 bg-gray-850 border-t border-gray-800 text-xs text-gray-500 flex justify-end">
        {value.length} characters
      </div>
    </div>
  );
};