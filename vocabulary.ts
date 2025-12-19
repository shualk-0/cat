
import { Word } from './types';

export const EBBINGHAUS_INTERVALS = [
  5 * 60 * 1000,          // 5 mins
  30 * 60 * 1000,         // 30 mins
  12 * 60 * 60 * 1000,    // 12 hours
  24 * 60 * 60 * 1000,    // 1 day
  48 * 60 * 60 * 1000,    // 2 days
  96 * 60 * 60 * 1000,    // 4 days
  168 * 60 * 60 * 1000,   // 7 days
  360 * 60 * 60 * 1000    // 15 days
];

const CET4_RAW: Partial<Word>[] = [
  { english: "capacity", meanings: [{pos: "n.", definition: "容量；能力；生产力"}], phonetic: "/kəˈpæsəti/", example: "The stadium has a seating capacity of 50,000." },
  { english: "brief", meanings: [{pos: "adj.", definition: "简短的；短暂的"}, {pos: "n.", definition: "摘要"}], phonetic: "/briːf/", example: "He gave a brief account of the events." },
  { english: "efficient", meanings: [{pos: "adj.", definition: "效率高的；有能力的"}], phonetic: "/ɪˈfɪʃnt/", example: "We need a more efficient way of handling waste." },
  { english: "maintain", meanings: [{pos: "v.", definition: "维持；保养；坚持认为"}], phonetic: "/meɪnˈteɪn/", example: "It's important to maintain a steady speed." },
  { english: "flexible", meanings: [{pos: "adj.", definition: "易弯曲的；灵活的"}], phonetic: "/ˈfleksəbl/", example: "Our plans need to be flexible." },
  { english: "genuine", meanings: [{pos: "adj.", definition: "真诚的；真实的"}], phonetic: "/ˈdʒenjuɪn/", example: "Is the painting a genuine Picasso?" },
  { english: "horizon", meanings: [{pos: "n.", definition: "地平线；眼界；见识"}], phonetic: "/həˈraɪzn/", example: "The sun sank below the horizon." },
  { english: "justify", meanings: [{pos: "v.", definition: "证明...是正当的；辩解"}], phonetic: "/ˈdʒʌstɪfaɪ/", example: "How can you justify such a high salary?" },
  { english: "leisure", meanings: [{pos: "n.", definition: "闲暇；空闲"}], phonetic: "/ˈleʒə(r)/", example: "I have very little leisure time." },
  { english: "neglect", meanings: [{pos: "v.", definition: "疏忽；忽视"}, {pos: "n.", definition: "疏忽"}], phonetic: "/nɪˈɡlekt/", example: "Don't neglect your health." },
  { english: "objective", meanings: [{pos: "n.", definition: "目标"}, {pos: "adj.", definition: "客观的"}], phonetic: "/əbˈdʒektɪv/", example: "He tried to be as objective as possible." },
  { english: "radical", meanings: [{pos: "adj.", definition: "根本的；彻底的；激进的"}], phonetic: "/ˈrædɪkl/", example: "The company needs a radical change." },
  { english: "sensitive", meanings: [{pos: "adj.", definition: "敏感的；易受伤害的"}], phonetic: "/ˈsensətɪv/", example: "He's very sensitive about his weight." },
  { english: "ultimate", meanings: [{pos: "adj.", definition: "最终的；极限的"}], phonetic: "/ˈʌltɪmət/", example: "Our ultimate goal is world peace." },
  { english: "vague", meanings: [{pos: "adj.", definition: "模糊的；不明确的"}], phonetic: "/veɪɡ/", example: "I have a vague memory of that place." },
  { english: "witness", meanings: [{pos: "n.", definition: "证人；目击者"}, {pos: "v.", definition: "目击"}], phonetic: "/ˈwɪtnəs/", example: "Did anyone witness the accident?" },
  { english: "ambition", meanings: [{pos: "n.", definition: "雄心；野心"}], phonetic: "/æmˈbɪʃn/", example: "His ambition is to be a doctor." },
  { english: "candidate", meanings: [{pos: "n.", definition: "候选人；报考者"}], phonetic: "/ˈkændɪdət/", example: "She is a strong candidate for the job." },
  { english: "dilemma", meanings: [{pos: "n.", definition: "窘境；进退两难"}], phonetic: "/dɪˈlemə/", example: "I am in a difficult dilemma." },
  { english: "elaborate", meanings: [{pos: "adj.", definition: "复杂的"}, {pos: "v.", definition: "详细阐述"}], phonetic: "/ɪˈlæbərət/", example: "The dancers wore elaborate costumes." },
  { english: "guarantee", meanings: [{pos: "n.", definition: "保证；担保"}, {pos: "v.", definition: "保证"}], phonetic: "/ˌɡærənˈtiː/", example: "We offer a money-back guarantee." },
  { english: "hardship", meanings: [{pos: "n.", definition: "艰难；困苦"}], phonetic: "/ˈhɑːrdʃɪp/", example: "The family suffered great hardship." },
  { english: "magnify", meanings: [{pos: "v.", definition: "放大；夸大"}], phonetic: "/ˈmæɡnɪfaɪ/", example: "A microscope magnifies small objects." },
  { english: "observe", meanings: [{pos: "v.", definition: "观察；遵守"}], phonetic: "/əbˈzɜːrv/", example: "The police observed the man's house." },
  { english: "package", meanings: [{pos: "n.", definition: "包裹"}, {pos: "v.", definition: "打包"}], phonetic: "/ˈpækɪdʒ/", example: "A package arrived in the mail." },
  { english: "quantity", meanings: [{pos: "n.", definition: "量；数量"}], phonetic: "/ˈkwɒntəti/", example: "They buy in large quantities." },
  { english: "random", meanings: [{pos: "adj.", definition: "随机的"}], phonetic: "/ˈrændəm/", example: "It was a random choice." },
  { english: "yield", meanings: [{pos: "v.", definition: "屈服；产出"}, {pos: "n.", definition: "产量"}], phonetic: "/jiːld/", example: "The trees yield a lot of fruit." },
  { english: "zealous", meanings: [{pos: "adj.", definition: "热心的；狂热的"}], phonetic: "/ˈzeləs/", example: "He is a zealous supporter of the cause." },
  { english: "concept", meanings: [{pos: "n.", definition: "概念；观念"}], phonetic: "/ˈkɒnsept/", example: "The concept of time is difficult." },
  { english: "decade", meanings: [{pos: "n.", definition: "十年"}], phonetic: "/ˈdekeɪd/", example: "Technology changed much in the last decade." },
  { english: "frequently", meanings: [{pos: "adv.", definition: "频繁地"}], phonetic: "/ˈfriːkwəntli/", example: "I frequently visit my grandparents." },
  { english: "impact", meanings: [{pos: "n.", definition: "巨大影响；撞击"}], phonetic: "/ˈɪmpækt/", example: "The crash had a major impact." },
  { english: "knowledge", meanings: [{pos: "n.", definition: "知识；了解"}], phonetic: "/ˈnɒlɪdʒ/", example: "He has a broad knowledge of history." },
  { english: "participate", meanings: [{pos: "v.", definition: "参与；参加"}], phonetic: "/pɑːˈtɪsɪpeɪt/", example: "Everyone should participate in the event." },
  { english: "qualify", meanings: [{pos: "v.", definition: "取得资格；使合格"}], phonetic: "/ˈkwɒlɪfaɪ/", example: "He qualified for the competition." },
  { english: "suspect", meanings: [{pos: "v.", definition: "怀疑"}, {pos: "n.", definition: "嫌疑人"}], phonetic: "/səˈspekt/", example: "The police suspect he stole the money." },
  { english: "temporary", meanings: [{pos: "adj.", definition: "暂时的"}], phonetic: "/ˈtemprəri/", example: "This is a temporary solution." },
  { english: "visual", meanings: [{pos: "adj.", definition: "视觉的"}], phonetic: "/ˈvɪʒuəl/", example: "The movie has great visual effects." }
];

export const getInitialVocabulary = (): Word[] => {
  // Fisher-Yates shuffle to avoid alphabet clustering
  const shuffled = [...CET4_RAW];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.map((w, idx) => ({
    id: `w-${idx}`,
    english: w.english || "",
    meanings: w.meanings || [],
    phonetic: w.phonetic || "",
    example: w.example || "",
    level: 0,
    lastReview: 0,
    nextReview: 0,
    isLearned: false
  }));
};
