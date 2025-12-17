import { constructSentence } from './GrammarEngine';
import { subjects, verbs, objects, qualifiers } from './initialVocabulary';
import type { VocabularyItem } from './types';

// Helper to find items by partial ID or Label for easier testing
const get = (idPart: string) => {
    const all = [...subjects, ...verbs, ...objects, ...qualifiers];
    const found = all.find(i => i.id.includes(idPart));
    if (!found) throw new Error(`Item not found: ${idPart}`);
    return found;
}

console.log("--- Starting Grammar Engine Tests ---");

const scenarios: { name: string, items: VocabularyItem[] }[] = [
    {
        name: "Basic SVO: I like pizza",
        items: [get('s_i'), get('v_like'), get('o_pizza')]
    },
    {
        name: "3rd Person Agreement: My Dad [likes] pizza",
        items: [get('s_dad'), get('v_like'), get('o_pizza')]
    },
    {
        name: "Indefinite Article (Consonant): I want [a] dog",
        items: [get('s_i'), get('v_want'), get('o_dog')]
    },
    {
        name: "Indefinite Article (Vowel): I want [an] apple (simulated logic check)",
        // Note: We don't have 'apple' in initialVocab yet, let's mock one
        items: [
            get('s_i'),
            get('v_want'),
            { ...get('o_ball'), id: 'o_apple', label: 'apple', articlePolicy: 'auto_indefinite' } as any
        ]
    },
    {
        name: "Qualifier Influence on Article: I want [a] big ball",
        items: [get('s_i'), get('v_want'), get('o_ball'), get('q_big')]
    },
    {
        name: "Qualifier Vowel Influence: I want [an] orange ball",
        // Mocking 'orange' qualifier
        items: [
            get('s_i'),
            get('v_want'),
            get('o_ball'),
            { ...get('q_big'), id: 'q_orange', label: 'orange' } as any
        ]
    },
    {
        name: "Reproduction: I have [a] small dog",
        items: [get('s_i'), get('v_have'), get('q_small'), get('o_dog')]
    },
    {
        name: "Definite Article: We go to [the] playground",
        items: [get('s_we'), get('v_go'), get('o_playground')]
    },
    {
        name: "Mass Noun (No Article): I like music",
        items: [get('s_i'), get('v_like'), get('o_music')]
    }
];

scenarios.forEach(scenario => {
    const result = constructSentence(scenario.items);
    console.log(`[TEST] ${scenario.name}`);
    console.log(`       Result: "${result}"`);
});

console.log("--- Tests Complete ---");
