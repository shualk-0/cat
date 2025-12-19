
import React, { useState } from 'react';
import { Word } from '../types';
import { gemini } from '../services/geminiService';
import { Volume2, BookOpen, ChevronLeft, Search, Filter, Star } from 'lucide-react';

interface WordbookProps {
  words: Word[];
  onBack: () => void;
}

const Wordbook: React.FC<WordbookProps> = ({ words, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  
  const learnedWords = words.filter(w => w.isLearned);

  const filteredWords = learnedWords.filter(w => {
    const matchesSearch = w.english.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.meanings.some(m => m.definition.includes(searchTerm));
    const matchesFilter = filter === 'all' || 
                          (filter === 'mastered' && w.level >= 5) || 
                          (filter === 'learning' && w.level < 5);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden min-h-[85vh] border border-orange-50">
        <div className="p-12 bg-orange-500 text-white flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={onBack} className="p-4 bg-white/20 hover:bg-white/40 rounded-[1.5rem] transition-all active:scale-90">
              <ChevronLeft size={36} />
            </button>
            <div>
              <h2 className="text-4xl font-black tracking-tight leading-none">The Treasury</h2>
              <p className="text-orange-100 text-sm font-black uppercase tracking-widest mt-2">
                {learnedWords.length} Words in Pocket (词本库)
              </p>
            </div>
          </div>
          <BookOpen size={64} className="opacity-30" />
        </div>

        <div className="p-12">
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={28} />
              <input 
                type="text"
                placeholder="Search word or meaning (查找)..."
                className="w-full pl-20 pr-10 py-6 bg-gray-50 rounded-[2.5rem] border-none focus:ring-4 focus:ring-orange-100 transition-all font-black text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-gray-50 p-2 rounded-[2rem] gap-2 self-center">
              {['all', 'learning', 'mastered'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-orange-500 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWords.map(word => (
                <div key={word.id} className="p-8 bg-white border-2 border-gray-50 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-orange-100 transition-all group relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 text-orange-50 opacity-20 group-hover:opacity-40 transition-opacity rotate-12">
                    <Star size={120} fill="currentColor" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="text-3xl font-black text-gray-800 tracking-tight">{word.english}</h3>
                      <p className="text-xs font-mono text-gray-400 mt-1 font-bold tracking-wider">{word.phonetic}</p>
                    </div>
                    <button 
                      onClick={() => gemini.speak(word.english)}
                      className="p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 mb-6 relative z-10">
                    {word.meanings.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-orange-300 italic uppercase min-w-[24px]">{m.pos}</span>
                        <p className="text-gray-700 font-bold">{m.definition}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                    <div className="flex gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < word.level ? 'bg-orange-400' : 'bg-gray-100'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Lvl {word.level}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 text-gray-200 flex flex-col items-center animate-in fade-in">
              <BookOpen size={120} className="mb-8 opacity-10" />
              <p className="text-3xl font-black italic">Search result is empty (空空如也)</p>
              <p className="text-sm font-bold uppercase tracking-[0.3em] mt-4 text-gray-300">Keep exploring and learning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wordbook;
