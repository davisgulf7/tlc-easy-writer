import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { Profile } from '../../store/useStore';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLevel: 1 | 2 | 3; // Deprecated prop but kept for compat just in case
    onSetLevel: (level: 1 | 2 | 3) => void;
}

type SettingsTab = 'general' | 'profiles' | 'speech' | 'appearance' | 'credits';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        isEditMode, toggleEditMode,
        profiles, saveProfile, loadProfile, deleteProfile, resetToDefaults,
        ttsConfig, setTTSConfig,
        themeConfig, setThemeConfig, resetTheme
    } = useStore();

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">

                {/* Header & Tabs */}
                <div className="flex flex-col border-b border-slate-200">
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="flex px-3 gap-3 md:px-6 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
                        {(['general', 'profiles', 'speech', 'appearance', 'credits'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "pb-3 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
                                    activeTab === tab
                                        ? "text-blue-600 border-blue-600"
                                        : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">

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
                                        <span>⬇️</span> Export Current
                                    </button>

                                    <button
                                        onClick={() => document.getElementById('importProfileInput')?.click()}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors border border-slate-300 flex items-center justify-center gap-2"
                                    >
                                        <span>⬆️</span> Import Profile
                                    </button>
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
                                                    // Basic validation check
                                                    if (json.userOverrides && json.tabs && json.themeConfig) {
                                                        const defaultName = `Imported ${file.name.replace('.json', '')}`;
                                                        if (window.confirm(`Import "${defaultName}"? This will overwrite your current settings.`)) {
                                                            const profileName = window.prompt("Enter a name for this profile:", defaultName);
                                                            if (profileName) {
                                                                useStore.getState().importProfileData(json, profileName);
                                                                alert("Profile imported successfully!");
                                                                onClose(); // Close modal on success
                                                            }
                                                        }
                                                    } else {
                                                        alert("Invalid profile file.");
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
                                </div>
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
        </div >
    );
};
