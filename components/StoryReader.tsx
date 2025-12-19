
import React, { useState, useRef, useEffect } from 'react';
import { StoryContent } from '../types';
import { gemini } from '../services/geminiService';
import { Languages, MousePointer2, Loader2, Info, X } from 'lucide-react';

interface StoryReaderProps {
  story: StoryContent;
  sessionWords: string[];
  onFinish: () => void;
  onBack: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({ story, sessionWords, onFinish, onBack }) => {
  const [visibleSentences, setVisibleSentences] = useState<Set<number>>(new Set());
  const [showFullZh, setShowFullZh] = useState(false);
  const [activeWord, setActiveWord] = useState<{ word: string, translation: string, x: number, y: number } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const toggleSentence = (idx: number) => {
    const next = new Set(visibleSentences);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setVisibleSentences(next);
  };

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[.,!?;:()"]/g, '').toLowerCase();
    if (!cleanWord) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + window.scrollX + rect.width / 2;
    const y = rect.top + window.scrollY - 10;

    setIsTranslating(true);
    const translation = await gemini.quickTranslate(cleanWord);
    setActiveWord({ word: cleanWord, translation, x, y });
    setIsTranslating(false);
  };

  const isSessionWord = (word: string) => {
    const clean = word.replace(/[.,!?;:()"]/g, '').toLowerCase();
    return sessionWords.some(sw => sw.toLowerCase() === clean);
  };

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveWord(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-700 relative">
      {/* Floating Word Hint Tooltip */}
      { (activeWord || isTranslating) && (
        <div 
          ref={tooltipRef}
          className="absolute z-[110] -translate-x-1/2 -translate-y-full bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in zoom-in-95 pointer-events-auto"
          style={{ left: activeWord?.x, top: activeWord?.y }}
        >
          <div className="flex items-center gap-3 whitespace-nowrap">
            {isTranslating ? (
              <div className="flex items-center gap-2 text-orange-200"><Loader2 size={16} className="animate-spin" /> ...</div>
            ) : (
              <>
                <span className="font-black border-r border-orange-400 pr-3">{activeWord?.word}</span>
                <span className="font-bold">{activeWord?.translation}</span>
              </>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-orange-600"></div>
        </div>
      )}

      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-orange-50 relative">
        <div className="p-10 bg-orange-500 text-white flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black">AI Immersion Story</h2>
            <p className="text-orange-100 text-xs font-black uppercase tracking-widest mt-2">Click words for hints (点击单词翻译提示)</p>
          </div>
          <button 
            onClick={() => setShowFullZh(!showFullZh)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full font-black text-sm transition-all"
          >
            <Languages size={20} className="inline mr-2" /> {showFullZh ? 'Hide Translation' : 'Full Translation'}
          </button>
        </div>

        <div className="p-10 space-y-12">
          <div className="text-2xl leading-[2] text-gray-700 font-medium">
            {story.sentences.map((s, idx) => (
              <div key={idx} className="group relative mb-8 last:mb-0">
                <p onClick={() => toggleSentence(idx)} className="cursor-pointer hover:bg-orange-50/30 p-4 -m-4 rounded-3xl transition-all">
                  {s.en.split(' ').map((word, wIdx) => {
                    const sessionMatch = isSessionWord(word);
                    return (
                      <span 
                        key={wIdx} 
                        onClick={(e) => handleWordClick(e, word)}
                        className={`inline-block mx-0.5 px-1 rounded-lg transition-all cursor-help
                          ${sessionMatch ? 'font-black text-orange-600 underline decoration-orange-300 decoration-4 underline-offset-4 bg-orange-50' : 'hover:text-orange-500 hover:bg-orange-50'}
                        `}
                      >
                        {word}
                      </span>
                    );
                  })}
                  <MousePointer2 className="inline-block ml-3 opacity-0 group-hover:opacity-100 text-orange-200" size={18} />
                </p>
                {(visibleSentences.has(idx) || showFullZh) && (
                  <p className="text-lg text-gray-400 font-bold italic mt-4 animate-in slide-in-from-top-2 border-l-4 border-orange-100 pl-6">
                    {s.zh}
                  </p>
                )}
              </div>
            ))}
          </div>

          {showFullZh && (
            <div className="p-10 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 animate-in fade-in">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Complete Chinese Translation (全篇翻译)</span>
              <p className="text-xl text-gray-500 leading-relaxed font-bold italic">{story.fullZh}</p>
            </div>
          )}

          <div className="flex gap-6 pt-10 border-t border-gray-50">
            <button onClick={onBack} className="flex-1 py-6 bg-gray-50 text-gray-400 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-100">Back</button>
            <button onClick={onFinish} className="flex-[2] py-6 bg-orange-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-orange-600 transition-all">Finish Session</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;
