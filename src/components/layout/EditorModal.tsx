import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { VocabularyItem, SubjectItem, VerbItem, ObjectItem, QualifierItem } from '../../grammar/types';

// Default Icons
import { systemLibrary } from '../../grammar/initialVocabulary';
import { processImage } from '../../utils/imageUtils';

export const EditorModal: React.FC = () => {
    // Consume EVERYTHING from useStore
    const {
        isEditorOpen,
        setEditorOpen,
        editingItem,
        setEditingItem,
        setUserOverride,
        resetUserOverride,
        userOverrides,
        activeTabId,
        saveTabItem,
        deleteTabItem,
        // Added for Phrases
        viewMode,
        activePhraseTabId,
        // Library
        userLibrary,
        addToUserLibrary,
        removeFromUserLibrary
    } = useStore();

    // Local State for Form
    const [label, setLabel] = useState('');
    // Role-specific fields state
    const [person, setPerson] = useState<'1' | '2' | '3'>('3');
    const [number, setNumber] = useState<'sg' | 'pl'>('sg');
    const [verb3sg, setVerb3sg] = useState('');
    const [articlePolicy, setArticlePolicy] = useState<'auto_indefinite' | 'definite' | 'none'>('auto_indefinite');

    // Image State
    const [imageSrc, setImageSrc] = useState('');
    const [libraryTab, setLibraryTab] = useState<'system' | 'user' | 'search'>('system');
    const [searchQuery, setSearchQuery] = useState(''); // Unified search query

    const OPEN_SYMBOLS_TOKEN = "token::181-1:b2c44ca3de:1766028306:c24a747bc6821a37a25d816d:e043eb4f87aa71effb892b90b00c11e1a1714eef33c9c6b6aa7bad918b935b041c7a53d986484488652d38aa0fa452cec0b26492de37ed0c45f188860d2e4f8f";

    // Sub-component for Search Results (defined here for access to state/props if needed, or moved outside)
    const OpenSymbolsResults = ({ query, onSelect }: { query: string; onSelect: (url: string) => void }) => {
        const [results, setResults] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        // Debounce search
        useEffect(() => {
            const timeoutId = setTimeout(async () => {
                if (!query || query.length < 2) return;

                setLoading(true);
                setError('');
                try {
                    const res = await fetch(`https://www.opensymbols.org/api/v2/symbols?q=${encodeURIComponent(query)}&access_token=${OPEN_SYMBOLS_TOKEN}`);
                    if (!res.ok) throw new Error('API Error');
                    const data = await res.json();
                    setResults(data);
                } catch (err) {
                    setError('Failed to fetch symbols.');
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            }, 600); // 600ms debounce

            return () => clearTimeout(timeoutId);
        }, [query]);

        if (loading) return <div className="text-center py-8 text-blue-500">Searching...</div>;
        if (error) return <div className="text-center py-8 text-red-400">{error}</div>;
        if (results.length === 0 && query.length >= 2) return <div className="text-center py-8 text-slate-400">No results found.</div>;

        return (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pb-2">
                {results.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.image_url)}
                        className="aspect-square rounded-lg border border-slate-100 p-1 hover:bg-slate-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center overflow-hidden bg-white"
                        title={item.name}
                    >
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        );
    };

    // Populate form when editingItem changes
    // Populate form when editingItem changes
    useEffect(() => {
        if (editingItem) {
            setLabel(editingItem.label);
            setImageSrc(editingItem.icon || '');

            if (editingItem.type === 'subject') {
                setPerson(editingItem.person);
                setNumber(editingItem.number);
            } else if (editingItem.type === 'verb') {
                setVerb3sg(editingItem.thirdPersonSingular);
            } else if (editingItem.type === 'object') {
                setArticlePolicy(editingItem.articlePolicy);
            }
        }
    }, [editingItem]);

    if (!isEditorOpen || !editingItem) return null; // Use isEditorOpen from store

    const isPhrases = viewMode === 'phrases';
    const currentTabId = isPhrases ? activePhraseTabId : activeTabId;
    const isCore = currentTabId === 'core';

    // Check if modified (Core) OR if it exists (Tab - checking if label is not empty)
    const isModified = isCore ? (editingItem.id in userOverrides) : !!editingItem.label;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const result = await processImage(file);
                addToUserLibrary(result); // Add to library automatically
                setImageSrc(result);
                setLibraryTab('user'); // Switch to user tab to see it
            } catch (err) {
                console.error("Image processing failed", err);
                // @ts-ignore
                alert(err.message || "Failed to process image. Try a smaller file or different format.");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Base structure preserves ID and Level of the original item
        const baseItem = {
            id: editingItem.id, // KEEP ORIGINAL ID
            label: label.trim(),
            level: editingItem.level,
            icon: imageSrc || undefined
        };

        let newItem: VocabularyItem;

        if (editingItem.type === 'subject') {
            newItem = {
                ...baseItem,
                type: 'subject',
                person: person,
                number: number
            } as SubjectItem;
        } else if (editingItem.type === 'verb') {
            newItem = {
                ...baseItem,
                type: 'verb',
                baseForm: label.trim(),
                thirdPersonSingular: verb3sg || label.trim() + 's'
            } as VerbItem;
        } else if (editingItem.type === 'object') {
            newItem = {
                ...baseItem,
                type: 'object',
                nounType: 'countable',
                defaultNumber: 'sg',
                articlePolicy: articlePolicy,
                pluralForm: label.trim() + 's'
            } as ObjectItem;
        } else if (editingItem.type === 'phrase') {
            newItem = {
                ...baseItem,
                type: 'phrase'
            } as VocabularyItem; // proper casting
        } else {
            newItem = {
                ...baseItem,
                type: 'qualifier'
            } as QualifierItem;
        }

        if (isCore && !isPhrases) {
            // Only vocab core uses overrides? 
            // Phrases Core logic:
            // If I edit a standard phrase, it SHOULD be an override if possible.
            // But we implemented saveTabItem for Phrase Content.
            // Phrase Content 'core' is loaded into `phraseContent`.
            // So we can treat Phrase Core same as Phrase Tab -> saveTabItem.
            // We treat Vocab Core differently because it uses built-in lists + overrides.
            // Phrase Core uses `phraseContent['core']`.
            // So for Phrases, always use `saveTabItem`.
            setUserOverride(newItem);
        } else {
            // For Phrases (Core or Custom) and Vocab (Custom)
            saveTabItem(currentTabId, newItem, viewMode);
        }
        onClose();
    };

    const onClose = () => {
        setEditorOpen(false);
        setEditingItem(null);
    };

    const handleReset = () => {
        if (isCore && !isPhrases) {
            resetUserOverride(editingItem.id);
        } else {
            deleteTabItem(currentTabId, editingItem.id, viewMode);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isCore ? (isModified ? `Edit "${editingItem.label}"` : `Customize "${editingItem.label}"`) : (isModified ? `Edit "${editingItem.label}"` : 'Add New Item')}
                    </h2>

                    {/* Reset/Delete Button */}
                    {isModified && (
                        <button
                            onClick={handleReset}
                            className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            {isCore ? 'Reset Default' : 'Delete Item'}
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6 overflow-y-auto"> {/* Added p-6 and overflow-y-auto */}
                    {/* Image Library Section */}
                    <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl">
                        {/* Tabs */}
                        <div className="flex justify-between items-center border-b border-slate-200">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setLibraryTab('system')}
                                    className={clsx(
                                        "text-sm font-bold pb-2 transition-colors border-b-2 px-1",
                                        libraryTab === 'system' ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                                    )}
                                >
                                    Icons
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLibraryTab('user')}
                                    className={clsx(
                                        "text-sm font-bold pb-2 transition-colors border-b-2 px-1",
                                        libraryTab === 'user' ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                                    )}
                                >
                                    My Photos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLibraryTab('search')}
                                    className={clsx(
                                        "text-sm font-bold pb-2 transition-colors border-b-2 px-1 flex items-center gap-1",
                                        libraryTab === 'search' ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                                    )}
                                >
                                    <span>🔍</span> Web Search
                                </button>
                            </div>
                            {imageSrc && (
                                <button
                                    type="button"
                                    onClick={() => setImageSrc('')}
                                    className="text-xs text-red-500 font-bold hover:text-red-700 pb-2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder={libraryTab === 'search' ? "Search OpenSymbols..." : "Search icons..."}
                                value={searchQuery} // Need to add state
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Current Selection Preview (Small) */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                                {imageSrc ? (
                                    <img src={imageSrc} alt="Selected" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xl text-slate-300 font-bold">?</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">
                                {imageSrc ? "Icon selected" : "No icon selected"}
                            </p>
                        </div>

                        {/* Library Content */}
                        <div className="h-64 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200 scroll-smooth">

                            {/* SYSTEM TAB */}
                            {libraryTab === 'system' && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {systemLibrary
                                        .filter(src => !searchQuery || src.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((src, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setImageSrc(src)}
                                                className={clsx(
                                                    "aspect-square rounded-lg border p-1 hover:bg-slate-50 transition-all",
                                                    imageSrc === src ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-100"
                                                )}
                                            >
                                                <img src={src} alt="System Icon" className="w-full h-full object-contain" />
                                            </button>
                                        ))}
                                    {systemLibrary.filter(src => !searchQuery || src.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                        <p className="col-span-full text-center text-slate-400 text-sm py-4">No matching icons found.</p>
                                    )}
                                </div>
                            )}

                            {/* USER TAB */}
                            {libraryTab === 'user' && (
                                <div className="space-y-4">
                                    {userLibrary.length > 0 && searchQuery && (
                                        <div className="bg-yellow-50 text-yellow-700 p-2 rounded text-xs text-center border border-yellow-100">
                                            Local photos are not searchable yet. Showing all.
                                        </div>
                                    )}
                                    {/* Upload New */}
                                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                        <span className="text-2xl mb-1">📷</span>
                                        <span className="text-sm font-bold text-slate-600">Upload New Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>

                                    {/* User Library Grid */}
                                    {userLibrary.length > 0 ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                            {userLibrary.map((src, idx) => (
                                                <div key={idx} className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageSrc(src)}
                                                        className={clsx(
                                                            "w-full aspect-square rounded-lg border p-1 hover:bg-slate-50 transition-all",
                                                            imageSrc === src ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-100"
                                                        )}
                                                    >
                                                        <img src={src} alt="User Icon" className="w-full h-full object-contain" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFromUserLibrary(src);
                                                            if (imageSrc === src) setImageSrc('');
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        title="Delete from Library"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-400 text-sm py-2">No photos uploaded yet.</p>
                                    )}
                                </div>
                            )}

                            {/* SEARCH TAB (OpenSymbols) */}
                            {libraryTab === 'search' && (
                                <div className="min-h-full">
                                    {!searchQuery ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-8">
                                            <span className="text-4xl mb-2">🔍</span>
                                            <p className="text-sm">Type above to search OpenSymbols</p>
                                        </div>
                                    ) : (
                                        <OpenSymbolsResults query={searchQuery} onSelect={async (url) => {
                                            try {
                                                // Fetch the image as a blob using a CORS proxy to bypass S3 restrictions
                                                // We use corsproxy.io (public) or we could set up our own.
                                                // For a client-side only app, this is a common workaround.
                                                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

                                                const response = await fetch(proxyUrl);
                                                if (!response.ok) throw new Error("Network response was not ok");

                                                const blob = await response.blob();
                                                const file = new File([blob], "symbol.png", { type: blob.type });

                                                // Process it (resize, compress)
                                                const result = await processImage(file);

                                                // Add to library and select
                                                addToUserLibrary(result);
                                                setImageSrc(result);
                                                setLibraryTab('user'); // Switch to user tab to show it's saved
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to download symbol. It might be protected.");
                                            }
                                        }} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Label Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Word Label</label>
                        <input
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-lg font-bold"
                            required
                        />
                    </div>

                    {/* Dynamic Fields */}
                    {editingItem.type === 'subject' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Person</label>
                                <select value={person} onChange={e => setPerson(e.target.value as '1' | '2' | '3')} className="w-full p-2 rounded-lg border">
                                    <option value="1">1st (I/We)</option>
                                    <option value="2">2nd (You)</option>
                                    <option value="3">3rd (He/She/It/They)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Number</label>
                                <select value={number} onChange={e => setNumber(e.target.value as 'sg' | 'pl')} className="w-full p-2 rounded-lg border">
                                    <option value="sg">Singular</option>
                                    <option value="pl">Plural</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {editingItem.type === 'verb' && (
                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">3rd Person Singular Form</label>
                                <input
                                    type="text"
                                    value={verb3sg}
                                    onChange={e => setVerb3sg(e.target.value)}
                                    className="w-full p-2 rounded-lg border"
                                    placeholder={label ? `${label}s` : 'e.g., runs'}
                                />
                            </div>
                        </div>
                    )}

                    {editingItem.type === 'object' && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Article Policy</label>
                            <select value={articlePolicy} onChange={e => setArticlePolicy(e.target.value as 'auto_indefinite' | 'definite' | 'none')} className="w-full p-2 rounded-lg border">
                                <option value="auto_indefinite">Auto (a/an)</option>
                                <option value="definite">Definite (the)</option>
                                <option value="none">None (Mass noun)</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-between pt-4 gap-4">
                        {isModified ? (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200"
                            >
                                Reset Default
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
