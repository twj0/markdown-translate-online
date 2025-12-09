import React, { useState, useRef } from 'react';
import { streamTranslation } from './services/geminiService';
import { MarkdownEditor } from './components/MarkdownEditor';
import { Button } from './components/Button';
import { Icons } from './constants';
import { Language } from './types';
import { GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  const [sourceText, setSourceText] = useState<string>('');
  const [targetText, setTargetText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [error, setError] = useState<string | null>(null);
  
  // AbortController to cancel streaming if needed (optional enhancement, but good practice)
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTargetText(''); // Clear previous output

    try {
      const stream = await streamTranslation(sourceText, sourceLang, targetLang);
      
      let fullText = "";
      for await (const chunk of stream) {
        const responseChunk = chunk as GenerateContentResponse;
        const text = responseChunk.text;
        if (text) {
            fullText += text;
            setTargetText(fullText);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during translation.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-accent-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              MarkFlow
            </h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Language Controls */}
            <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
                <div className="px-3 py-1.5 text-sm font-medium text-gray-300 w-32 text-center">
                    {sourceLang}
                </div>
                
                <Button variant="icon" onClick={handleSwapLanguages} title="Swap Languages">
                    <Icons.Swap />
                </Button>

                <div className="px-3 py-1.5 text-sm font-medium text-accent-500 w-32 text-center">
                    {targetLang}
                </div>
            </div>

            <Button 
                onClick={handleTranslate} 
                loading={isTranslating} 
                disabled={!sourceText.trim()}
            >
                <Icons.Translate />
                <span>Translate</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        
        {/* Source Pane */}
        <div className="flex-1 min-h-[300px] h-full flex flex-col">
            <MarkdownEditor 
                label={`Input (${sourceLang})`}
                value={sourceText}
                onChange={setSourceText}
                placeholder="Paste your Markdown here..."
                onClear={() => setSourceText('')}
            />
        </div>

        {/* Output Pane */}
        <div className="flex-1 min-h-[300px] h-full flex flex-col">
            <MarkdownEditor 
                label={`Output (${targetLang})`}
                value={targetText}
                readOnly={true}
                placeholder="Translation will appear here..."
                isStreaming={isTranslating}
            />
        </div>

      </main>

        {/* Error Toast */}
        {error && (
            <div className="fixed bottom-6 right-6 bg-red-900/90 text-white px-6 py-4 rounded-lg shadow-xl border border-red-700 flex items-center gap-3 animate-slide-up z-50">
                <Icons.Info />
                <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm opacity-90">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-4 hover:opacity-75">✕</button>
            </div>
        )}
    </div>
  );
};

export default App;