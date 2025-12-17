import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { VocabularyItem, SubjectItem, VerbItem, ObjectItem, QualifierItem } from '../../grammar/types';

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
        activePhraseTabId
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
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
            } as any; // Avoid type merging complexity for now or import PhraseItem but VocabularyItem has it
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
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="relative w-32 h-32 rounded-lg border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center">
                            {imageSrc ? (
                                <img src={imageSrc} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-4xl text-slate-300 font-bold">
                                    {label ? label.charAt(0).toUpperCase() : '?'}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors text-sm">
                                📷 Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {imageSrc && (
                                <button
                                    type="button"
                                    onClick={() => setImageSrc('')}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg text-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 text-center max-w-xs">
                            Upload a picture symbol to replace the default letter.
                        </p>
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
                                <select value={person} onChange={e => setPerson(e.target.value as any)} className="w-full p-2 rounded-lg border">
                                    <option value="1">1st (I/We)</option>
                                    <option value="2">2nd (You)</option>
                                    <option value="3">3rd (He/She/It/They)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Number</label>
                                <select value={number} onChange={e => setNumber(e.target.value as any)} className="w-full p-2 rounded-lg border">
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
                            <select value={articlePolicy} onChange={e => setArticlePolicy(e.target.value as any)} className="w-full p-2 rounded-lg border">
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
