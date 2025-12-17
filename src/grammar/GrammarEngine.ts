import type { SubjectItem, VerbItem, ObjectItem, QualifierItem, VocabularyItem, PhraseItem } from './types';

/**
 * Helper to check if a word starts with a vowel sound.
 * Simple heuristic for Phase 3.
 */
function startsWithVowelSound(word: string): boolean {
    return /^[aeiou]/i.test(word);
}

/**
 * Conjugates the verb based on the subject's person and number.
 */
export function conjugateVerb(subject: SubjectItem, verb: VerbItem): string {
    // 3rd Person Singular logic (He/She/It logic)
    if (subject.person === '3' && subject.number === 'sg') {
        return verb.thirdPersonSingular;
    }
    return verb.baseForm;
}

/**
 * Constructs a Noun Phrase (Article + Qualifiers + Noun).
 * Handles 'a' vs 'an' based on the FIRST word of the phrase (qualifier or noun).
 */
export function resolveNounPhrase(object: ObjectItem, qualifiers: QualifierItem[] = []): string {
    const words: string[] = [];

    // 1. Gather the "content" words first to determine sound for 'a/an'
    // Order: Qualifiers -> Noun
    const contentWords = [
        ...qualifiers.map(q => q.label),
        // Use plural form if we were forcing plural, but for now use label (which assumes singular for countable usually)
        // TODO: In future phases, check if we want plural form here.
        object.label
    ];

    const firstSoundWord = contentWords[0];

    // 2. Determine Article
    if (object.articlePolicy === 'definite') {
        words.push('the');
    } else if (object.articlePolicy === 'auto_indefinite') {
        if (startsWithVowelSound(firstSoundWord)) {
            words.push('an');
        } else {
            words.push('a');
        }
    }
    // 'none' policy adds nothing

    // 3. Add Content Words
    words.push(...contentWords);

    return words.join(' ');
}

/**
 * Main Sentence Constructor.
 * Takes a list of raw VocabularyItems and assembles them.
 */
export function constructSentence(items: VocabularyItem[]): string {
    if (items.length === 0) return '';

    // Sort/Bucket items by type to handle order
    const subject = items.find(i => i.type === 'subject') as SubjectItem | undefined;
    const verb = items.find(i => i.type === 'verb') as VerbItem | undefined;
    const object = items.find(i => i.type === 'object') as ObjectItem | undefined;
    const qualifiers = items.filter(i => i.type === 'qualifier') as QualifierItem[];
    const phrases = items.filter(i => i.type === 'phrase') as PhraseItem[];

    const parts: string[] = [];

    // 1. Subject
    if (subject) {
        parts.push(subject.label);
    }

    // 2. Verb
    if (verb) {
        if (subject) {
            parts.push(conjugateVerb(subject, verb));
        } else {
            // If no subject yet, just show base form (or maybe nothing? User choice. Showing base form is clearer feedback)
            parts.push(verb.baseForm);
        }
    }

    // 3. Object / Noun Phrase
    if (object) {
        parts.push(resolveNounPhrase(object, qualifiers));
    } else if (qualifiers.length > 0) {
        // Dangling qualifiers without an object? Just show them.
        parts.push(...qualifiers.map(q => q.label));
    }

    // 4. Phrases (Append at the end)
    if (phrases.length > 0) {
        parts.push(...phrases.map(p => p.label));
    }

    // Capitalize first letter of the sentence
    if (parts.length > 0) {
        const fullString = parts.join(' ');
        const sentenceText = fullString.charAt(0).toUpperCase() + fullString.slice(1);

        // Heuristic for "Complete Sentence" to decide on the period:
        // 1. Must have a Subject and a Verb.
        // 2. MUST have an object (User feedback: "I want" is not complete).
        // This implicitly handles intransitive verbs like "I sleep" which might not need an object, 
        // but for this app's current vocabulary (active construction), requiring an object is safer 
        // to avoid premature periods.
        // Also consider a sentence complete if it's just a phrase? e.g. "Yes."
        const isComplete = (!!subject && !!verb && !!object) || (phrases.length > 0 && !subject && !verb);

        return isComplete ? sentenceText + '.' : sentenceText;
    }

    return '';
}
