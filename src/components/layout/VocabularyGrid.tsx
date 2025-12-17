import React from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore'; // Ensure implementation matches store path
import { subjects, verbs, objects, qualifiers } from '../../grammar/initialVocabulary';
import type { VocabularyItem } from '../../grammar/types';

export const VocabularyGrid: React.FC = () => {
    const {
        activeRole, level, addWord, isEditMode, setEditorOpen, setEditingItem,
        userOverrides,
        viewMode,
        // Tab Data (Vocab)
        tabs, activeTabId,
        // Tab Data (Phrases)
        phraseContent, activePhraseTabId,
        // Actions
        setActiveTab, addTab, updateTab, removeTab, tabContent, clearSentence,
        // UI
        tabModalConfig, setTabModalConfig
    } = useStore();

    const getItems = () => {
        // PHRASE MODE LOGIC
        if (viewMode === 'phrases') {
            const currentTabId = activePhraseTabId;
            const currentItems = phraseContent[currentTabId] || [];

            // Determine capacity
            // L1 = 8 items. L2/L3 = 12 items.
            const capacity = level === 1 ? 8 : 12;

            // Logic: Just list them? Or slots?
            // "if I go to Level 2... I have four more squares... to add phrases to."
            // This implies standard list filling slots.
            const slots: VocabularyItem[] = [];
            for (let i = 0; i < capacity; i++) {
                if (i < currentItems.length) {
                    slots.push(currentItems[i]);
                } else {
                    // Empty Slot (Placeholder for adding)
                    slots.push({
                        id: `${currentTabId}_phrase_${i}`,
                        type: 'phrase',
                        label: '',
                        level: level,
                        icon: undefined
                    } as VocabularyItem); // Cast to compatible
                }
            }
            return slots;
        }

        // VOCABULARY MODE LOGIC
        // Standard Core Logic (Level 1/2/3 Core)
        if (activeTabId === 'core' || level !== 3) {
            // 1. Get Builtins for this role
            let builtins: VocabularyItem[] = [];
            if (activeRole === 'subject') builtins = subjects;
            if (activeRole === 'verb') builtins = verbs;
            if (activeRole === 'qualifier') builtins = qualifiers;
            if (activeRole === 'object') builtins = objects;

            // 2. Filter by Level (strict fixed list based on defaults)
            const defaults = builtins.filter(item => item.level <= level);

            // 3. Apply Overrides
            const finalItems = defaults.map(defItem => {
                // If there's an override for this ID, use it. Otherwise use default.
                return userOverrides[defItem.id] || defItem;
            });
            return finalItems;
        }

        // Custom Tab Logic (Level 3 Folders - Vocab)
        const currentTabItems = tabContent[activeTabId] || [];
        const roleItems = currentTabItems.filter(item => item.type === activeRole);

        // Map to 12 slots (Level 3 requirement)
        const slots: VocabularyItem[] = [];
        for (let i = 0; i < 12; i++) {
            if (i < roleItems.length) {
                slots.push(roleItems[i]);
            } else {
                slots.push({
                    id: `${activeTabId}_${activeRole}_${i}`,
                    type: activeRole,
                    label: '',
                    level: 3,
                    icon: undefined
                } as VocabularyItem); // Cast as compatible
            }
        }
        return slots;
    };

    const items = getItems();

    const handleItemClick = (item: VocabularyItem) => {
        if (isEditMode) {
            setEditingItem(item);
            setEditorOpen(true);
        } else {
            // Only add real words to sentence
            if (item.label) {
                // If it's a phrase, clear the bar first (One-Shot behavior)
                if (item.type === 'phrase') {
                    clearSentence();
                }
                addWord(item);
            }
        }
    };

    const confirmTabModal = (value: string) => {
        if (!value.trim() || !tabModalConfig) return;

        if (tabModalConfig.type === 'add') {
            addTab(value.trim(), viewMode); // Pass viewMode
        } else if (tabModalConfig.type === 'rename' && tabModalConfig.tabId) {
            updateTab(tabModalConfig.tabId, value.trim(), viewMode); // Pass viewMode
        }
        setTabModalConfig(null);
    };

    const handleDeleteTab = () => {
        if (tabModalConfig && tabModalConfig.tabId) {
            if (window.confirm('Are you sure you want to delete this group? Items inside will be lost.')) {
                removeTab(tabModalConfig.tabId, viewMode);
                setTabModalConfig(null);
            }
        }
    };

    // Dynamic border/bg colors - Phrases use a neutral or special color?
    // Let's use a "Phrase" color or default to Subject-like blue/grey?
    // Or keep active role color for Vocab, and specific color for Phrase.
    const getRoleColors = () => {
        const borderClass = 'border-black';
        // User requested "thin black border". 
        // The width is controlled in the button className (formerly border-4, will be border-2).

        if (viewMode === 'phrases') return { border: borderClass, bg: 'bg-white', icon: 'bg-slate-500' };

        return {
            subject: { border: borderClass, bg: 'bg-white', icon: 'bg-subject' },
            verb: { border: borderClass, bg: 'bg-white', icon: 'bg-verb' },
            qualifier: { border: borderClass, bg: 'bg-white', icon: 'bg-qualifier' },
            object: { border: borderClass, bg: 'bg-white', icon: 'bg-object' },
        }[activeRole];
    };

    const roleColors = getRoleColors();

    const getBoardBackground = () => {
        if (viewMode === 'vocabulary') {
            return `bg-${activeRole}`;
        }
        return ''; // Default/Transparent for phrases
    };

    return (
        <div className={clsx(
            "flex-1 w-full h-full p-4 flex flex-col relative overflow-hidden transition-colors duration-300",
            getBoardBackground()
        )}>
            {/* Tab/Category Modal */}
            {tabModalConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">
                                {tabModalConfig.type === 'add' ? 'New Group' : 'Rename Group'}
                            </h3>
                            {/* Delete Button (Only for existing tabs being renamed/edited) */}
                            {tabModalConfig.type === 'rename' && tabModalConfig.tabId !== 'core' && (
                                <button
                                    onClick={handleDeleteTab}
                                    className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1 bg-red-50 hover:bg-red-100 rounded"
                                >
                                    Delete
                                </button>
                            )}
                        </div>

                        <input
                            autoFocus
                            type="text"
                            defaultValue={tabModalConfig.initialValue}
                            placeholder="Group Name"
                            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-lg"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmTabModal(e.currentTarget.value);
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setTabModalConfig(null)}
                                className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                    confirmTabModal(input.value);
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md"
                            >
                                {tabModalConfig.type === 'add' ? 'Create' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Level 3 Tabs (Vocabulary Only - Phrases are in Footer) */}
            {level === 3 && viewMode === 'vocabulary' && (
                <div className="shrink-0 min-h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 mb-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            onDoubleClick={() => isEditMode && tab.isRemovable && setTabModalConfig({ type: 'rename', tabId: tab.id, initialValue: tab.label })}
                            className={clsx(
                                "px-4 py-2 rounded-t-lg border border-b-0 text-sm font-bold cursor-pointer select-none whitespace-nowrap transition-colors flex items-center gap-2",
                                activeTabId === tab.id
                                    ? "bg-white border-slate-300 text-slate-800"
                                    : "text-slate-400 hover:bg-slate-200 border-transparent hover:text-slate-600"
                            )}
                        >
                            {tab.label}
                            {isEditMode && tab.isRemovable && (
                                <span onClick={(e) => { e.stopPropagation(); setTabModalConfig({ type: 'rename', tabId: tab.id, initialValue: tab.label }); }} className="text-xs opacity-50 hover:opacity-100">✏️</span>
                            )}
                        </div>
                    ))}

                    {/* Add Tab Button */}
                    {isEditMode && (
                        <button
                            onClick={() => setTabModalConfig({ type: 'add', initialValue: '' })}
                            className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-bold"
                        >
                            + Add Folders
                        </button>
                    )}
                </div>
            )}

            <div className={clsx(
                "grid gap-4 mx-auto max-w-6xl w-full flex-1 min-h-0", // Changed: flex-1 min-h-0 instead of h-full
                // Grid dimensionality
                // View Mode Phrases: 
                // L1 (8 items) -> 4x2
                // L2/3 (12 items) -> 4x3
                // View Mode Vocab: Same logic.
                (level === 1 && (viewMode === 'vocabulary' || viewMode === 'phrases')) // Check phrases too? L1 phrase is 8 items.
                    ? "grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2" // 8 items
                    : "grid-cols-3 grid-rows-4 md:grid-cols-4 md:grid-rows-3" // 12 items
            )}>

                {items.map((item, index) => {
                    const isEmpty = !item.label;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className={clsx(
                                "rounded-2xl border-2 shadow-sm transition-all active:scale-[0.98] flex flex-col items-stretch overflow-hidden relative w-full h-full",
                                "animate-in fade-in zoom-in duration-300 fill-mode-backwards",
                                isEmpty ? "border-slate-200 bg-slate-100 opacity-60 hover:opacity-80 border-dashed" : `${roleColors.border} ${roleColors.bg} hover:shadow-md hover:brightness-95`
                            )}
                            disabled={!isEditMode && isEmpty} // Disable empty slots in play mode
                        >
                            {/* Edit Badge */}
                            {isEditMode && (
                                <div className="absolute top-2 right-2 z-10 bg-slate-800 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full opacity-70">
                                    {isEmpty ? '+' : 'Edit'}
                                </div>
                            )}

                            {isEmpty ? (
                                // Empty Slot View
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-center p-2">
                                    {isEditMode ? "Tap to Add" : "Empty"}
                                </div>
                            ) : (
                                <>
                                    {/* Top 75% - Picture Symbol Area */}
                                    <div className="h-[75%] w-full flex items-center justify-center p-2 min-h-0">
                                        {item.icon ? (
                                            <img
                                                src={item.icon}
                                                alt={item.label}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            // Fallback: Default Circle Icon
                                            <div className={clsx(
                                                "h-full aspect-square max-w-full rounded-full flex items-center justify-center text-white font-black shadow-inner",
                                                roleColors.icon,
                                                "text-[200%]"
                                            )}>
                                                {/* Use style for dynamic font scaling relative to self height if needed, or simple large text that scales with view */}
                                                <span style={{ fontSize: 'container' }}>{item.label.charAt(0).toUpperCase()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom 25% - Text Label Area */}
                                    <div className="h-[25%] w-full flex items-center justify-center border-t-2 border-inherit min-h-0 pb-1">
                                        <span className="font-bold text-slate-900 capitalize text-center text-xs sm:text-sm md:text-base lg:text-lg leading-tight px-1 break-words w-full truncate">
                                            {item.label}
                                        </span>
                                    </div>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
