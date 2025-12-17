import React from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { Role } from '../../grammar/types';

export const ControlBar: React.FC = () => {
    const { activeRole, setRole } = useStore();

    const roles: { id: Role, label: string, color: string }[] = [
        { id: 'subject', label: 'Who', color: 'bg-subject' },
        { id: 'verb', label: 'Action', color: 'bg-verb' },
        { id: 'qualifier', label: 'Describe', color: 'bg-qualifier' },
        { id: 'object', label: 'What', color: 'bg-object' },
    ];

    return (
        <div className="w-full border-b border-slate-200/50 py-2 shrink-0 transition-colors">
            <div className="max-w-4xl mx-auto px-2 sm:px-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setRole(role.id)}
                            className={clsx(
                                // Base styles: flex layout
                                "relative flex items-stretch rounded-xl font-bold shadow-sm transition-all active:scale-95 overflow-hidden",
                                // Sizing: height adapts
                                "h-14 sm:h-16",
                                role.color,
                                "text-white",
                                activeRole === role.id
                                    ? "ring-4 ring-offset-2 ring-slate-300 scale-[1.02] z-10"
                                    : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                            )}
                        >
                            {/* 1/3 Icon Area */}
                            <div className="w-1/3 flex items-center justify-center bg-black/10 border-r border-black/10">
                                {/* Placeholder Circle for Icon */}
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                                    <span className="text-xs opacity-50">★</span>
                                </div>
                            </div>

                            {/* 2/3 Text Area */}
                            <div className="w-2/3 flex items-center justify-center px-1">
                                <span className={clsx(
                                    "truncate max-w-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-white",
                                    "text-sm sm:text-lg"
                                )}>
                                    {role.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
