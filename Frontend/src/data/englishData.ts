export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  explanation: string;
  rules: string[];
  example: string;
  commonMistakes: { incorrect: string; correct: string; reason: string }[];
  quiz?: QuizQuestion[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: "speaking" | "grammar" | "vocab";
}

export const grammarLessons: Lesson[] = [
  {
    id: "g1",
    title: "Subject–Verb Agreement",
    concept: "The verb must agree with its subject in number and person.",
    explanation:
      "A singular subject takes a singular verb, whereas a plural subject takes a plural verb. In present tense, singular verbs end with 's' or 'es' (he works, she writes), while plural subjects take the base verb (they work, we write).",
    rules: [
      "Singular subjects take singular verbs: 'The student studies hard.'",
      "Plural subjects take plural verbs: 'The students study hard.'",
      "Words like 'everyone', 'somebody', 'each', 'neither' take singular verbs: 'Everyone is ready.'",
      "Subjects joined by 'and' usually take a plural verb: 'Riya and Rahul are coming.'",
      "Subjects joined by 'or' or 'nor' agree with the subject closest to the verb: 'Neither the manager nor the employees were present.'",
    ],
    example: "She writes daily. ✓  /  She write daily. ✗",
    commonMistakes: [
      {
        incorrect: "One of my friends live in London.",
        correct: "One of my friends lives in London.",
        reason: "The subject is 'One' (singular), not 'friends'.",
      },
      {
        incorrect: "Everyone have finished their task.",
        correct: "Everyone has finished their task.",
        reason: "'Everyone' is an indefinite singular pronoun.",
      },
    ],
    quiz: [
      {
        id: "g1_q1",
        question: "Choose the correct sentence:",
        options: [
          "Neither of the answers are correct.",
          "Neither of the answers is correct.",
          "Neither of the answers were correct.",
          "Neither of the answers have been correct.",
        ],
        correctAnswer: 1,
        explanation: "'Neither' takes a singular verb ('is').",
      },
      {
        id: "g1_q2",
        question: "Fill in the blank: 'The team _____ preparing for the product launch.'",
        options: ["is", "are", "were", "have"],
        correctAnswer: 0,
        explanation: "Collective nouns acting as a single unit take singular verbs ('is').",
      },
      {
        id: "g1_q3",
        question: "Which verb correctly completes: 'A list of requirements _____ been sent.'?",
        options: ["have", "has", "are", "were"],
        correctAnswer: 1,
        explanation: "The subject is 'list' (singular), so 'has' is correct.",
      },
    ],
  },
  {
    id: "g2",
    title: "Tenses Overview",
    concept: "Past, present, and future — each with simple, continuous, perfect, and perfect-continuous.",
    explanation:
      "Tenses express the time of an action. Simple tense describes habits or facts; Continuous describes ongoing actions; Perfect describes completed actions with present relevance; Perfect Continuous describes actions starting in the past and continuing up to the present.",
    rules: [
      "Simple Present: Base verb (+ s/es). Habitual actions & eternal truths.",
      "Present Perfect: Has/Have + Past Participle (V3). Actions completed recently with impact now.",
      "Present Perfect Continuous: Has/Have + been + V-ing. Duration of ongoing action ('for 2 hours').",
      "Past Simple vs Past Perfect: Past Perfect (had + V3) happens before another past event.",
    ],
    example: "I have been studying for 2 hours.",
    commonMistakes: [
      {
        incorrect: "I am living in Bangalore since 2020.",
        correct: "I have been living in Bangalore since 2020.",
        reason: "Use Present Perfect Continuous for actions starting in past and continuing till now.",
      },
      {
        incorrect: "Did you saw the presentation?",
        correct: "Did you see the presentation?",
        reason: "After auxiliary verb 'did', always use base form (V1).",
      },
    ],
    quiz: [
      {
        id: "g2_q1",
        question: "Identify the correct tense: 'By next year, I _____ my degree.'",
        options: [
          "will complete",
          "will have completed",
          "am completing",
          "have completed",
        ],
        correctAnswer: 1,
        explanation: "Future Perfect ('will have completed') is used for actions completed before a future time.",
      },
      {
        id: "g2_q2",
        question: "Fill in the blank: 'She _____ for this company since 2018.'",
        options: ["works", "is working", "has been working", "worked"],
        correctAnswer: 2,
        explanation: "Use Present Perfect Continuous ('has been working') with 'since' for time duration.",
      },
    ],
  },
  {
    id: "g3",
    title: "Articles (a, an, the)",
    concept: "Use 'a/an' for non-specific singular nouns; 'the' for specific ones.",
    explanation:
      "Indefinite articles 'a' and 'an' are used before non-specific singular countable nouns ('a' before consonant sounds, 'an' before vowel sounds). Definite article 'the' is used before unique or previously mentioned nouns.",
    rules: [
      "Use 'a' before consonant SOUNDS: a university, a European, a book.",
      "Use 'an' before vowel SOUNDS: an hour, an honest person, an engineer.",
      "Use 'the' when both speaker and listener know which specific item is referred to.",
      "Do NOT use articles before uncountable nouns or plurals in general statements ('Love is essential').",
    ],
    example: "I saw a dog. The dog was friendly.",
    commonMistakes: [
      {
        incorrect: "He is an university professor.",
        correct: "He is a university professor.",
        reason: "'University' starts with a consonant 'yoo' sound.",
      },
      {
        incorrect: "I waited for a hour.",
        correct: "I waited for an hour.",
        reason: "'Hour' has a silent 'h' and starts with a vowel sound.",
      },
    ],
    quiz: [
      {
        id: "g3_q1",
        question: "Select the correct article: 'It was _____ honor to meet the CEO.'",
        options: ["a", "an", "the", "no article"],
        correctAnswer: 1,
        explanation: "'Honor' starts with a vowel sound ('ah'), so use 'an'.",
      },
      {
        id: "g3_q2",
        question: "Which sentence is grammatically correct?",
        options: [
          "The honesty is the best policy.",
          "A honesty is best policy.",
          "Honesty is the best policy.",
          "An honesty is the best policy.",
        ],
        correctAnswer: 2,
        explanation: "Abstract nouns like 'honesty' do not take an article in general statements.",
      },
    ],
  },
  {
    id: "g4",
    title: "Prepositions",
    concept: "Words showing relationship in space, time, or direction — in, on, at, by, with…",
    explanation:
      "Prepositions connect nouns or pronouns to other words in a sentence. Using the wrong preposition is one of the most common errors in business and casual speech.",
    rules: [
      "Time: 'at' (specific time: at 5 PM), 'on' (days/dates: on Monday), 'in' (months/years/seasons: in July, in 2024).",
      "Place: 'at' (exact point/address), 'in' (enclosed space/city/country), 'on' (surface).",
      "Movement: 'into' (entering inside), 'onto' (moving to a surface).",
    ],
    example: "She arrived at 5pm on Monday in June.",
    commonMistakes: [
      {
        incorrect: "We discussed about the project.",
        correct: "We discussed the project.",
        reason: "'Discuss' does not take 'about'. Use 'talk about' or 'discuss'.",
      },
      {
        incorrect: "I am good in coding.",
        correct: "I am good at coding.",
        reason: "Use 'good at' or 'proficient in' for skills.",
      },
    ],
    quiz: [
      {
        id: "g4_q1",
        question: "Choose the correct preposition: 'She excels _____ problem-solving.'",
        options: ["at", "in", "on", "with"],
        correctAnswer: 1,
        explanation: "'Excel in' is the standard idiom for areas of study or skills.",
      },
      {
        id: "g4_q2",
        question: "Fill in the blank: 'The meeting will take place _____ Monday morning.'",
        options: ["at", "in", "on", "by"],
        correctAnswer: 2,
        explanation: "Use 'on' for specific days and day parts ('on Monday morning').",
      },
    ],
  },
  {
    id: "g5",
    title: "Active vs Passive Voice",
    concept: "Active emphasizes the doer; passive emphasizes the receiver of the action.",
    explanation:
      "Active voice is concise and direct ('The dev fixed the bug'). Passive voice is useful when the actor is unknown, secret, or less important than the result ('The bug was fixed').",
    rules: [
      "Active: Subject + Verb + Object ('Riya wrote the code').",
      "Passive: Object + Form of 'be' + V3 (Past Participle) + by Subject ('The code was written by Riya').",
      "Use Active Voice for clear, strong technical and professional writing.",
    ],
    example: "Riya wrote the letter. → The letter was written by Riya.",
    commonMistakes: [
      {
        incorrect: "The report was write by John.",
        correct: "The report was written by John.",
        reason: "Passive voice requires past participle (V3) 'written'.",
      },
    ],
    quiz: [
      {
        id: "g5_q1",
        question: "Convert to Passive: 'The engineer deployed the new release.'",
        options: [
          "The new release was deployed by the engineer.",
          "The new release is deployed by engineer.",
          "The new release deployed the engineer.",
          "The new release has deployed by engineer.",
        ],
        correctAnswer: 0,
        explanation: "Past simple active becomes 'was + V3' in passive voice.",
      },
    ],
  },
];

export const vocabularyLessons: Lesson[] = [
  {
    id: "v1",
    title: "Word of the Day: Ephemeral",
    concept: "Lasting for a very short time; transient.",
    explanation: "Derived from Greek, meaning lasting only one day. Useful in describing short-lived tech trends or emotions.",
    rules: ["Synonyms: fleeting, transient, brief, temporary.", "Antonyms: permanent, enduring, lasting."],
    example: "Social media trends are ephemeral.",
    commonMistakes: [{ incorrect: "Ephemeral memory", correct: "Volatile / Short-term memory", reason: "'Ephemeral' is used mostly for abstract concepts or experiences." }],
  },
  {
    id: "v2",
    title: "Phrasal Verbs in Tech",
    concept: "Verb + preposition combination creating idiomatic meaning.",
    explanation: "Phrasal verbs are heavily used in informal and team communications.",
    rules: ["Roll out = release a product gradually", "Carry out = perform or execute a task", "Break down = analyze in detail"],
    example: "We will roll out the update tonight.",
    commonMistakes: [{ incorrect: "We will make a roll out of the feature.", correct: "We will roll out the feature.", reason: "Use as a verb ('roll out')." }],
  },
  {
    id: "v3",
    title: "Business & Professional English",
    concept: "Common terminology in software companies and workplace communication.",
    explanation: "Mastering professional terms improves workplace credibility.",
    rules: ["Deliverables = tangible results of a project", "Stakeholders = anyone impacted by project outcome", "Bandwidth = availability to take on work"],
    example: "I don't have the bandwidth to take on a new task this sprint.",
    commonMistakes: [{ incorrect: "I don't have time capacity.", correct: "I don't have bandwidth.", reason: "Idiomatic business English usage." }],
  },
];

export const speakingLessons: Lesson[] = [
  {
    id: "s1",
    title: "Self Introduction for Tech Interviews",
    concept: "Structure: Greeting → Current Role → Background → Key Skills → Passion & Career Goal.",
    explanation: "Your 60-second elevator pitch sets the tone for your job interview.",
    rules: ["Keep it under 90 seconds.", "Focus on achievements and technical stacks.", "End with why you are excited for this role."],
    example: "Hi, I'm Aarav, a Full-Stack developer passionate about building cloud-native apps...",
    commonMistakes: [{ incorrect: "My name is Aarav and my hobbies are watching movies.", correct: "Focus on technical achievements and problem-solving skills.", reason: "Tech interviews prioritize professional competence." }],
  },
  {
    id: "s2",
    title: "The STAR Technique for Behavioral Questions",
    concept: "Situation, Task, Action, Result.",
    explanation: "Framework to answer 'Tell me about a time when...' questions effectively.",
    rules: ["Situation: Set the context briefly.", "Task: Explain what needed to be solved.", "Action: Focus 60% of your time on YOUR specific actions.", "Result: End with quantifiable metrics (e.g. 'reduced load time by 30%')."],
    example: "When my team faced a memory leak (S), I investigated heap dumps (A) and reduced RAM usage by 40% (R).",
    commonMistakes: [{ incorrect: "We fixed the bug together.", correct: "I identified the root cause and refactored the module.", reason: "Highlight YOUR individual contribution." }],
  },
];

export const SPEAKING_PHRASES = [
  "She sells seashells by the seashore.",
  "I am passionate about building scalable web applications.",
  "Could you please repeat that more clearly?",
  "Innovation distinguishes between a leader and a follower.",
  "Our team successfully delivered the project ahead of the deadline.",
  "Effective communication is the key to remote team collaboration.",
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: "dc1", title: "Pronunciation Master", description: "Practice speaking 2 phrases with over 80% accuracy.", points: 50, type: "speaking" },
  { id: "dc2", title: "Grammar Quiz Whiz", description: "Complete any Grammar lesson and score 100% on the quiz.", points: 50, type: "grammar" },
  { id: "dc3", title: "Vocab Booster", description: "Review 1 vocabulary lesson concept and examples.", points: 30, type: "vocab" },
];
