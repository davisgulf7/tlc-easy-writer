import React from 'react';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800">How to Use</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600">

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">🗣️ building Sentences</h3>
                        <p>Tap icon cards to add them to the sentence bar. Tap the bar to speak the whole sentence.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">📁 Categories & Levels</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Categories:</strong> Switch between 'Who', 'Action', 'Describe', and 'What' to find different types of words.</li>
                            <li><strong>Levels (L1-L3):</strong> Use the bottom-left buttons to change difficulty. L1 is basic, L3 includes folders and more words.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">✏️ Editing Buttons</h3>
                        <p>Tap the <strong>Pencil Icon</strong> (top right) to enter Edit Mode. + buttons appear to add new words. Tap existing words to edit or delete them.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">💾 Saving Profiles</h3>
                        <p>Go to <strong>Settings {'>'} Profiles</strong> to save your custom vocabulary and layout. You can have multiple profiles for different users.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">🔄 Sharing & Backup</h3>
                        <p>Use <strong>Settings {'>'} General</strong> to export your setups or specific vocabulary folders to share with others or backup your data.</p>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
