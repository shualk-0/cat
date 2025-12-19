
import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { gemini } from '../services/geminiService';
import { Volume2, CheckCircle, XCircle, Headphones } from 'lucide-react';

interface SpellingTestProps {
  words: Word[];
  onFinish: () => void;
}

const SpellingTest: React.FC<SpellingTestProps> = ({ words, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (status === 'idle') {
      gemini.speak(currentWord.english);
    }
  }, [currentIndex, status, currentWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === currentWord.english.toLowerCase()) {
      setStatus('correct');
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setInput('');
          setStatus('idle');
        } else {
          onFinish();
        }
      }, 1000);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-[4rem] p-12 shadow-2xl border border-orange-50">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
          <Headphones size={14} /> Spelling Mastery (拼写挑战)
        </div>
        
        <div className="flex justify-center items-center gap-6 mb-8">
          <button 
            onClick={() => gemini.speak(currentWord.english)}
            className="p-8 bg-orange-500 text-white rounded-[2.5rem] shadow-xl shadow-orange-100 hover:scale-110 active:scale-95 transition-all animate-pulse"
          >
            <Volume2 size={48} />
          </button>
        </div>
        
        <p className="text-3xl text-gray-300 font-mono tracking-[0.2em] mb-4">{currentWord.phonetic}</p>
        
        <div className="space-y-1 mb-10">
          {currentWord.meanings.map((m, i) => (
            <div key={i} className="flex items-center gap-2 justify-center">
              <span className="text-xs font-black text-gray-300 italic uppercase">{m.pos}</span>
              <p className="text-3xl font-black text-gray-700">{m.definition}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`w-full text-center text-5xl font-black py-6 border-b-[8px] outline-none transition-all rounded-t-3xl ${
              status === 'correct' ? 'border-green-500 text-green-500 bg-green-50/30' : 
              status === 'wrong' ? 'border-red-500 text-red-500 bg-red-50/30 animate-shake' : 
              'border-orange-100 focus:border-orange-500 bg-gray-50/50'
            }`}
            placeholder="Type word..."
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {status === 'correct' && <CheckCircle className="w-12 h-12 text-green-500 animate-in zoom-in" />}
            {status === 'wrong' && <XCircle className="w-12 h-12 text-red-500 animate-in shake" />}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-6 rounded-[2rem] bg-orange-500 text-white font-black text-2xl hover:bg-orange-600 transition-all shadow-2xl shadow-orange-100 active:scale-95"
        >
          Check (验证)
        </button>
      </form>

      <div className="mt-12 flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-300">
        <span>Target {currentIndex + 1} / {words.length}</span>
        <button onClick={onFinish} className="hover:text-orange-500 transition-colors">Finish Session (结束)</button>
      </div>
    </div>
  );
};

export default SpellingTest;
