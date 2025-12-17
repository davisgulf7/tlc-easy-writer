import type { SubjectItem, VerbItem, QualifierItem, ObjectItem } from './types';

// --- Subjects ---
export const subjects: SubjectItem[] = [
    { id: 's_i', type: 'subject', label: 'I', level: 1, person: '1', number: 'sg' },
    { id: 's_you', type: 'subject', label: 'You', level: 1, person: '2', number: 'sg' },
    { id: 's_we', type: 'subject', label: 'We', level: 1, person: '1', number: 'pl' },
    { id: 's_mom', type: 'subject', label: 'My Mom', level: 1, person: '3', number: 'sg' },
    { id: 's_dad', type: 'subject', label: 'My Dad', level: 1, person: '3', number: 'sg' },
    { id: 's_friend', type: 'subject', label: 'My Friend', level: 1, person: '3', number: 'sg' },
    { id: 's_teacher', type: 'subject', label: 'My Teacher', level: 1, person: '3', number: 'sg' },
    { id: 's_dog', type: 'subject', label: 'My Dog', level: 1, person: '3', number: 'sg' },
    // Level 2
    { id: 's_brother', type: 'subject', label: 'My Brother', level: 2, person: '3', number: 'sg' },
    { id: 's_sister', type: 'subject', label: 'My Sister', level: 2, person: '3', number: 'sg' },
    { id: 's_class', type: 'subject', label: 'My Class', level: 2, person: '3', number: 'pl' },
    { id: 's_baby', type: 'subject', label: 'My Baby', level: 2, person: '3', number: 'sg' },
];

// --- Verbs ---
export const verbs: VerbItem[] = [
    { id: 'v_like', type: 'verb', label: 'like', level: 1, baseForm: 'like', thirdPersonSingular: 'likes' },
    { id: 'v_dontlike', type: 'verb', label: "don't like", level: 1, baseForm: "don't like", thirdPersonSingular: "doesn't like" },
    { id: 'v_want', type: 'verb', label: 'want', level: 1, baseForm: 'want', thirdPersonSingular: 'wants' },
    { id: 'v_love', type: 'verb', label: 'love', level: 1, baseForm: 'love', thirdPersonSingular: 'loves' },
    { id: 'v_need', type: 'verb', label: 'need', level: 1, baseForm: 'need', thirdPersonSingular: 'needs' },
    { id: 'v_have', type: 'verb', label: 'have', level: 1, baseForm: 'have', thirdPersonSingular: 'has' },
    { id: 'v_see', type: 'verb', label: 'see', level: 1, baseForm: 'see', thirdPersonSingular: 'sees' },
    { id: 'v_hear', type: 'verb', label: 'hear', level: 1, baseForm: 'hear', thirdPersonSingular: 'hears' },
    // Level 2
    { id: 'v_eat', type: 'verb', label: 'eat', level: 2, baseForm: 'eat', thirdPersonSingular: 'eats' },
    { id: 'v_play', type: 'verb', label: 'play', level: 2, baseForm: 'play', thirdPersonSingular: 'plays' },
    { id: 'v_go', type: 'verb', label: 'go', level: 2, baseForm: 'go', thirdPersonSingular: 'goes' },
    { id: 'v_make', type: 'verb', label: 'make', level: 2, baseForm: 'make', thirdPersonSingular: 'makes' },
];

// --- Qualifiers ---
export const qualifiers: QualifierItem[] = [
    { id: 'q_big', type: 'qualifier', label: 'big', level: 1 },
    { id: 'q_small', type: 'qualifier', label: 'small', level: 1 },
    { id: 'q_red', type: 'qualifier', label: 'red', level: 1 },
    { id: 'q_blue', type: 'qualifier', label: 'blue', level: 1 },
    { id: 'q_loud', type: 'qualifier', label: 'loud', level: 1 },
    { id: 'q_quiet', type: 'qualifier', label: 'quiet', level: 1 },
    { id: 'q_happy', type: 'qualifier', label: 'happy', level: 1 },
    { id: 'q_sad', type: 'qualifier', label: 'sad', level: 1 },
    // Level 2
    { id: 'q_fast', type: 'qualifier', label: 'fast', level: 2 },
    { id: 'q_slow', type: 'qualifier', label: 'slow', level: 2 },
    { id: 'q_soft', type: 'qualifier', label: 'soft', level: 2 },
    { id: 'q_tasty', type: 'qualifier', label: 'tasty', level: 2 },
];

// --- Objects ---
export const objects: ObjectItem[] = [
    // Countable Singular (Logic: adds 'a'/'an')
    { id: 'o_ball', type: 'object', label: 'ball', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'balls' },
    { id: 'o_book', type: 'object', label: 'book', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'books' },
    { id: 'o_dog', type: 'object', label: 'dog', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'dogs' },

    // Set Plural (Logic: no article, just 'toys')
    { id: 'o_toys', type: 'object', label: 'toys', level: 1, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none' },

    // Mass Nouns (Logic: no article)
    { id: 'o_music', type: 'object', label: 'music', level: 1, nounType: 'mass', defaultNumber: 'sg', articlePolicy: 'none' },
    { id: 'o_pizza', type: 'object', label: 'pizza', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'pizzas' },

    // Proper/Place (Logic: might need 'the' or nothing)
    { id: 'o_playground', type: 'object', label: 'playground', level: 1, nounType: 'proper', defaultNumber: 'sg', articlePolicy: 'definite' }, // "the playground"
    { id: 'o_school', type: 'object', label: 'school', level: 1, nounType: 'proper', defaultNumber: 'sg', articlePolicy: 'none' },

    // Level 2
    { id: 'o_games', type: 'object', label: 'games', level: 2, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none' },
    { id: 'o_icecream', type: 'object', label: 'ice cream', level: 2, nounType: 'mass', defaultNumber: 'sg', articlePolicy: 'none' },
    { id: 'o_tablet', type: 'object', label: 'tablet', level: 2, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'tablets' },
    { id: 'o_cars', type: 'object', label: 'cars', level: 2, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none' },
];
