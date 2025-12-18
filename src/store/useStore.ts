import { create } from 'zustand';
import type { VocabularyItem } from '../grammar/types';

type Role = 'subject' | 'verb' | 'qualifier' | 'object';

export interface Tab {
    id: string;
    label: string;
    isRemovable: boolean;
}

type TabContentMap = Record<string, VocabularyItem[]>;

import { phrases } from '../grammar/initialVocabulary';

export interface UserLibraryItem {
    id: string;
    src: string;
    name: string;
    date: number;
}

// --- Config Interfaces ---
export interface TTSConfig {
    voiceURI: string; // ID of the SpeechSynthesisVoice
    rate: number;     // 0.5 to 2.0
    pitch: number;    // 0.5 to 2.0
}

export interface ThemeConfig {
    mode: 'flat' | 'liquid' | 'high-contrast';
    backgroundColor: string;
    categoryColors: {
        subject: string;
        verb: string;
        object: string;
        qualifier: string;
        phrase: string;
    };
}

// Default Configuration
const DEFAULT_TTS: TTSConfig = {
    voiceURI: '', // Default system voice
    rate: 1.0,
    pitch: 1.0
};

const DEFAULT_THEME: ThemeConfig = {
    mode: 'liquid', // kept for structure, though UI only uses flat now
    backgroundColor: '#01056f', // Deep Blue default
    categoryColors: {
        subject: '#FACC15',  // Who (Yellow)
        verb: '#4ADE80',     // Action (Green)
        qualifier: '#60A5FA',// Describe (Blue)
        object: '#FB923C',   // What (Orange)
        phrase: '#f3e8ff'    // purple-50
    }
};

interface AppState {
    sentence: VocabularyItem[];    // State
    activeRole: Role;
    level: 1 | 2 | 3;
    isEditMode: boolean;
    isEditorOpen: boolean;
    editingItem: VocabularyItem | null;
    userOverrides: Record<string, VocabularyItem>; // Map ID -> Item

    // View Mode
    viewMode: 'vocabulary' | 'phrases';

    // Level 3 Tabs (Vocabulary)
    tabs: Tab[];
    activeTabId: string;
    tabContent: Record<string, VocabularyItem[]>; // Map TabID -> Items

    // Phrase Mode Tabs & Content
    phraseTabs: Tab[];
    activePhraseTabId: string;
    phraseContent: Record<string, VocabularyItem[]>; // Map TabID -> Items

    // Configuration
    ttsConfig: TTSConfig;
    themeConfig: ThemeConfig;

    // Profiles
    profiles: Profile[];

    // UI Configuration
    tabModalConfig: { type: 'add' | 'rename', tabId?: string, initialValue: string } | null;

    // Actions
    setRole: (role: Role) => void;
    setLevel: (level: 1 | 2 | 3) => void;
    toggleEditMode: () => void;
    setEditorOpen: (isOpen: boolean) => void;
    setEditingItem: (item: VocabularyItem | null) => void;
    setTabModalConfig: (config: { type: 'add' | 'rename', tabId?: string, initialValue: string } | null) => void;

    // Config Actions
    setTTSConfig: (config: Partial<TTSConfig>) => void;
    setThemeConfig: (config: Partial<ThemeConfig>) => void;
    resetTheme: () => void;

    addWord: (item: VocabularyItem) => void;
    clearSentence: () => void;
    removeWord: (index: number) => void;
    removeLastWord: () => void;

    // Override Actions
    setUserOverride: (item: VocabularyItem) => void;
    resetUserOverride: (originalId: string) => void;

    // View Actions
    setViewMode: (mode: 'vocabulary' | 'phrases') => void;

    // Tab Actions (Generic or Specific)
    setActiveTab: (id: string, type?: 'vocabulary' | 'phrases') => void;
    addTab: (label: string, type?: 'vocabulary' | 'phrases') => void;
    updateTab: (id: string, label: string, type?: 'vocabulary' | 'phrases') => void;
    removeTab: (id: string, type?: 'vocabulary' | 'phrases') => void;

    // Content Actions
    saveTabItem: (tabId: string, item: VocabularyItem, type?: 'vocabulary' | 'phrases') => void;
    deleteTabItem: (tabId: string, itemId: string, type?: 'vocabulary' | 'phrases') => void;

    // Profile Actions
    saveProfile: (name: string) => void;
    loadProfile: (id: string) => void;
    deleteProfile: (id: string) => void;
    resetToDefaults: () => void;
    importProfileData: (data: Profile['data'], name?: string) => void;

    // Image Library Actions
    userLibrary: UserLibraryItem[];
    addToUserLibrary: (item: UserLibraryItem) => void;
    removeFromUserLibrary: (id: string) => void;

    // Content Sharing
    getExportPackage: (tabIds: string[], name: string) => ContentPackage;
    importContentPackage: (pkg: ContentPackage) => void;
}

// Profile Interface
export interface Profile {
    id: string;
    name: string;
    timestamp: number;
    data: {
        userOverrides: Record<string, VocabularyItem>;
        tabs: Tab[];
        tabContent: TabContentMap;
        phraseTabs: Tab[];
        phraseContent: TabContentMap;
        ttsConfig: TTSConfig;
        themeConfig: ThemeConfig;
        userLibrary?: UserLibraryItem[]; // Optional for backward compatibility
    };
}

// Helpers
const saveOverrides = (overrides: Record<string, VocabularyItem>) => localStorage.setItem('tlc_vocab_overrides', JSON.stringify(overrides));
const saveTabs = (tabs: Tab[], key = 'tlc_tabs') => localStorage.setItem(key, JSON.stringify(tabs));
const saveTabContent = (content: Record<string, VocabularyItem[]>, key = 'tlc_tab_content') => localStorage.setItem(key, JSON.stringify(content));
const saveProfiles = (profiles: Profile[]) => localStorage.setItem('tlc_profiles', JSON.stringify(profiles));
const saveTTS = (config: TTSConfig) => localStorage.setItem('tlc_tts', JSON.stringify(config));
const saveTheme = (config: ThemeConfig) => localStorage.setItem('tlc_theme', JSON.stringify(config));
const saveUserLibrary = (lib: UserLibraryItem[]) => localStorage.setItem('tlc_user_library', JSON.stringify(lib));

// Loaders
const loadUserLibrary = (): UserLibraryItem[] => {
    try {
        const stored = localStorage.getItem('tlc_user_library');
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        // Migration: If array of strings, convert to objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
            const migrated: UserLibraryItem[] = parsed.map((src, idx) => ({
                id: `img_migrated_${Date.now()}_${idx}`,
                src: src as string,
                name: 'Imported Image',
                date: Date.now()
            }));
            saveUserLibrary(migrated as any); // Update storage immediately
            return migrated;
        }
        return parsed as UserLibraryItem[];
    } catch { return []; }
};

const loadProfiles = (): Profile[] => {
    try {
        const stored = localStorage.getItem('tlc_profiles');
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

const loadTTS = (): TTSConfig => {
    try {
        const stored = localStorage.getItem('tlc_tts');
        return stored ? { ...DEFAULT_TTS, ...JSON.parse(stored) } : DEFAULT_TTS;
    } catch { return DEFAULT_TTS; }
};

const loadTheme = (): ThemeConfig => {
    try {
        const stored = localStorage.getItem('tlc_theme');
        return stored ? { ...DEFAULT_THEME, ...JSON.parse(stored) } : DEFAULT_THEME;
    } catch { return DEFAULT_THEME; }
};

const loadOverrides = (): Record<string, VocabularyItem> => {
    try {
        const stored = localStorage.getItem('tlc_vocab_overrides');
        return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
};

const loadTabs = (key = 'tlc_tabs'): Tab[] => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [{ id: 'core', label: 'Main', isRemovable: false }];
    } catch { return [{ id: 'core', label: 'Main', isRemovable: false }]; }
};

const loadTabContent = (key = 'tlc_tab_content', defaultContent = {}): TabContentMap => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultContent;
    } catch { return defaultContent; }
};

export const useStore = create<AppState>((set) => {
    return {
        sentence: [],
        activeRole: 'subject',
        level: 1,
        isEditMode: false,
        isEditorOpen: false,
        editingItem: null,
        userOverrides: loadOverrides(),

        viewMode: 'vocabulary',

        // Tab State
        tabs: loadTabs('tlc_tabs'),
        activeTabId: 'core',
        tabContent: loadTabContent('tlc_tab_content'),

        // Phrase Mode
        phraseTabs: loadTabs('tlc_phrase_tabs'),
        activePhraseTabId: 'core',
        phraseContent: loadTabContent('tlc_phrase_content', { 'core': phrases }),

        // Configuration
        ttsConfig: loadTTS(),
        themeConfig: loadTheme(),

        // Profiles
        profiles: loadProfiles(),

        // User Library
        userLibrary: loadUserLibrary(),

        // UI Configuration
        tabModalConfig: null,

        // Actions
        setRole: (role) => set({ activeRole: role }),
        setLevel: (level) => set(() => {
            if (level !== 3) {
                return { level, activeTabId: 'core', activePhraseTabId: 'core' };
            }
            return { level };
        }),
        toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode, isEditorOpen: false, editingItem: null })),
        setEditorOpen: (isOpen) => set({ isEditorOpen: isOpen }),
        setEditingItem: (item) => set({ editingItem: item }),
        setTabModalConfig: (config) => set({ tabModalConfig: config }),

        // Config Actions
        setTTSConfig: (config) => set((state) => {
            const newConfig = { ...state.ttsConfig, ...config };
            saveTTS(newConfig);
            return { ttsConfig: newConfig };
        }),
        setThemeConfig: (config) => set((state) => {
            const newConfig = { ...state.themeConfig, ...config };
            saveTheme(newConfig);
            return { themeConfig: newConfig };
        }),
        resetTheme: () => set(() => {
            saveTheme(DEFAULT_THEME);
            return { themeConfig: DEFAULT_THEME };
        }),

        addWord: (item) => set((state) => ({ sentence: [...state.sentence, item] })),
        clearSentence: () => set({ sentence: [] }),
        removeWord: (index) => set((state) => ({
            sentence: state.sentence.filter((_i, i) => i !== index)
        })),

        removeLastWord: () => set((state) => ({
            sentence: state.sentence.slice(0, -1)
        })),

        setUserOverride: (item) => set((state) => {
            const newOverrides = { ...state.userOverrides, [item.id]: item };
            saveOverrides(newOverrides);
            return { userOverrides: newOverrides };
        }),

        resetUserOverride: (originalId) => set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [originalId]: _discard, ...rest } = state.userOverrides;
            saveOverrides(rest);
            return { userOverrides: rest };
        }),

        setViewMode: (mode) => set({ viewMode: mode }),

        setActiveTab: (id, type = 'vocabulary') => set(() => {
            if (type === 'vocabulary') return { activeTabId: id };
            return { activePhraseTabId: id };
        }),

        addTab: (label, type = 'vocabulary') => set((state) => {
            const newTab: Tab = {
                id: `tab_${Date.now()}`,
                label,
                isRemovable: true
            };

            if (type === 'vocabulary') {
                const newTabs = [...state.tabs, newTab];
                saveTabs(newTabs, 'tlc_tabs');
                return { tabs: newTabs, activeTabId: newTab.id };
            } else {
                const newTabs = [...state.phraseTabs, newTab];
                saveTabs(newTabs, 'tlc_phrase_tabs');
                return { phraseTabs: newTabs, activePhraseTabId: newTab.id };
            }
        }),

        updateTab: (id, label, type = 'vocabulary') => set((state) => {
            if (type === 'vocabulary') {
                const newTabs = state.tabs.map(t => t.id === id ? { ...t, label } : t);
                saveTabs(newTabs, 'tlc_tabs');
                return { tabs: newTabs };
            } else {
                const newTabs = state.phraseTabs.map(t => t.id === id ? { ...t, label } : t);
                saveTabs(newTabs, 'tlc_phrase_tabs');
                return { phraseTabs: newTabs };
            }
        }),

        removeTab: (id, type = 'vocabulary') => set((state) => {
            if (type === 'vocabulary') {
                const newTabs = state.tabs.filter(t => t.id !== id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _discard, ...newContent } = state.tabContent;
                saveTabs(newTabs, 'tlc_tabs');
                saveTabContent(newContent, 'tlc_tab_content');

                const newActive = state.activeTabId === id ? 'core' : state.activeTabId;
                return { tabs: newTabs, tabContent: newContent, activeTabId: newActive };
            } else {
                const newTabs = state.phraseTabs.filter(t => t.id !== id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _discard, ...newContent } = state.phraseContent;
                saveTabs(newTabs, 'tlc_phrase_tabs');
                saveTabContent(newContent, 'tlc_phrase_content');

                const newActive = state.activePhraseTabId === id ? 'core' : state.activePhraseTabId;
                return { phraseTabs: newTabs, phraseContent: newContent, activePhraseTabId: newActive };
            }
        }),

        saveTabItem: (tabId, item, type = 'vocabulary') => set((state) => {
            if (type === 'vocabulary') {
                const currentItems = state.tabContent[tabId] || [];
                const filtered = currentItems.filter(i => i.id !== item.id);
                const newItems = [...filtered, item];

                const newContent = { ...state.tabContent, [tabId]: newItems };
                saveTabContent(newContent, 'tlc_tab_content');
                return { tabContent: newContent };
            } else {
                const currentItems = state.phraseContent[tabId] || [];
                const filtered = currentItems.filter(i => i.id !== item.id);
                const newItems = [...filtered, item];

                const newContent = { ...state.phraseContent, [tabId]: newItems };
                saveTabContent(newContent, 'tlc_phrase_content');
                return { phraseContent: newContent };
            }
        }),

        deleteTabItem: (tabId, itemId, type = 'vocabulary') => set((state) => {
            if (type === 'vocabulary') {
                const currentItems = state.tabContent[tabId] || [];
                const newItems = currentItems.filter(i => i.id !== itemId);
                const newContent = { ...state.tabContent, [tabId]: newItems };
                saveTabContent(newContent, 'tlc_tab_content');
                return { tabContent: newContent };
            } else {
                const currentItems = state.phraseContent[tabId] || [];
                const newItems = currentItems.filter(i => i.id !== itemId);
                const newContent = { ...state.phraseContent, [tabId]: newItems };
                saveTabContent(newContent, 'tlc_phrase_content');
                return { phraseContent: newContent };
            }
        }),

        // --- Profile Actions ---

        saveProfile: (name: string) => set((state) => {
            // Create Snapshot
            const snapshot: Profile = {
                id: `prof_${Date.now()}`,
                name,
                timestamp: Date.now(),
                data: {
                    userOverrides: state.userOverrides,
                    tabs: state.tabs,
                    tabContent: state.tabContent,
                    phraseTabs: state.phraseTabs,
                    phraseContent: state.phraseContent,
                    ttsConfig: state.ttsConfig,
                    themeConfig: state.themeConfig,
                    userLibrary: state.userLibrary as any // Type assertion for compatibility if profile still expects string[]? No, we should update Profile too but for now we execute runtime saves.
                }
            };

            const newProfiles = [...loadProfiles(), snapshot]; // Reload to ensure sync? Or use state?
            // Store likely doesn't have profiles in state yet. Wait, I should add it to AppState.
            // But since I'm implementing it here, I should add 'profiles' to state below.
            saveProfiles(newProfiles);
            return { profiles: newProfiles };
        }),

        loadProfile: (id: string) => set((state) => {
            const profiles = loadProfiles();
            const profile = profiles.find(p => p.id === id);
            if (!profile) return {};

            // Restore Data
            saveOverrides(profile.data.userOverrides);
            saveTabs(profile.data.tabs, 'tlc_tabs');
            saveTabContent(profile.data.tabContent, 'tlc_tab_content');
            saveTabs(profile.data.phraseTabs, 'tlc_phrase_tabs');
            saveTabContent(profile.data.phraseContent, 'tlc_phrase_content');

            // Handle new configs safely (legacy profiles might not have them)
            const newTTS = profile.data.ttsConfig || DEFAULT_TTS;
            const newTheme = profile.data.themeConfig || DEFAULT_THEME;
            saveTTS(newTTS);
            saveTheme(newTheme);

            // Merge Library if present
            let newUserLibrary = state.userLibrary;
            const profileLib = profile.data.userLibrary;

            if (profileLib && profileLib.length > 0) {
                // Check if string[] or UserLibraryItem[]
                let normalizedLib: UserLibraryItem[] = [];
                if (typeof profileLib[0] === 'string') {
                    // Migrate
                    normalizedLib = (profileLib as unknown as string[]).map((src, idx) => ({
                        id: `img_imp_prof_${Date.now()}_${idx}`,
                        src,
                        name: 'Imported Profile Image',
                        date: Date.now()
                    }));
                } else {
                    normalizedLib = profileLib as unknown as UserLibraryItem[];
                }

                // Merge: Filter out existing srcs
                const existingSrcs = new Set(state.userLibrary.map(i => i.src));
                const uniqueNew = normalizedLib.filter(i => !existingSrcs.has(i.src));

                newUserLibrary = [...uniqueNew, ...state.userLibrary];
                saveUserLibrary(newUserLibrary as any);
            }

            return {
                userOverrides: profile.data.userOverrides,
                tabs: profile.data.tabs,
                tabContent: profile.data.tabContent,
                phraseTabs: profile.data.phraseTabs,
                phraseContent: profile.data.phraseContent,
                ttsConfig: newTTS,
                themeConfig: newTheme,
                userLibrary: newUserLibrary,
                activeTabId: 'core',
                activePhraseTabId: 'core',
                level: 1 // Reset level to start clean
            };
        }),

        deleteProfile: (id: string) => set(() => {
            const newProfiles = loadProfiles().filter(p => p.id !== id);
            saveProfiles(newProfiles);
            return { profiles: newProfiles };
        }),

        resetToDefaults: () => set(() => {
            // Clear all storage related to content
            localStorage.removeItem('tlc_vocab_overrides');
            localStorage.removeItem('tlc_tabs');
            localStorage.removeItem('tlc_tab_content');
            localStorage.removeItem('tlc_phrase_tabs');
            localStorage.removeItem('tlc_phrase_content');
            // Configs
            localStorage.removeItem('tlc_tts');
            localStorage.removeItem('tlc_theme');
            // User Data
            localStorage.removeItem('tlc_profiles');
            localStorage.removeItem('tlc_user_library');

            // Reload from code defaults
            return {
                userOverrides: {},
                tabs: [{ id: 'core', label: 'Main', isRemovable: false }],
                tabContent: {},
                phraseTabs: [{ id: 'core', label: 'Phrases', isRemovable: false }],
                phraseContent: { 'core': phrases },
                ttsConfig: DEFAULT_TTS,
                themeConfig: DEFAULT_THEME,
                activeTabId: 'core',
                activePhraseTabId: 'core',
                level: 1,
                isEditMode: false,
                // App State Resets
                sentence: [],
                activeRole: 'subject',
                profiles: [],
                userLibrary: []
            };

        }),

        importProfileData: (data: Profile['data'], name?: string) => set((state) => {
            // Sanitize: Ensure NO phrases leak into Vocabulary sections
            const cleanUserOverrides = Object.fromEntries(
                Object.entries(data.userOverrides).filter(([_, item]) => item.type !== 'phrase')
            );

            const cleanTabContent = Object.fromEntries(
                Object.entries(data.tabContent).map(([tabId, items]) => {
                    return [tabId, items.filter(item => item.type !== 'phrase')];
                })
            );

            // Restore Data from imported object
            saveOverrides(cleanUserOverrides);
            saveTabs(data.tabs, 'tlc_tabs');
            saveTabContent(cleanTabContent, 'tlc_tab_content');
            saveTabs(data.phraseTabs, 'tlc_phrase_tabs');
            // Allow phrases in phraseContent obviously
            saveTabContent(data.phraseContent, 'tlc_phrase_content');

            // Configs
            const newTTS = data.ttsConfig || DEFAULT_TTS;
            const newTheme = data.themeConfig || DEFAULT_THEME;
            saveTTS(newTTS);
            saveTheme(newTheme);

            // Merge Library
            let newUserLibrary = state.userLibrary;
            const profileLib = data.userLibrary;

            if (profileLib && profileLib.length > 0) {
                // Check if string[] or UserLibraryItem[]
                let normalizedLib: UserLibraryItem[] = [];
                if (typeof profileLib[0] === 'string') {
                    // Migrate
                    normalizedLib = (profileLib as unknown as string[]).map((src, idx) => ({
                        id: `img_imp_data_${Date.now()}_${idx}`,
                        src,
                        name: 'Imported Data Image',
                        date: Date.now()
                    }));
                } else {
                    normalizedLib = profileLib as unknown as UserLibraryItem[];
                }

                // Merge: Filter out existing srcs
                const existingSrcs = new Set(state.userLibrary.map(i => i.src));
                const uniqueNew = normalizedLib.filter(i => !existingSrcs.has(i.src));

                newUserLibrary = [...uniqueNew, ...state.userLibrary];
                saveUserLibrary(newUserLibrary as any);
            }

            // Also save as a backup profile so it's listed
            const timestamp = new Date().toLocaleString();
            const profileName = name || `Imported ${timestamp}`;

            const importedProfile: Profile = {
                id: `prof_imp_${Date.now()}`,
                name: profileName,
                timestamp: Date.now(),
                data: data
            };
            const newProfiles = [...loadProfiles(), importedProfile];
            saveProfiles(newProfiles);

            return {
                userOverrides: cleanUserOverrides,
                tabs: data.tabs,
                tabContent: cleanTabContent,
                phraseTabs: data.phraseTabs,
                phraseContent: data.phraseContent,
                ttsConfig: newTTS,
                themeConfig: newTheme,
                userLibrary: newUserLibrary,
                profiles: newProfiles, // Update profile list
                activeTabId: 'core',
                activePhraseTabId: 'core',
                level: 1,
                // Ensure editor is closed to prevent zombie state from editor
                isEditorOpen: false,
                editingItem: null,
                // Clear sentence to prevent TTS re-trigger or confusion
                sentence: []
            };
        }),

        addToUserLibrary: (item: UserLibraryItem) => set((state) => {
            // Check duplicates by SRC
            if (state.userLibrary.some(i => i.src === item.src)) return {};
            const newLib = [item, ...state.userLibrary];
            saveUserLibrary(newLib as any);
            return { userLibrary: newLib };
        }),

        removeFromUserLibrary: (id: string) => set((state) => {
            const newLib = state.userLibrary.filter(i => i.id !== id);
            saveUserLibrary(newLib as any);
            return { userLibrary: newLib };
        }),

        // --- Content Sharing (Partial Export) ---

        getExportPackage: (tabIds: string[], name: string): ContentPackage => {
            const state = useStore.getState(); // Access current state

            // 1. Extract Tabs
            const selectedTabs = state.phraseTabs.filter(t => tabIds.includes(t.id));

            // 2. Extract Content & Find Image Dependencies
            const selectedContent: Record<string, VocabularyItem[]> = {};
            const dependentImages: UserLibraryItem[] = [];
            const processedImages = new Set<string>(); // Track by src to avoid duplicates

            selectedTabs.forEach(tab => {
                const items = state.phraseContent[tab.id] || [];
                selectedContent[tab.id] = items;

                // Walk items to find user images
                items.forEach(item => {
                    if (item.icon && item.icon.startsWith('data:image')) {
                        // Check if this image exists in the library
                        // We search by exact SRC match
                        const libraryItem = state.userLibrary.find(lib => lib.src === item.icon);
                        if (libraryItem && !processedImages.has(libraryItem.src)) {
                            dependentImages.push(libraryItem);
                            processedImages.add(libraryItem.src);
                        }
                    }
                });
            });

            return {
                type: 'package',
                name,
                timestamp: Date.now(),
                tabs: selectedTabs,
                tabContent: selectedContent,
                images: dependentImages
            };
        },

        importContentPackage: (pkg: ContentPackage) => set((state) => {
            // 1. Merge Images (Deduplicate)
            let newUserLibrary = state.userLibrary;
            if (pkg.images && pkg.images.length > 0) {
                const existingSrcs = new Set(state.userLibrary.map(i => i.src));
                const uniqueNew = pkg.images.filter(i => !existingSrcs.has(i.src));
                newUserLibrary = [...uniqueNew, ...state.userLibrary];
                saveUserLibrary(newUserLibrary);
            }

            // 2. Remap Tabs to ensure ID uniqueness
            const idMap: Record<string, string> = {};
            const newTabs: Tab[] = pkg.tabs.map(tab => {
                const newId = `tab_imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                idMap[tab.id] = newId;

                // Rename if duplicate label exists?
                // Simple check: if label exists, append (Imported)
                const labelExists = state.phraseTabs.some(t => t.label === tab.label);
                return {
                    ...tab,
                    id: newId,
                    label: labelExists ? `${tab.label} (Imported)` : tab.label
                };
            });

            // 3. Remap Content
            const newContentEntries: Record<string, VocabularyItem[]> = {};
            Object.entries(pkg.tabContent).forEach(([oldTabId, items]) => {
                const newTabId = idMap[oldTabId];
                if (newTabId) {
                    newContentEntries[newTabId] = items;
                }
            });

            // 4. Save Updates
            const updatedTabs = [...state.phraseTabs, ...newTabs];
            const updatedContent = { ...state.phraseContent, ...newContentEntries };

            saveTabs(updatedTabs, 'tlc_phrase_tabs');
            saveTabContent(updatedContent, 'tlc_phrase_content');

            return {
                userLibrary: newUserLibrary,
                phraseTabs: updatedTabs,
                phraseContent: updatedContent
            };
        })
    };
});

export interface ContentPackage {
    type: 'package';
    name: string;
    timestamp: number;
    tabs: Tab[];
    tabContent: Record<string, VocabularyItem[]>;
    images: UserLibraryItem[];
}
