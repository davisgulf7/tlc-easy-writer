import type { Profile, ContentPackage } from '../store/useStore';

// Mock Data Types
export type OnlineContentType = 'profile' | 'phrase' | 'vocabulary';

export interface OnlineSearchResult {
    id: string;
    title: string;
    description: string;
    author: string;
    type: OnlineContentType;
    downloads: number;
    previewImage?: string;
    data: Profile['data'] | ContentPackage; // The actual content to import
}

// Mock Database
const MOCK_DATABASE: OnlineSearchResult[] = [
    {
        id: 'pkg_school_basics',
        title: 'School Basics Pack',
        description: 'Essential vocabulary for the classroom. Includes "Teacher", "Recess", "Homework" and common phrases.',
        author: 'Educator_Jane',
        type: 'vocabulary',
        downloads: 1250,
        data: {
            type: 'package',
            contentType: 'vocabulary',
            name: 'School Basics',
            version: '1.0.0',
            timestamp: Date.now(),
            tabs: [
                { id: 't_school_1', label: 'School Activity', isRemovable: true },
                { id: 't_school_supplies', label: 'Supplies', isRemovable: true }
            ],
            tabContent: {
                't_school_1': [
                    {
                        id: 'v_homework', label: 'Homework', type: 'object', level: 3, icon: 'symbols/book.png',
                        nounType: 'mass', defaultNumber: 'sg', articlePolicy: 'none'
                    },
                    {
                        id: 'v_recess', label: 'Recess', type: 'verb', level: 3, icon: 'symbols/play.png',
                        baseForm: 'recess', thirdPersonSingular: 'recesses'
                    }
                ],
                't_school_supplies': [
                    {
                        id: 'v_pencil', label: 'Pencil', type: 'object', level: 3, icon: 'symbols/small.png',
                        nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'pencils'
                    }
                ]
            },
            images: []
        } as ContentPackage
    },
    {
        id: 'pkg_restaurant_phrases',
        title: 'Restaurant Helper',
        description: 'Quick phrases for ordering food and asking for billing.',
        author: 'TLC_Team',
        type: 'phrase',
        downloads: 890,
        data: {
            type: 'package',
            contentType: 'phrase',
            name: 'Restaurant Helper',
            version: '1.0.0',
            timestamp: Date.now(),
            tabs: [
                { id: 'pt_ordering', label: 'Ordering', isRemovable: true }
            ],
            tabContent: {
                'pt_ordering': [
                    { id: 'p_menu', label: 'Can I see the menu?', type: 'phrase', level: 1, icon: 'symbols/book.png' },
                    { id: 'p_water', label: 'Water please', type: 'phrase', level: 1, icon: 'symbols/i_am_thirsty.png' },
                    { id: 'p_check', label: 'Check please', type: 'phrase', level: 1, icon: 'symbols/yes.png' }
                ]
            },
            images: []
        } as ContentPackage
    },
    {
        id: 'prof_advanced_adult',
        title: 'Adult - Advanced Layout',
        description: 'A complete profile setup for adult users with complex sentence structures and minimal icons.',
        author: 'ProUser',
        type: 'profile',
        downloads: 340,
        data: {
            userOverrides: {},
            tabs: [],
            tabContent: {},
            phraseTabs: [],
            phraseContent: {},
            ttsConfig: { voiceURI: '', rate: 1.1, pitch: 0.9 },
            themeConfig: { mode: 'modern', backgroundColor: '#e2e8f0', categoryColors: { subject: '#3b82f6', verb: '#10b981', object: '#f59e0b', qualifier: '#8b5cf6', phrase: '#64748b' } }
        } as any
    }
];

export const onlineContentService = {
    search: async (query: string, filterType: 'all' | OnlineContentType = 'all'): Promise<OnlineSearchResult[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const lowerQuery = query.toLowerCase();

        return MOCK_DATABASE.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(lowerQuery) ||
                item.description.toLowerCase().includes(lowerQuery);
            const matchesType = filterType === 'all' || item.type === filterType;

            return matchesSearch && matchesType;
        });
    }
};
