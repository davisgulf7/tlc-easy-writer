export type Person = '1' | '2' | '3';
export type Number = 'sg' | 'pl';
export type NounType = 'countable' | 'mass' | 'proper' | 'set_plural';
export type ArticlePolicy = 'auto_indefinite' | 'definite' | 'none';
export type Role = 'subject' | 'verb' | 'qualifier' | 'object';

export interface BaseItem {
    id: string;
    label: string; // The text shown on the tile
    level: 1 | 2 | 3;
    icon?: string; // Path or emoji for now
    // Optional categorization for Level 3 folders
    category?: string;
}

export interface SubjectItem extends BaseItem {
    type: 'subject';
    person: Person;
    number: Number;
}

export interface VerbItem extends BaseItem {
    type: 'verb';
    baseForm: string; // "like"
    thirdPersonSingular: string; // "likes"
}

export interface QualifierItem extends BaseItem {
    type: 'qualifier';
    // Adjectives are generally invariant in English AAC, so just the text is usually enough.
}

export interface ObjectItem extends BaseItem {
    type: 'object';
    nounType: NounType;
    defaultNumber: Number;
    articlePolicy: ArticlePolicy;
    pluralForm?: string; // "balls" (optional if regular, but good to be explicit)
}

export interface PhraseItem extends BaseItem {
    type: 'phrase';
}

export type VocabularyItem = SubjectItem | VerbItem | QualifierItem | ObjectItem | PhraseItem;
