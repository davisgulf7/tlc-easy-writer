import React from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { Role } from '../../grammar/types';

export const ControlBar: React.FC = () => {
    const { activeRole, setRole, viewMode, coreCategories, isEditMode, setEditingItem, setEditorOpen, clearSentence } = useStore();

    const roles: Role[] = ['subject', 'verb', 'qualifier', 'object'];

    const handleCategoryClick = (role: Role) => {
        if (isEditMode) {
            // Open Editor for this Category
            const config = coreCategories[role];
            setEditingItem({
                id: `CAT_${role}`, // Special ID prefix to identify category edit
                type: role, // Keep role for color context
                label: config.label,
                icon: config.icon, // Pass current icon
                level: 1, // Fixed: Use valid level
                src: config.icon || ''
            });
            setEditorOpen(true);
        } else {
            // Normal Navigation
            if (viewMode !== 'phrases') {
                if (role === 'subject') {
                    clearSentence();
                }
                setRole(role);
            }
        }
    };

    return (
        <div className="w-full border-b border-slate-200/50 py-2 shrink-0 transition-colors">
            <div className="max-w-4xl mx-auto px-2 sm:px-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {roles.map((role) => {
                        const config = coreCategories[role];
                        return (
                            <button
                                key={role}
                                onClick={() => handleCategoryClick(role)}
                                className={clsx(
                                    // Base styles: flex layout
                                    "relative flex items-stretch rounded-xl font-bold shadow-sm transition-all overflow-hidden",
                                    // Sizing: height adapts
                                    "h-14 sm:h-16",
                                    config.color,
                                    "text-white",
                                    viewMode === 'phrases' && !isEditMode
                                        ? "opacity-40 saturate-50 cursor-default" // Disabled State
                                        : activeRole === role && !isEditMode
                                            ? "ring-4 ring-offset-2 ring-slate-300 scale-[1.02] z-10"
                                            : "opacity-90 hover:opacity-100 hover:scale-[1.01] active:scale-95 cursor-pointer" // Standard State
                                )}
                            >
                                {/* Edit Badge */}
                                {isEditMode && (
                                    <div className="absolute top-1 right-1 z-20 bg-black/50 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                        Edit
                                    </div>
                                )}

                                {/* 1/3 Icon Area */}
                                <div className="w-1/3 flex items-center justify-center bg-white border-r border-black/5 relative overflow-hidden">
                                    {config.icon ? (
                                        <img
                                            src={config.icon}
                                            alt=""
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/50"
                                        )}>
                                            <span className="text-xs">★</span>
                                        </div>
                                    )}

                                    {/* Glossy Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                                </div>

                                {/* 2/3 Text Area */}
                                <div className="w-2/3 flex items-center justify-center px-1">
                                    <span
                                        className={clsx(
                                            "truncate max-w-full text-white capitalize",
                                            "text-sm sm:text-lg"
                                        )}
                                        style={{
                                            // Softer shadow with blur on all sides
                                            textShadow: '0 0 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {config.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
