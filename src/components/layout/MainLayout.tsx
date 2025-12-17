import React from 'react';
import { clsx } from 'clsx';
import { SentenceBar } from './SentenceBar';
import { ControlBar } from './ControlBar';
import { VocabularyGrid } from './VocabularyGrid';
import { SettingsModal } from './SettingsModal';
import { EditorModal } from './EditorModal';
import { useStore } from '../../store/useStore';

export const MainLayout: React.FC = () => {
    const {
        level, setLevel,
        viewMode, setViewMode,
        activePhraseTabId, setActiveTab,
        phraseTabs,
        setTabModalConfig,
        isEditMode,
        clearSentence
    } = useStore();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    // Initial load effects (placeholder for now)
    React.useEffect(() => {
        // Any init logic
    }, []);

    const handlePhraseSetClick = (tabId: string) => {
        // If we are already in phrase mode and clicking a different tab, just set active.
        // If we are in vocab mode, switch to phrase mode AND set active.
        if (viewMode !== 'phrases') {
            setViewMode('phrases');
        }
        setActiveTab(tabId, 'phrases');
        clearSentence();
    };

    return (
        <div className="fixed inset-0 overflow-hidden flex flex-col font-sans">
            {/* Top Bar: Sentence Display */}
            <SentenceBar />

            {/* Middle Bar: Role Controls */}
            <ControlBar />

            {/* Middle Area: Vocabulary Grid (Flex Grow) */}
            <div className="flex-1 min-h-0 relative">
                <VocabularyGrid />
            </div>

            {/* Bottom Footer: Level & Settings */}
            <div className="border-t border-slate-200/50 px-4 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 shrink-0 gap-4 overflow-x-auto transition-colors">
                {/* Level Buttons */}
                <div className="flex gap-2 shrink-0">
                    {[1, 2, 3].map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setLevel(lvl as 1 | 2 | 3)}
                            className={clsx(
                                "w-10 h-10 rounded-full font-black text-sm flex items-center justify-center transition-all border border-white",
                                level === lvl
                                    ? "bg-slate-800 text-white shadow-md scale-110"
                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            )}
                        >
                            L{lvl}
                        </button>
                    ))}
                </div>

                {/* Navigation / Modes Area */}
                <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar mask-fade">
                    {/* Words Button (Fixed) */}
                    <button
                        onClick={() => {
                            setViewMode('vocabulary');
                            clearSentence();
                        }}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 border border-white",
                            viewMode === 'vocabulary'
                                ? "bg-slate-800 text-white shadow-md"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        )}
                    >
                        Words
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-300 shrink-0 mx-1"></div>

                    {/* Phrase Sets Buttons */}
                    {/* Render ALL Phrase Tabs as buttons here */}
                    {phraseTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handlePhraseSetClick(tab.id)}
                            onDoubleClick={() => {
                                if (isEditMode && tab.isRemovable) {
                                    setTabModalConfig({ type: 'rename', tabId: tab.id, initialValue: tab.label });
                                }
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 border border-white",
                                (viewMode === 'phrases' && activePhraseTabId === tab.id)
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                            )}
                        >
                            {tab.id === 'core' ? 'Phrases' : tab.label}
                            {isEditMode && tab.isRemovable && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTabModalConfig({ type: 'rename', tabId: tab.id, initialValue: tab.label });
                                    }}
                                    className="text-white/70 hover:text-white"
                                >
                                    ✏️
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Add Phrase Category Button */}
                    <button
                        onClick={() => {
                            // Helper to add new phrase set
                            setTabModalConfig({ type: 'add', initialValue: '' });
                            // This config is observed by VocabularyGrid which renders the modal.
                            // Ideally MainLayout should render properties if we want it global.
                            // But Grid has the modal code currently. 
                            // Verify: Yes, VocabularyGrid renders it.
                            // When we click this, does Grid know we mean "Phrases"?
                            // The 'viewMode' impacts the modal logic inside 'VocabularyGrid'?
                            // Yes: 'addTab' uses 'viewMode' from store.
                            // So we must ensure viewMode is 'phrases' before adding?
                            // Logic inside VocabularyGrid.confirmTabModal uses store.viewMode.
                            // So if user clicks [+] while in Vocab mode, it would add a Vocab tab.
                            // But the button is visually grouped with phrases.
                            // Fix: Force viewMode 'phrases' when clicking this specific [+] or pass type to modalConfig?
                            // ModalConfig doesn't support type override, it relies on store state.
                            // Let's force switch to Phrases first?
                            setViewMode('phrases');
                            setTabModalConfig({ type: 'add', initialValue: '' });
                        }}
                        className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold hover:bg-purple-200 transition-colors shrink-0 border border-white"
                        title="Add Phrase Set"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-12 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:shadow-md transition-all active:scale-95 shrink-0 border border-white"
                    aria-label="Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Modals */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentLevel={level}
                onSetLevel={setLevel}
            />

            <EditorModal />

        </div>
    );
};
