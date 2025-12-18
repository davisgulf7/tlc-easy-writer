
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        // Clear local storage carefully - maybe just critical keys if we knew them, 
        // but for a general panic button, clearing all might be safest to recover.
        // However, users hate losing data. Let's try to just reload first.
        // If they click 'Factory Reset', then we clear.
        if (confirm("This will delete all your saved phrases and settings. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    private handleReload = () => {
        window.location.reload();
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-slate-200">
                        <h1 className="text-2xl font-black text-rose-600 mb-4">Something went wrong</h1>
                        <p className="text-slate-600 mb-6">
                            The application encountered an unexpected error.
                        </p>

                        {this.state.error && (
                            <div className="bg-slate-100 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-slate-700 border border-slate-200">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2 bg-rose-100 text-rose-700 rounded-full font-bold hover:bg-rose-200 transition-colors"
                            >
                                Factory Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
