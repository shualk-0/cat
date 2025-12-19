
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { gemini } from '../services/geminiService';
import { Volume2, Eye, Sparkles, Maximize2, X, BookOpen, Layers, Loader2, Image as ImageIcon } from 'lucide-react';

interface WordCardProps {
  word: Word;
  onNext: () => void;
  onBack?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const POS_COLORS: Record<string, string> = {
  'n.': 'bg-blue-100 text-blue-600',
  'v.': 'bg-green-100 text-green-600',
  'adj.': 'bg-purple-100 text-purple-600',
  'adv.': 'bg-yellow-100 text-yellow-600',
  'prep.': 'bg-pink-100 text-pink-600'
};

const WordCard: React.FC<WordCardProps> = ({ word, onNext, onBack, isFirst, isLast }) => {
  const [showChinese, setShowChinese] = useState(false);
  const [showExampleZh, setShowExampleZh] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  useEffect(() => {
    setShowChinese(false);
    setShowExampleZh(false);
    setShowDeepDive(false);
    setDetails(null);
    setGeneratedImg(null);
    setLoading(true);

    const loadData = async () => {
      const res = await gemini.fetchWordDetails(word.english);
      if (res) {
        setDetails(res);
        // Generate a matching image if not already generated
        setLoadingImg(true);
        const img = await gemini.generateWordImage(word.english, res.meanings[0]?.definition || "");
        setGeneratedImg(img);
        setLoadingImg(false);
      }
      setLoading(false);
    };
    loadData();
  }, [word]);

  const displayImg = generatedImg || `https://picsum.photos/seed/${word.english}-pet-cet4/800/800`;

  return (
    <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl max-w-xl w-full mx-auto relative border border-orange-50 overflow-hidden">
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-8 right-8 text-white"><X size={40} /></button>
          <img src={displayImg} className="max-w-full max-h-[85vh] rounded-[3rem] shadow-2xl animate-in zoom-in-95" alt="zoom" />
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < word.level ? 'bg-orange-500' : 'bg-gray-100'}`} />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Level {word.level}/8</span>
        </div>
        <div className="relative cursor-zoom-in" onClick={() => setIsZoomed(true)}>
          {loadingImg ? (
            <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-200 animate-pulse border-2 border-dashed border-orange-200">
              <ImageIcon size={32} />
            </div>
          ) : (
            <img src={displayImg} className="w-24 h-24 rounded-3xl shadow-xl rotate-3 object-cover hover:rotate-0 transition-all duration-500 border-2 border-white" alt="pet" />
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
            <Maximize2 className="text-white" size={24} />
          </div>
          {loadingImg && <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-lg"><Loader2 className="animate-spin text-orange-400" size={12} /></div>}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-7xl font-black text-gray-800 mb-2 tracking-tighter">{word.english}</h2>
        <div className="flex justify-center items-center gap-3 mb-8">
          <p className="text-2xl text-gray-400 font-mono tracking-wider">{word.phonetic}</p>
          <button onClick={() => gemini.speak(word.english)} className="p-3 bg-orange-50 rounded-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-90">
            <Volume2 size={28} />
          </button>
        </div>

        {/* English Definition */}
        <div className="mb-8 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 text-left relative min-h-[6rem]">
          {loading ? (
            <div className="flex items-center gap-2 text-blue-300 animate-pulse"><Loader2 size={16} className="animate-spin" /> Thinking...</div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <BookOpen size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">English Explanation</span>
              </div>
              <p className="text-blue-900 font-bold leading-relaxed italic text-lg">{details?.englishDefinition}</p>
            </>
          )}
        </div>

        <div className="mb-8 min-h-[6rem] flex flex-col items-center justify-center">
          {showChinese ? (
            <div className="animate-in zoom-in duration-300 space-y-2">
              {(details?.meanings || word.meanings).map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3 justify-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${POS_COLORS[m.pos] || 'bg-gray-100 text-gray-500'}`}>{m.pos}</span>
                  <p className="text-3xl font-black text-orange-600">{m.definition}</p>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowChinese(true)} className="flex flex-col items-center gap-3 text-gray-200 hover:text-orange-400 transition-all group">
              <Eye size={40} /> 
              <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Reveal Meanings</span>
            </button>
          )}
        </div>

        <div className="text-left bg-gray-50 p-8 rounded-[3rem] mb-10 border border-gray-100 relative group/ex">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-4">Sentence Context</span>
          <p className="text-gray-800 italic font-bold leading-relaxed text-xl">"{word.example}"</p>
          <div className="mt-6 pt-6 border-t border-gray-200/50 min-h-[2rem]">
            {showExampleZh ? (
              <p className="text-gray-500 font-bold animate-in slide-in-from-top-1">{details?.exampleZh || "Translating..."}</p>
            ) : (
              <button onClick={() => setShowExampleZh(true)} className="text-[10px] text-orange-400 font-black uppercase tracking-widest hover:text-orange-600 flex items-center gap-2">
                <Layers size={14} /> Show Translation
              </button>
            )}
          </div>
        </div>

        <div className="mb-10">
          <button onClick={() => setShowDeepDive(!showDeepDive)} className="w-full py-4 border-2 border-dashed border-orange-100 rounded-[2rem] text-orange-400 font-black text-sm flex items-center justify-center gap-3 hover:bg-orange-50 transition-all">
            <Sparkles size={18} /> {showDeepDive ? 'Hide' : 'Deep Dive (同义词/词根)'}
          </button>
          {showDeepDive && (
            <div className="mt-8 text-left p-8 bg-orange-50/50 rounded-[3rem] space-y-6 animate-in fade-in slide-in-from-top-4">
              {loading ? <div className="animate-pulse text-orange-300">Searching roots...</div> : (
                <>
                  <div>
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Synonyms</span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {details?.synonyms?.map((s: string) => <span key={s} className="px-4 py-2 bg-white rounded-xl text-sm font-black text-orange-600 shadow-sm">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Roots & Affixes</span>
                    <p className="text-base text-gray-700 mt-2 font-bold leading-relaxed">{details?.roots}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <button onClick={onBack} disabled={isFirst} className="flex-1 py-5 bg-gray-50 text-gray-300 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 disabled:opacity-30 transition-colors">Back</button>
          <button onClick={onNext} className="flex-[2] py-5 bg-orange-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-orange-600 transition-all active:scale-95">Next</button>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
