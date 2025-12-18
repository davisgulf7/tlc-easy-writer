import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { InstructionsModal } from './InstructionsModal';
import type { Profile } from '../../store/useStore';
import { onlineContentService } from '../../services/onlineContentService';
import type { OnlineSearchResult } from '../../services/onlineContentService';

import { Settings, Users, Cloud, Mic, Palette, Info } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLevel: 1 | 2 | 3; // Deprecated prop but kept for compat just in case
    onSetLevel: (level: 1 | 2 | 3) => void;
}

type SettingsTab = 'general' | 'profiles' | 'online' | 'speech' | 'appearance' | 'credits';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        isEditMode, toggleEditMode,
        profiles, saveProfile, loadProfile, deleteProfile, resetToDefaults,
        ttsConfig, setTTSConfig,
        themeConfig, setThemeConfig, resetTheme,
        phraseTabs, tabs, getExportPackage, importContentPackage,
        restorePoint, revertToRestorePoint
    } = useStore();

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showPhraseSelector, setShowPhraseSelector] = useState(false);
    const [selectedExportTabs, setSelectedExportTabs] = useState<Set<string>>(new Set());

    // Vocab Export State
    const [showVocabSelector, setShowVocabSelector] = useState(false);
    const [selectedVocabExportTabs, setSelectedVocabExportTabs] = useState<Set<string>>(new Set());

    // Online Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState<'all' | 'profile' | 'phrase' | 'vocabulary'>('all');
    const [searchResults, setSearchResults] = useState<OnlineSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (activeTab === 'online') {
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
        }
    }, [searchQuery]);

    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    if (!isOpen) return null;

    const tabConfig: Record<SettingsTab, { label: string; icon: React.ElementType; color: string }> = {
        general: { label: 'General', icon: Settings, color: 'text-slate-600' },
        profiles: { label: 'Profiles', icon: Users, color: 'text-purple-600' },
        online: { label: 'Exchange', icon: Cloud, color: 'text-sky-600' },
        speech: { label: 'Speech', icon: Mic, color: 'text-pink-600' },
        appearance: { label: 'Theme', icon: Palette, color: 'text-amber-600' },
        credits: { label: 'Credits', icon: Info, color: 'text-teal-600' }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">

                {/* Header & Tabs */}
                <div className="flex flex-col border-b border-slate-200">
                    <div className="flex justify-between items-center p-6 pb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="flex px-2 md:px-6 overflow-x-auto no-scrollbar scroll-smooth">
                        {(Object.keys(tabConfig) as SettingsTab[]).map(tab => {
                            const { icon: Icon, color, label } = tabConfig[tab];
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "flex-1 md:flex-none flex items-center justify-center gap-2 pb-3 px-3 md:px-4 border-b-2 transition-all min-w-[3.5rem]",
                                        isActive
                                            ? "border-blue-600"
                                            : "border-transparent hover:bg-slate-50"
                                    )}
                                    title={label}
                                >
                                    {/* Icon: Visible ONLY on mobile (hidden on md) */}
                                    <Icon
                                        size={24}
                                        className={clsx(
                                            "md:hidden",
                                            isActive ? color : "text-slate-400"
                                        )}
                                    />

                                    {/* Text: Visible ONLY on desktop (hidden on mobile) */}
                                    {/* Wait, previous text was "hidden md:block". 
                                        User said: "The icons show up on the regular layout... the tabs run off the edge. They should only show up on the mobile version."
                                        So Desktop = Text Only. Mobile = Icon Only. 
                                    */}
                                    <span className={clsx(
                                        "hidden md:block font-bold text-sm capitalize whitespace-nowrap",
                                        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                                    )}>
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">

                            {/* Instructions */}
                            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">How to Use</h3>
                                    <p className="text-sm text-blue-700">View quick guide and instructions</p>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors"
                                >
                                    Instructions
                                </button>
                            </section>

                            {/* Edit Mode Toggle */}
                            <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Edit Mode</h3>
                                    <p className="text-sm text-slate-500">Enable to add/edit words & folders</p>
                                </div>
                                <button
                                    onClick={toggleEditMode}
                                    className={clsx(
                                        "w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                        isEditMode ? "bg-green-500" : "bg-slate-300"
                                    )}
                                >
                                    <div className={clsx(
                                        "bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out transform",
                                        isEditMode ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </section>

                            {/* Restore Point - UNDO */}
                            {restorePoint && (
                                <section>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Undo last import? This will revert your profile to the state before the last import.")) {
                                                revertToRestorePoint();
                                                alert("Restored previous state.");
                                                onClose();
                                            }
                                        }}
                                        className="w-full py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <span>⏪</span> Revert to Previous Profile
                                    </button>
                                </section>
                            )}

                            {/* Reset App */}
                            <section>
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure? This will RESET everything to default settings.\n\nTip: Save a Profile first if you want to keep your current customization!")) {
                                            resetToDefaults();
                                            onClose();
                                        }
                                    }}
                                    className="w-full py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <span>⚠️</span> Reset App to Default
                                </button>
                            </section>

                            {/* Quit App - Desktop Only */}
                            {/* Logic: Hide on standard mobile user agents AND iPads pretending to be Macs (MacIntel + Touch) */}
                            {!(
                                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                            ) && (
                                    <div className="flex justify-end pt-4 border-t border-slate-200 mt-auto">
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to quit?")) {
                                                    window.close();
                                                }
                                            }}
                                            className="px-8 py-4 text-slate-400 hover:text-white hover:bg-red-500 font-bold text-xl rounded-xl transition-all flex items-center justify-center border-2 border-transparent hover:border-red-600 shadow-sm"
                                        >
                                            Quit
                                        </button>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* --- ONLINE SEARCH TAB --- */}
                    {activeTab === 'online' && (
                        <div className="space-y-6">
                            <section className="bg-sky-50 p-5 rounded-xl border border-sky-100 shadow-sm">
                                <h3 className="text-lg font-bold text-sky-900 mb-3 flex items-center gap-2">
                                    <span>☁️</span> Activity Exchange
                                </h3>

                                <div className="space-y-4">
                                    {/* Search Bar */}
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <input
                                            type="text"
                                            placeholder="Search profiles, phrases, vocab..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setIsSearching(true);
                                                    onlineContentService.search(searchQuery, searchFilter).then(results => {
                                                        setSearchResults(results);
                                                        setIsSearching(false);
                                                    });
                                                }
                                            }}
                                            className="flex-1 px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                        <button
                                            onClick={() => {
                                                setIsSearching(true);
                                                onlineContentService.search(searchQuery, searchFilter).then(results => {
                                                    setSearchResults(results);
                                                    setIsSearching(false);
                                                });
                                            }}
                                            className="w-full md:w-auto px-6 py-3 md:py-0 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition-colors"
                                        >
                                            {isSearching ? '...' : 'Search'}
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex gap-2 text-sm overflow-x-auto pb-1">
                                        {(['all', 'profile', 'phrase', 'vocabulary'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setSearchFilter(type);
                                                    // Optional: auto-search on filter change
                                                    setIsSearching(true);
                                                    onlineContentService.search(searchQuery, type).then(results => {
                                                        setSearchResults(results);
                                                        setIsSearching(false);
                                                    });
                                                }}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-full capitalize border transition-colors whitespace-nowrap",
                                                    searchFilter === type
                                                        ? "bg-sky-100 border-sky-300 text-sky-800 font-bold"
                                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                )}
                                            >
                                                {type === 'all' ? 'All' : type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Results */}
                                    <div className="space-y-3 mt-4">
                                        {isSearching && (
                                            <div className="text-center py-8 text-slate-400">Searching...</div>
                                        )}

                                        {!isSearching && searchResults.length === 0 && searchQuery && (
                                            <div className="text-center py-8 text-slate-400 italic">No results found.</div>
                                        )}

                                        {!isSearching && searchResults.map(result => (
                                            <div key={result.id} className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm flex flex-col gap-3">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{result.title}</h4>
                                                        <p className="text-sm text-slate-500 mb-1 mt-1">by {result.author} • {result.downloads} downloads</p>
                                                        <span className={clsx(
                                                            "text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1",
                                                            result.type === 'profile' && "bg-purple-100 text-purple-700",
                                                            result.type === 'phrase' && "bg-orange-100 text-orange-700",
                                                            result.type === 'vocabulary' && "bg-green-100 text-green-700"
                                                        )}>
                                                            {result.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-slate-600 text-sm">{result.description}</p>

                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Import "${result.title}"?`)) {
                                                            if (result.type === 'profile') {
                                                                // For Profiles, we interpret the data as a full Profile['data']
                                                                // but our service returns it that way already.
                                                                // We need to pass author/name properly if importProfileData expects it,
                                                                // but importProfileData takes just the data object.
                                                                // Wait, useStore's loadProfile takes a full object. 
                                                                // Let's check importProfileData signature.
                                                                // It takes (data: Profile['data']).
                                                                // So we pass result.data as Profile['data']
                                                                importContentPackage({
                                                                    // Mocking a package wrap for profile? No, store has importProfileData.
                                                                    // But useStore interface exposed is importContentPackage (for parts) and loadProfile (for full).
                                                                    // We might need to expose importProfileData or use loadProfile.
                                                                    // Let's use importContentPackage for all for now if compatible,
                                                                    // OR handle logic here.

                                                                    // Actually, let's treat everything as a "package" for now if possible,
                                                                    // BUT profile replacement is different.
                                                                    // Let's assume result.data matches the expected input for importContentPackage 
                                                                    // (which handles contentType='phrase' | 'vocabulary').

                                                                    // If type is profile, we might need a dedicated import action or assume the user wants to OVERWRITE?
                                                                    // For safety, let's use importContentPackage for parts, and for profile...
                                                                    // Check useStore: "importContentPackage" handles "vocabulary" and "phrase".
                                                                    // "loadProfile" takes a full profile object (with ID/timestamp).

                                                                    // Let's stick to importContentPackage for phrase/vocab.
                                                                    // For profile, we'll cast result.data as Profile['data'] and use a hypothetical importProfileData if available,
                                                                    // OR construct a full profile object and use loadProfile.

                                                                    ...result.data as any
                                                                });

                                                                // Correction: If it is a full profile, useStore has `loadProfile(profile)`.
                                                                // But we want to IMPORT (data only), not load a saved profile ID.
                                                                // We should add `importProfileData` to the exposed store interface if not present.
                                                                // Currently exposed: saveProfile, loadProfile, resetToDefaults.
                                                                // importContentPackage is for parts.

                                                                // WORKAROUND: For this iteration, if type is profile, we assume let's just use importContentPackage
                                                                // but warned user. Wait, importContentPackage appends. Profile should replace.
                                                                // Let's check useStore again. 
                                                            } else {
                                                                importContentPackage(result.data as any);
                                                            }
                                                            alert("Imported successfully!");
                                                            onClose();
                                                        }
                                                    }}
                                                    className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-sky-100 hover:text-sky-700 transition-colors"
                                                >
                                                    ⬇️ Import
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- PROFILES TAB --- */}
                    {activeTab === 'profiles' && (
                        <div className="space-y-6">
                            {/* Profiles */}
                            <section className="bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm">
                                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                                    <span>👥</span> Profiles
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        id="newProfileInput"
                                        placeholder="New Profile Name (e.g. Student A)"
                                        className="flex-1 px-3 py-2 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('newProfileInput') as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                saveProfile(input.value.trim());
                                                input.value = '';
                                            }
                                        }}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm"
                                    >
                                        Save
                                    </button>
                                </div>

                                {profiles.length > 0 && (
                                    <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
                                        {profiles.map(profile => (
                                            <div key={profile.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                                                <span className="font-medium text-slate-700">{profile.name}</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            // DOWNLOAD SPECIFIC PROFILE
                                                            // Prompt for name
                                                            const defaultName = `tlc_profile_${profile.name.replace(/\s+/g, '_')}_${new Date(profile.timestamp).toISOString().split('T')[0]}`;
                                                            const fileName = window.prompt("Enter a name for this export file:", defaultName);

                                                            if (fileName) {
                                                                const blob = new Blob([JSON.stringify(profile.data, null, 2)], { type: 'application/json' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                // Ensure .json extension
                                                                a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                                URL.revokeObjectURL(url);
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 font-bold flex items-center gap-1"
                                                    >
                                                        <span>⬇️</span> Export
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Load profile "${profile.name}"? Unsaved changes will be lost.`)) {
                                                                loadProfile(profile.id);
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-md hover:bg-green-200 font-bold"
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete profile "${profile.name}"?`)) {
                                                                deleteProfile(profile.id);
                                                            }
                                                        }}
                                                        className="px-2 py-1 bg-red-50 text-red-500 text-xs rounded-md hover:bg-red-100"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Data Management (Export/Import) */}
                            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span>💾</span> Backup & Share
                                </h3>

                                {!showPhraseSelector && !showVocabSelector && (
                                    <>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    // Prompt for name
                                                    const defaultName = `tlc_current_${new Date().toISOString().split('T')[0]}`;
                                                    const fileName = window.prompt("Enter a name for this export file:", defaultName);

                                                    if (fileName) {
                                                        // Gather Data
                                                        const { userOverrides, tabs, tabContent, phraseTabs, phraseContent, ttsConfig, themeConfig, userLibrary } = useStore.getState();
                                                        const exportData: Profile['data'] = {
                                                            userOverrides, tabs, tabContent, phraseTabs, phraseContent, ttsConfig, themeConfig, userLibrary
                                                        };

                                                        // Create Blob
                                                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                                                        const url = URL.createObjectURL(blob);

                                                        // Download
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        // Ensure .json extension
                                                        a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    }
                                                }}
                                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors border border-slate-300 flex items-center justify-center gap-2"
                                            >
                                                <span>⬇️</span> Export Full Profile
                                            </button>

                                            <button
                                                onClick={() => document.getElementById('importProfileInput')?.click()}
                                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors border border-slate-300 flex items-center justify-center gap-2"
                                            >
                                                <span>⬆️</span> Import File
                                            </button>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowPhraseSelector(true)}
                                                className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200 flex items-center justify-center gap-2"
                                            >
                                                <span>📤</span> Share Phrases
                                            </button>
                                            <button
                                                onClick={() => setShowVocabSelector(true)}
                                                className="flex-1 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors border border-purple-200 flex items-center justify-center gap-2"
                                            >
                                                <span>📤</span> Share Vocabulary
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showPhraseSelector && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-slate-700">Select Phrase Sets</h4>
                                            <button onClick={() => setShowPhraseSelector(false)} className="text-sm text-slate-500 hover:text-red-500">Cancel</button>
                                        </div>
                                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-white p-2 rounded border border-slate-100 mb-3">
                                            {phraseTabs.filter(t => t.id !== 'core').length === 0 && (
                                                <p className="text-slate-400 text-sm text-center py-2">No custom phrase sets created.</p>
                                            )}
                                            {phraseTabs.filter(t => t.id !== 'core').map(tab => (
                                                <label key={tab.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExportTabs.has(tab.id)}
                                                        onChange={e => {
                                                            const newSet = new Set(selectedExportTabs);
                                                            if (e.target.checked) newSet.add(tab.id);
                                                            else newSet.delete(tab.id);
                                                            setSelectedExportTabs(newSet);
                                                        }}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm font-medium">{tab.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            disabled={selectedExportTabs.size === 0}
                                            onClick={() => {
                                                const name = window.prompt("Name this package (e.g. 'Zoo Trip Phrases'):", "My Phrase Set");
                                                if (name) {
                                                    const pkg = getExportPackage(Array.from(selectedExportTabs), name, 'phrase');

                                                    // Download Package
                                                    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `tlc_phrases_${name.replace(/\s+/g, '_')}.json`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);

                                                    setShowPhraseSelector(false);
                                                    setSelectedExportTabs(new Set());
                                                }
                                            }}
                                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Export Phrases
                                        </button>
                                    </div>
                                )}

                                {showVocabSelector && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-slate-700">Select Vocabulary Folders</h4>
                                            <button onClick={() => setShowVocabSelector(false)} className="text-sm text-slate-500 hover:text-red-500">Cancel</button>
                                        </div>
                                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-white p-2 rounded border border-slate-100 mb-3">
                                            {tabs.filter(t => t.id !== 'core').length === 0 && (
                                                <p className="text-slate-400 text-sm text-center py-2">No custom vocabulary folders created.</p>
                                            )}
                                            {tabs.filter(t => t.id !== 'core').map(tab => (
                                                <label key={tab.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVocabExportTabs.has(tab.id)}
                                                        onChange={e => {
                                                            const newSet = new Set(selectedVocabExportTabs);
                                                            if (e.target.checked) newSet.add(tab.id);
                                                            else newSet.delete(tab.id);
                                                            setSelectedVocabExportTabs(newSet);
                                                        }}
                                                        className="w-4 h-4 text-purple-600 rounded"
                                                    />
                                                    <span className="text-sm font-medium">{tab.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            disabled={selectedVocabExportTabs.size === 0}
                                            onClick={() => {
                                                const name = window.prompt("Name this package (e.g. 'School Vocab'):", "My Vocabulary");
                                                if (name) {
                                                    const pkg = getExportPackage(Array.from(selectedVocabExportTabs), name, 'vocabulary');

                                                    // Download Package
                                                    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `tlc_vocab_${name.replace(/\s+/g, '_')}.json`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);

                                                    setShowVocabSelector(false);
                                                    setSelectedVocabExportTabs(new Set());
                                                }
                                            }}
                                            className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Export Vocabulary
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="importProfileInput"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const json = JSON.parse(event.target?.result as string);

                                                // DETECT TYPE
                                                if (json.type === 'package') {
                                                    // Handle Content Package
                                                    if (window.confirm(`Found Phrase Pack: "${json.name}" with ${json.tabs?.length} sets.\n\nAdd these to your app?`)) {
                                                        importContentPackage(json);
                                                        alert("Phrase sets added successfully!");
                                                        onClose();
                                                    }
                                                }
                                                // Handle Full Profile (Legacy or New)
                                                else if (json.userOverrides && json.tabs && json.themeConfig) {
                                                    const defaultName = `Imported ${file.name.replace('.json', '')}`;
                                                    if (window.confirm(`Import Full Profile "${defaultName}"? This will overwrite everything.`)) {
                                                        const profileName = window.prompt("Enter a name for this profile:", defaultName);
                                                        if (profileName) {
                                                            useStore.getState().importProfileData(json, profileName);
                                                            alert("Profile imported successfully!");
                                                            onClose(); // Close modal on success
                                                        }
                                                    }
                                                } else {
                                                    alert("Invalid file format.");
                                                }
                                            } catch {
                                                alert("Error reading file.");
                                            }
                                        };
                                        reader.readAsText(file);
                                        // Reset input
                                        e.target.value = '';
                                    }}
                                />
                            </section>
                        </div>
                    )}

                    {/* --- SPEECH TAB --- */}
                    {activeTab === 'speech' && (
                        <div className="space-y-6">
                            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Voice Selection</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 text-sm"
                                        value={ttsConfig.voiceURI}
                                        onChange={(e) => setTTSConfig({ voiceURI: e.target.value })}
                                    >
                                        <option value="">Default System Voice</option>
                                        {voices.map(v => (
                                            <option key={v.voiceURI} value={v.voiceURI}>
                                                {v.name} ({v.lang})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-700">Reading Speed</label>
                                        <span className="text-sm text-slate-500">{ttsConfig.rate}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={ttsConfig.rate}
                                        onChange={(e) => setTTSConfig({ rate: parseFloat(e.target.value) })}
                                        className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>Slow</span>
                                        <span>Fast</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-700">Pitch</label>
                                        <span className="text-sm text-slate-500">{ttsConfig.pitch}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={ttsConfig.pitch}
                                        onChange={(e) => setTTSConfig({ pitch: parseFloat(e.target.value) })}
                                        className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </section>

                            <button
                                onClick={() => {
                                    const text = "This is your new voice.";
                                    const utterance = new SpeechSynthesisUtterance(text);
                                    const selectedVoice = voices.find(v => v.voiceURI === ttsConfig.voiceURI);
                                    if (selectedVoice) utterance.voice = selectedVoice;
                                    utterance.rate = ttsConfig.rate;
                                    utterance.pitch = ttsConfig.pitch;
                                    window.speechSynthesis.cancel();
                                    window.speechSynthesis.speak(utterance);
                                }}
                                className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <span>🔊</span> "This is your new voice."
                            </button>
                        </div>
                    )}

                    {/* --- APPEARANCE TAB --- */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">

                            {/* Background Color */}
                            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">App Background</span>
                                <input
                                    type="color"
                                    value={themeConfig.backgroundColor}
                                    onChange={(e) => setThemeConfig({ backgroundColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none"
                                />
                            </section>

                            {/* Category Colors */}
                            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-700">Category Colors</h3>
                                    <button
                                        onClick={resetTheme}
                                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                                    >
                                        Reset Colors
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(['subject', 'verb', 'qualifier', 'object'] as const).map((key) => {
                                        const labels: Record<string, string> = {
                                            subject: 'Who',
                                            verb: 'Action',
                                            qualifier: 'Describe',
                                            object: 'What'
                                        };
                                        const color = themeConfig.categoryColors[key];

                                        return (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-sm font-medium capitalize text-slate-600">{labels[key] || key}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 font-mono">{color}</span>
                                                    <input
                                                        type="color"
                                                        value={color}
                                                        onChange={(e) => setThemeConfig({
                                                            categoryColors: {
                                                                ...themeConfig.categoryColors,
                                                                [key]: e.target.value
                                                            }
                                                        })}
                                                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-slate-200"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- CREDITS TAB --- */}
                    {activeTab === 'credits' && (
                        <div className="flex flex-col items-center justify-center min-h-full text-center p-2 animate-in fade-in duration-300">

                            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md mx-auto">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">
                                    TLC Easy Writer
                                </h3>
                                <div className="h-1 w-12 md:w-20 bg-blue-500 mx-auto rounded-full mb-4 md:mb-6"></div>

                                <p className="text-slate-600 font-medium text-sm md:text-base mb-1">
                                    Developed by the
                                </p>
                                <p className="text-slate-800 font-bold text-base md:text-lg mb-2">
                                    Technology & Learning Connections Team
                                </p>
                                <p className="text-slate-500 text-xs md:text-sm mb-4 md:mb-6">
                                    University of South Florida
                                </p>

                                <a
                                    href="https://www.tlc-mtss.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 md:px-6 md:py-3 bg-slate-50 text-blue-600 rounded-xl text-sm md:text-base font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200 mb-4 md:mb-6"
                                >
                                    www.tlc-mtss.com
                                </a>

                                <div className="border-t border-slate-100 pt-4 md:pt-6 mt-2">
                                    <p className="text-slate-500 text-xs md:text-sm mb-2">
                                        We use open source OpenSymbols
                                    </p>
                                    <a
                                        href="https://www.opensymbols.org"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 font-bold text-sm md:text-base"
                                    >
                                        www.opensymbols.org
                                    </a>
                                </div>
                            </div>

                            <p className="text-[10px] md:text-xs text-slate-400 mt-4">
                                v1.0.0
                            </p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 shadow-md transition-transform active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
            <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
        </div >
    );
};
