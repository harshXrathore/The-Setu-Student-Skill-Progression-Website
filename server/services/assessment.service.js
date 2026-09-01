const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Mistake = require('../models/Mistake');
const MasteryEngineService = require('./masteryEngine.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { addPoints, logActivity, triggerMilestone } = require('./gamification.service');

// Curated seed question bank for core foundational skills
const SEED_ASSESSMENTS = {
    'javascript': {
        title: 'JavaScript Core Proficiency Assessment',
        difficulty: 'intermediate',
        questions: [
            {
                questionId: 'js-1',
                question: 'What is the output of typeof NaN in JavaScript?',
                options: ['"number"', '"nan"', '"undefined"', '"object"'],
                correctAnswer: '"number"',
                explanation: 'In JavaScript, NaN (Not-a-Number) is a numeric data type representing an unrepresentable value.',
                topic: 'Types & Coercion',
                difficulty: 'easy'
            },
            {
                questionId: 'js-2',
                question: 'Which statement accurately describes a closure in JavaScript?',
                options: [
                    'A function bundled with references to its lexical environment',
                    'A method to close browser tabs programmatically',
                    'An object that seals all properties from deletion',
                    'A synchronous callback function'
                ],
                correctAnswer: 'A function bundled with references to its lexical environment',
                explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has executed.',
                topic: 'Scope & Closures',
                difficulty: 'medium'
            },
            {
                questionId: 'js-3',
                question: 'How does Promise.all() handle rejected promises?',
                options: [
                    'It rejects immediately with the first rejection reason',
                    'It ignores rejections and returns only fulfilled promises',
                    'It waits for all promises regardless of rejections',
                    'It retries failed promises up to 3 times'
                ],
                correctAnswer: 'It rejects immediately with the first rejection reason',
                explanation: 'Promise.all rejects immediately upon any promise being rejected (fail-fast behavior).',
                topic: 'Asynchronous Programming',
                difficulty: 'medium'
            },
            {
                questionId: 'js-4',
                question: 'What does the event loop microtask queue prioritize over the macrotask queue?',
                options: [
                    'Microtasks (e.g. Promises, queueMicrotask) execute before the next macrotask (e.g. setTimeout)',
                    'Macrotasks execute first, followed by microtasks',
                    'Both queues are executed in round-robin interleaving',
                    'Microtasks are deferred until UI rendering is idle'
                ],
                correctAnswer: 'Microtasks (e.g. Promises, queueMicrotask) execute before the next macrotask (e.g. setTimeout)',
                explanation: 'After each macrotask, the microtask queue is completely drained before picking the next macrotask.',
                topic: 'Event Loop',
                difficulty: 'hard'
            },
            {
                questionId: 'js-5',
                question: 'Which method creates a deep copy of an object supporting circular references in modern JavaScript?',
                options: [
                    'structuredClone()',
                    'JSON.parse(JSON.stringify())',
                    'Object.assign()',
                    'Spread operator ({...obj})'
                ],
                correctAnswer: 'structuredClone()',
                explanation: 'structuredClone() provides native deep copying and handles circular references and nested types.',
                topic: 'Objects & Memory',
                difficulty: 'medium'
            }
        ]
    },
    'python': {
        title: 'Python Fundamentals & Data Structures Assessment',
        difficulty: 'intermediate',
        questions: [
            {
                questionId: 'py-1',
                question: 'What is the time complexity of looking up a key in a Python dictionary on average?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
                correctAnswer: 'O(1)',
                explanation: 'Python dictionaries are implemented using hash tables, giving average O(1) lookup.',
                topic: 'Data Structures',
                difficulty: 'easy'
            },
            {
                questionId: 'py-2',
                question: 'What keyword is used to create a generator function in Python?',
                options: ['yield', 'generate', 'return async', 'iter'],
                correctAnswer: 'yield',
                explanation: 'The yield keyword turns a standard function into a generator iterator.',
                topic: 'Generators & Iterators',
                difficulty: 'medium'
            },
            {
                questionId: 'py-3',
                question: 'What is the Global Interpreter Lock (GIL) in CPython?',
                options: [
                    'A mutex that allows only one native thread to execute Python bytecode at a time',
                    'A security sandbox preventing unauthorized file writes',
                    'A memory garbage collector for circular references',
                    'A compile-time type-checking lock'
                ],
                correctAnswer: 'A mutex that allows only one native thread to execute Python bytecode at a time',
                explanation: 'The GIL prevents race conditions by synchronizing thread execution in CPython.',
                topic: 'Concurrency & Architecture',
                difficulty: 'hard'
            },
            {
                questionId: 'py-4',
                question: 'Which of the following data types in Python is immutable?',
                options: ['Tuple', 'List', 'Set', 'Dictionary'],
                correctAnswer: 'Tuple',
                explanation: 'Tuples cannot be modified after creation, making them immutable and hashable.',
                topic: 'Data Types',
                difficulty: 'easy'
            },
            {
                questionId: 'py-5',
                question: 'How do list comprehensions differ from generator expressions in terms of memory?',
                options: [
                    'List comprehensions construct the full list in memory; generator expressions stream values lazily',
                    'Generator expressions use more memory due to iterator caching',
                    'There is no memory difference',
                    'List comprehensions are strictly evaluated on disk'
                ],
                correctAnswer: 'List comprehensions construct the full list in memory; generator expressions stream values lazily',
                explanation: 'Generator expressions use lazy evaluation, using constant memory regardless of sequence size.',
                topic: 'Memory & Performance',
                difficulty: 'medium'
            }
        ]
    },
    'react': {
        title: 'React Architecture & Hooks Assessment',
        difficulty: 'intermediate',
        questions: [
            {
                questionId: 'react-1',
                question: 'What happens when you call useState setter with the exact same primitive value?',
                options: [
                    'React bails out without re-rendering the component or children',
                    'React throws a warning in strict mode',
                    'React force-renders the entire subtree',
                    'The state reverts to undefined'
                ],
                correctAnswer: 'React bails out without re-rendering the component or children',
                explanation: 'React compares previous and next states using Object.is() and bails out if unchanged.',
                topic: 'State Management',
                difficulty: 'medium'
            },
            {
                questionId: 'react-2',
                question: 'What is the purpose of the dependency array in useEffect?',
                options: [
                    'To tell React when to re-run the effect if dependencies change between renders',
                    'To define which child components to render',
                    'To import external npm libraries',
                    'To serialize state to localStorage'
                ],
                correctAnswer: 'To tell React when to re-run the effect if dependencies change between renders',
                explanation: 'React compares items in the dependency array across renders to decide whether to re-execute the effect callback.',
                topic: 'Hooks Lifecycle',
                difficulty: 'easy'
            },
            {
                questionId: 'react-3',
                question: 'Why should keys in lists be stable, unique identifiers instead of array indexes?',
                options: [
                    'Array indexes cause reconciliation bugs and state loss when items are reordered or removed',
                    'React throws a compile error if index is used',
                    'Keys are required for CSS styling',
                    'Indexes consume more RAM in the virtual DOM'
                ],
                correctAnswer: 'Array indexes cause reconciliation bugs and state loss when items are reordered or removed',
                explanation: 'Keys help React identify which items have changed, been added, or been removed.',
                topic: 'Reconciliation',
                difficulty: 'medium'
            },
            {
                questionId: 'react-4',
                question: 'When should useMemo or useCallback be used?',
                options: [
                    'When passing callbacks to optimized children relying on reference equality or skipping expensive computations',
                    'On every single variable and function in every component',
                    'Only for async API calls',
                    'To replace Redux state stores'
                ],
                correctAnswer: 'When passing callbacks to optimized children relying on reference equality or skipping expensive computations',
                explanation: 'Overusing memoization has overhead; use it when preserving referential equality or caching costly computations.',
                topic: 'Performance Optimization',
                difficulty: 'hard'
            },
            {
                questionId: 'react-5',
                question: 'What is the primary benefit of React Server Components (RSC)?',
                options: [
                    'Zero bundle size for server components and direct access to backend resources',
                    'Replacing HTML with WebGL rendering',
                    'Automatic multi-threading on the client CPU',
                    'Bypassing CSS stylesheets'
                ],
                correctAnswer: 'Zero bundle size for server components and direct access to backend resources',
                explanation: 'Server Components run on the server and send rendered UI without sending JavaScript dependencies to the client.',
                topic: 'Modern React Architecture',
                difficulty: 'hard'
            }
        ]
    },
    'siem': {
        title: 'SIEM & Security Log Analysis Assessment',
        difficulty: 'intermediate',
        questions: [
            {
                questionId: 'siem-1',
                question: 'What is the primary role of a SIEM system in a Security Operations Center (SOC)?',
                options: [
                    'Aggregating, correlating, and analyzing log data across disparate sources for threat detection',
                    'Replacing firewalls and antivirus software',
                    'Writing software source code automatically',
                    'Performing network cabling management'
                ],
                correctAnswer: 'Aggregating, correlating, and analyzing log data across disparate sources for threat detection',
                explanation: 'SIEM (Security Information and Event Management) provides centralized visibility, correlation rules, and alerts.',
                topic: 'SIEM Architecture',
                difficulty: 'easy'
            },
            {
                questionId: 'siem-2',
                question: 'Which log source is essential for detecting lateral movement using Pass-the-Hash in Windows environments?',
                options: [
                    'Windows Event ID 4624 (Logon Type 3) and Security logs',
                    'Application crash dumps',
                    'Browser bookmark history',
                    'Print spooler logs only'
                ],
                correctAnswer: 'Windows Event ID 4624 (Logon Type 3) and Security logs',
                explanation: 'Logon Type 3 (Network logon) with NTLM authentication is a primary indicator of lateral authentication.',
                topic: 'Threat Detection',
                difficulty: 'hard'
            },
            {
                questionId: 'siem-3',
                question: 'What is log normalization in SIEM architecture?',
                options: [
                    'Converting logs from multiple vendors into a standard schema (e.g. ECS / CEF / CIM)',
                    'Deleting all error entries to save storage',
                    'Encrypting logs so administrators cannot read them',
                    'Translating foreign language text'
                ],
                correctAnswer: 'Converting logs from multiple vendors into a standard schema (e.g. ECS / CEF / CIM)',
                explanation: 'Normalization maps disparate field names (e.g., src_ip, SourceAddress, c-ip) to a single standard field name.',
                topic: 'Data Ingestion & Parsing',
                difficulty: 'medium'
            },
            {
                questionId: 'siem-4',
                question: 'How do correlation rules trigger security alerts in a SIEM?',
                options: [
                    'By evaluating temporal and logical patterns across multiple events (e.g., 5 failed logins followed by success within 1 min)',
                    'By randomly sampling 1% of all traffic',
                    'By checking if a server has rebooted',
                    'By measuring bandwidth usage once a week'
                ],
                correctAnswer: 'By evaluating temporal and logical patterns across multiple events (e.g., 5 failed logins followed by success within 1 min)',
                explanation: 'Correlation links multiple disparate events over a time window to detect complex attack patterns.',
                topic: 'Correlation & Rules',
                difficulty: 'medium'
            },
            {
                questionId: 'siem-5',
                question: 'What is the MITRE ATT&CK framework commonly used for in SIEM detection engineering?',
                options: [
                    'Mapping detection rules to specific adversary tactics, techniques, and procedures (TTPs)',
                    'Replacing password policies',
                    'Generating SSL certificates',
                    'Configuring DNS servers'
                ],
                correctAnswer: 'Mapping detection rules to specific adversary tactics, techniques, and procedures (TTPs)',
                explanation: 'MITRE ATT&CK provides a structured knowledge base of attacker techniques to ensure defense coverage.',
                topic: 'Threat Hunting & Frameworks',
                difficulty: 'medium'
            }
        ]
    },
    'sql': {
        title: 'SQL & Relational Database Design Assessment',
        difficulty: 'intermediate',
        questions: [
            {
                questionId: 'sql-1',
                question: 'What is the difference between WHERE and HAVING clauses in SQL?',
                options: [
                    'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY',
                    'HAVING is used for string comparisons; WHERE is for numbers',
                    'WHERE can only be used in subqueries',
                    'There is no functional difference'
                ],
                correctAnswer: 'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY',
                explanation: 'WHERE filters individual records prior to grouping; HAVING filters aggregated results.',
                topic: 'Query Filtering',
                difficulty: 'easy'
            },
            {
                questionId: 'sql-2',
                question: 'What type of index is typically used by default for B-Tree indexing in relational databases?',
                options: [
                    'Balanced Tree (B-Tree) supporting range queries and equality lookups',
                    'Bitmap index only',
                    'Unordered linked list',
                    'Full-text inverted index only'
                ],
                correctAnswer: 'Balanced Tree (B-Tree) supporting range queries and equality lookups',
                explanation: 'B-Trees maintain sorted data allowing O(log n) searches, insertions, and range scans.',
                topic: 'Indexing & Performance',
                difficulty: 'medium'
            },
            {
                questionId: 'sql-3',
                question: 'What ACID property ensures that a transaction is all-or-nothing?',
                options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
                correctAnswer: 'Atomicity',
                explanation: 'Atomicity guarantees that all operations within a transaction complete successfully, or all are rolled back.',
                topic: 'ACID Transactions',
                difficulty: 'easy'
            },
            {
                questionId: 'sql-4',
                question: 'What occurs during a database Deadlock?',
                options: [
                    'Two or more transactions hold locks that the other transactions need, causing a circular wait',
                    'The database server runs out of disk space',
                    'A table reaches maximum row capacity',
                    'A query syntax error occurs'
                ],
                correctAnswer: 'Two or more transactions hold locks that the other transactions need, causing a circular wait',
                explanation: 'Deadlocks happen when competing transactions are stuck waiting on each other’s locks.',
                topic: 'Concurrency & Locking',
                difficulty: 'hard'
            },
            {
                questionId: 'sql-5',
                question: 'What is Third Normal Form (3NF) in relational schema normalization?',
                options: [
                    'It is in 2NF and has no transitive functional dependencies on the primary key',
                    'It contains at least three foreign keys',
                    'All tables have exactly three columns',
                    'Indexes are created on all string fields'
                ],
                correctAnswer: 'It is in 2NF and has no transitive functional dependencies on the primary key',
                explanation: '3NF eliminates transitive dependencies (every non-prime attribute must depend directly on the key).',
                topic: 'Schema Normalization',
                difficulty: 'medium'
            }
        ]
    }
};

class AssessmentService {
    /**
     * Get or generate an assessment for a given skill
     * @param {string} skillName
     * @param {string} difficulty
     * @returns {Promise<Object>} Assessment document
     */
    async getOrGenerateAssessment(skillName, difficulty = 'intermediate') {
        const norm = (skillName || '').trim().toLowerCase();
        const skillRegex = new RegExp(`^${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        // 1. Look for existing in DB
        let assessment = await Assessment.findOne({ skill: { $regex: skillRegex } });
        if (assessment) return assessment;

        // 2. Check curated seed bank
        for (const [key, seedData] of Object.entries(SEED_ASSESSMENTS)) {
            if (norm.includes(key) || key.includes(norm)) {
                assessment = await Assessment.create({
                    title: seedData.title,
                    skill: skillName,
                    category: 'Core Engineering',
                    difficulty: seedData.difficulty || difficulty,
                    questions: seedData.questions,
                    isSystem: true
                });
                return assessment;
            }
        }

        // 3. Dynamic generation with Gemini (with fallback)
        try {
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

                const prompt = `Generate a 5-question multiple choice technical assessment for the skill "${skillName}".
Return ONLY a valid JSON object strictly following this format:
{
  "title": "${skillName} Technical Assessment",
  "difficulty": "${difficulty}",
  "category": "Technical",
  "questions": [
    {
      "questionId": "q-1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string of correct option",
      "explanation": "Why this answer is correct",
      "topic": "Topic Name",
      "difficulty": "medium"
    }
  ]
}`;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);

                if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
                    assessment = await Assessment.create({
                        title: parsed.title || `${skillName} Skills Assessment`,
                        skill: skillName,
                        category: parsed.category || 'General',
                        difficulty: parsed.difficulty || difficulty,
                        questions: parsed.questions,
                        isSystem: false
                    });
                    return assessment;
                }
            }
        } catch (genError) {
            console.error('[AssessmentService] Dynamic generation failed, using fallback:', genError.message);
        }

        // 4. Resilient universal fallback assessment
        assessment = await Assessment.create({
            title: `${skillName} Core Concepts Assessment`,
            skill: skillName,
            category: 'General',
            difficulty: 'intermediate',
            questions: [
                {
                    questionId: `${norm}-1`,
                    question: `What is the foundational paradigm behind ${skillName}?`,
                    options: [
                        `Industry standard architectural practices and specifications for ${skillName}`,
                        `A legacy deprecated framework no longer supported`,
                        `An unauthenticated plain-text communication protocol`,
                        `A proprietary closed-source binary tool`
                    ],
                    correctAnswer: `Industry standard architectural practices and specifications for ${skillName}`,
                    explanation: `${skillName} adheres to established modern engineering standards.`,
                    topic: 'Fundamentals',
                    difficulty: 'easy'
                },
                {
                    questionId: `${norm}-2`,
                    question: `Which best practice is crucial when deploying and configuring ${skillName}?`,
                    options: [
                        'Implementing robust error handling, monitoring, and automated validation',
                        'Disabling all security controls to improve execution speed',
                        'Hardcoding sensitive production credentials in source control',
                        'Skipping integration and unit tests'
                    ],
                    correctAnswer: 'Implementing robust error handling, monitoring, and automated validation',
                    explanation: 'Reliable systems require structured observability and proactive error handling.',
                    topic: 'Best Practices',
                    difficulty: 'medium'
                },
                {
                    questionId: `${norm}-3`,
                    question: `How does ${skillName} optimize throughput and resource utilization?`,
                    options: [
                        'Through efficient memory management, caching, and scalable architecture',
                        'By continuously running infinite polling loops without delay',
                        'By consuming 100% CPU on idle states',
                        'By disabling concurrency'
                    ],
                    correctAnswer: 'Through efficient memory management, caching, and scalable architecture',
                    explanation: 'Resource optimization minimizes latency and hardware bottlenecks.',
                    topic: 'Performance & Scaling',
                    difficulty: 'medium'
                }
            ],
            isSystem: true
        });

        return assessment;
    }

    /**
     * Submit and grade an assessment attempt
     * @param {string} userId
     * @param {string} assessmentId
     * @param {Array<{ questionId: string, selectedOption: string }>} submittedAnswers
     * @param {number} timeSpentSeconds
     * @returns {Promise<Object>} Attempt result and mastery updates
     */
    async submitAttempt(userId, assessmentId, submittedAnswers = [], timeSpentSeconds = 0) {
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            throw new Error('Assessment not found');
        }

        const skillName = assessment.skill;
        let correctCount = 0;
        let incorrectCount = 0;
        const questionResponses = [];
        const mistakesLogged = [];

        for (const q of assessment.questions) {
            const userAns = (submittedAnswers || []).find(a => a.questionId === q.questionId || a.questionId === q._id?.toString());
            const selectedOption = userAns ? userAns.selectedOption : '';
            const isCorrect = selectedOption === q.correctAnswer;

            if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;

                // Automatically log/update a Mistake record for incorrect answers
                const severityMap = { easy: 2, medium: 3, hard: 4 };
                const severity = severityMap[q.difficulty] || 3;

                try {
                    const mistake = await Mistake.findOneAndUpdate(
                        {
                            userId,
                            skillTag: skillName,
                            title: `Mistake in ${skillName}: ${q.topic || 'Concept'}`,
                            status: 'open'
                        },
                        {
                            $setOnInsert: {
                                description: `Question: "${q.question}"\nSelected: "${selectedOption || 'None'}"\nExpected: "${q.correctAnswer}"\nExplanation: ${q.explanation || ''}`,
                                category: 'conceptual',
                                severity,
                                source: 'assessment'
                            },
                            $inc: { count: 1 }
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    mistakesLogged.push(mistake);
                } catch (mistakeErr) {
                    console.error('[AssessmentService] Mistake logging error:', mistakeErr);
                }
            }

            questionResponses.push({
                questionId: q.questionId,
                question: q.question,
                selectedOption,
                correctAnswer: q.correctAnswer,
                isCorrect,
                topic: q.topic,
                difficulty: q.difficulty
            });
        }

        const totalQuestions = assessment.questions.length || 1;
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Count previous attempts
        const previousAttemptsCount = await AssessmentAttempt.countDocuments({ userId, skill: skillName });

        // Save Attempt
        const attempt = await AssessmentAttempt.create({
            userId,
            assessmentId: assessment._id,
            skill: skillName,
            difficulty: assessment.difficulty,
            questions: questionResponses,
            correctAnswersCount: correctCount,
            incorrectAnswersCount: incorrectCount,
            totalQuestions,
            score,
            attemptNumber: previousAttemptsCount + 1,
            timeSpentSeconds
        });

        // Trigger Mastery Recalculation
        const updatedMastery = await MasteryEngineService.recalculateUserSkillMastery(userId, skillName);

        // Gamification hooks
        try {
            const pointsToAward = score >= 80 ? 70 : (score >= 50 ? 40 : 20);
            await addPoints(userId, pointsToAward);
            await logActivity(userId, 'assessment_completed');
            if (score >= 80) {
                await triggerMilestone(userId, 'High Assessment Score');
            }
        } catch (gamErr) {
            console.error('[Gamification] Assessment points hook error:', gamErr);
        }

        return {
            attempt,
            isPassed: score >= 70,
            score,
            correctCount,
            totalQuestions,
            mistakesLoggedCount: mistakesLogged.length,
            updatedMastery
        };
    }

    /**
     * Get user's assessment attempts history
     * @param {string} userId
     * @param {string} skill
     * @returns {Promise<Array>}
     */
    async getUserHistory(userId, skill = null) {
        const query = { userId };
        if (skill) {
            query.skill = new RegExp(`^${skill.trim()}$`, 'i');
        }
        return AssessmentAttempt.find(query).sort({ createdAt: -1 }).limit(20);
    }
}

module.exports = new AssessmentService();
