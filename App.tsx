
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Word, ViewState, UserStats, StoryContent } from './types';
import { getInitialVocabulary, EBBINGHAUS_INTERVALS } from './vocabulary';
import WordCard from './components/WordCard';
import SpellingTest from './components/SpellingTest';
import StoryReader from './components/StoryReader';
import Wordbook from './components/Wordbook';
import { gemini } from './services/geminiService';
import { 
  Dog, Cat, Award, FileText, PenTool, Trophy, 
  ChevronRight, Cookie, Sparkles, BookOpen, RefreshCw, Calendar, MousePointer2
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [wordCount, setWordCount] = useState(20);
  const [words, setWords] = useState<Word[]>([]);
  const [currentSessionWords, setCurrentSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [story, setStory] = useState<StoryContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({ 
    biscuits: 0, streak: 0, totalWords: 0, lastCheckIn: '' 
  });

  // Persist State
  useEffect(() => {
    try {
      const savedWords = localStorage.getItem('paws_words_v6');
      const savedStats = localStorage.getItem('paws_stats_v6');
      if (savedWords) {
        try {
          setWords(JSON.parse(savedWords));
        } catch (e) {
          console.error('Failed to parse saved words:', e);
          setWords(getInitialVocabulary());
        }
      } else {
        setWords(getInitialVocabulary());
      }
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (e) {
          console.error('Failed to parse saved stats:', e);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      setWords(getInitialVocabulary());
    }
  }, []);

  useEffect(() => {
    try {
      if (words.length > 0) {
        localStorage.setItem('paws_words_v6', JSON.stringify(words));
      }
      localStorage.setItem('paws_stats_v6', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [words, stats]);

  // Pre-fetching logic
  useEffect(() => {
    if ((view === 'LEARNING' || view === 'REVIEWING') && currentSessionWords[currentIndex + 1]) {
      const nextWord = currentSessionWords[currentIndex + 1];
      gemini.fetchWordDetails(nextWord.english); // Fetch in background
    }
  }, [currentIndex, view, currentSessionWords]);

  const dueReviewCount = useMemo(() => {
    const now = Date.now();
    return words.filter(w => w.isLearned && w.nextReview <= now && w.level < 8).length;
  }, [words]);

  const handleStartLearning = () => {
    const unlearned = words.filter(w => !w.isLearned);
    const session = unlearned.sort(() => Math.random() - 0.5).slice(0, wordCount);
    setCurrentSessionWords(session);
    setCurrentIndex(0);
    setView('LEARNING');
    // Pre-fetch the first one immediately
    if (session[0]) gemini.fetchWordDetails(session[0].english);
  };

  const handleStartReview = () => {
    const now = Date.now();
    const reviewing = words.filter(w => w.isLearned && w.nextReview <= now && w.level < 8);
    setCurrentSessionWords(reviewing);
    setCurrentIndex(0);
    setView('REVIEWING');
    if (reviewing[0]) gemini.fetchWordDetails(reviewing[0].english);
  };

  const updateWordEbbinghaus = (wordId: string) => {
    const now = Date.now();
    setWords(prev => prev.map(w => {
      if (w.id === wordId) {
        const nextLevel = Math.min(w.level + 1, 8);
        const interval = EBBINGHAUS_INTERVALS[nextLevel - 1] || (30 * 24 * 60 * 60 * 1000);
        return { ...w, isLearned: true, level: nextLevel, lastReview: now, nextReview: now + interval };
      }
      return w;
    }));
  };

  const handleWordFinished = () => {
    updateWordEbbinghaus(currentSessionWords[currentIndex].id);
    if (currentIndex < currentSessionWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = () => {
    const today = new Date().toISOString().split('T')[0];
    const reward = Math.min(50, 10 + Math.floor(currentSessionWords.length / 5));
    setStats(prev => ({
      ...prev,
      biscuits: prev.biscuits + reward,
      totalWords: prev.totalWords + currentSessionWords.length,
      streak: prev.lastCheckIn === today ? prev.streak : prev.streak + 1,
      lastCheckIn: today
    }));
    setView('COMPLETED');
  };

  const startArticleMode = async () => {
    setIsLoading(true);
    setView('ARTICLE');
    const result = await gemini.generateStory(currentSessionWords.map(w => w.english));
    setStory(result);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fefaf6] text-gray-800 font-['Quicksand'] pb-20 overflow-x-hidden">
      {/* Navbar */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('HOME')}>
          <div className="bg-orange-500 p-3 rounded-2xl text-white group-hover:rotate-12 transition-transform shadow-xl">
            <Dog size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">PawsWords</h1>
            <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mt-1">AI Ebbinghaus CET-4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 bg-white px-8 py-3 rounded-[2.5rem] shadow-sm border border-orange-50">
          <div className="flex items-center gap-2 text-orange-600 font-black">
            <Cookie size={20} className="animate-pulse" />
            <div className="flex flex-col">
              <span className="text-lg leading-none">{stats.biscuits}</span>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Biscuits</span>
            </div>
          </div>
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex items-center gap-2 text-blue-600 font-black">
            <Trophy size={20} />
            <div className="flex flex-col">
              <span className="text-lg leading-none">{stats.streak}</span>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Streak</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8">
        {view === 'HOME' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-b-[16px] border-orange-100 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={14} /> Smart Immersion (智能浸入式学习)
                </div>
                <h2 className="text-6xl font-black leading-tight text-gray-900 tracking-tighter">
                  Fetch New <span className="text-orange-500">Knowledge</span>.
                </h2>
              </div>
              <div className="absolute right-10 bottom-10 w-48 h-48 bg-orange-50 rounded-full flex items-center justify-center animate-float">
                <Cat size={100} className="text-orange-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">New Target</h3>
                  <div className="text-5xl font-black text-orange-500">{wordCount}</div>
                </div>
                <input 
                  type="range" min="10" max="300" step="10" 
                  value={wordCount} 
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-3 bg-orange-50 rounded-full appearance-none cursor-pointer accent-orange-500 mb-10"
                />
                <button onClick={handleStartLearning} className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
                  Start (学新词) <ChevronRight size={24} />
                </button>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">Due Review</h3>
                  <div className={`text-5xl font-black ${dueReviewCount > 0 ? 'text-blue-500' : 'text-gray-100'}`}>
                    {dueReviewCount}
                  </div>
                </div>
                <div className="mb-10 text-gray-400 text-xs font-black uppercase tracking-widest">Scientific Spaced Repetition</div>
                <button 
                  disabled={dueReviewCount === 0}
                  onClick={handleStartReview}
                  className={`w-full py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 ${dueReviewCount > 0 ? 'bg-blue-500 text-white shadow-xl hover:bg-blue-600' : 'bg-gray-50 text-gray-200'}`}
                >
                  Recall (复习) <RefreshCw size={24} className={dueReviewCount > 0 ? "animate-spin-slow" : ""} />
                </button>
              </div>
            </div>

            <button onClick={() => setView('WORDBOOK')} className="w-full bg-white p-8 rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <BookOpen size={32} />
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-black">Wordbook</h4>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Learned Library (单词本)</p>
                </div>
              </div>
              <ChevronRight className="text-gray-200 group-hover:text-orange-500 group-hover:translate-x-3 transition-all" size={40} />
            </button>
          </div>
        )}

        {(view === 'LEARNING' || view === 'REVIEWING') && (
          <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black">{view === 'LEARNING' ? 'New Words' : 'Review'} Session</span>
              <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-50 font-black text-orange-500 text-xl">
                {currentIndex + 1} <span className="text-gray-200 mx-2">/</span> {currentSessionWords.length}
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${view === 'LEARNING' ? 'bg-orange-500' : 'bg-blue-500'}`} 
                style={{ width: `${((currentIndex+1)/currentSessionWords.length)*100}%` }} 
              />
            </div>
            {currentSessionWords[currentIndex] && (
              <WordCard 
                word={currentSessionWords[currentIndex]} 
                isFirst={currentIndex === 0}
                isLast={currentIndex === currentSessionWords.length - 1}
                onBack={() => setCurrentIndex(i => Math.max(0, i - 1))}
                onNext={handleWordFinished}
              />
            )}
          </div>
        )}

        {view === 'COMPLETED' && (
          <div className="text-center py-20 space-y-12 animate-in zoom-in-95">
            <Dog size={180} className="mx-auto text-orange-500 animate-bounce" />
            <h2 className="text-7xl font-black tracking-tighter">Excellent!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={() => setView('SPELLING')} className="p-10 bg-white rounded-[3.5rem] shadow-xl border-2 border-transparent hover:border-orange-500 transition-all text-left group">
                <PenTool size={40} className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black">Spelling Challenge</h4>
                <p className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest">Verify Memory</p>
              </button>
              <button onClick={startArticleMode} className="p-10 bg-white rounded-[3.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 transition-all text-left group">
                <FileText size={40} className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black">Immersion Story</h4>
                <p className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest">Context Reading</p>
              </button>
            </div>
            <button onClick={() => setView('HOME')} className="text-gray-300 font-black uppercase tracking-widest text-sm hover:text-orange-500 transition-colors flex items-center gap-4 mx-auto group">
              Back to Home <MousePointer2 size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}

        {view === 'WORDBOOK' && <Wordbook words={words} onBack={() => setView('HOME')} />}
        {view === 'SPELLING' && <SpellingTest words={currentSessionWords} onFinish={() => setView('COMPLETED')} />}
        {view === 'ARTICLE' && story && (
          <StoryReader story={story} sessionWords={currentSessionWords.map(w => w.english)} onFinish={() => setView('HOME')} onBack={() => setView('COMPLETED')} />
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex items-center justify-center text-center p-12 overflow-hidden">
            <div className="space-y-8 animate-in zoom-in-95 relative z-10">
              <Cat size={140} className="mx-auto text-orange-400 animate-bounce" />
              <h3 className="text-4xl font-black tracking-tight text-gray-900">AI is Writing Your Tale...</h3>
              <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">Wait for the Magic</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
