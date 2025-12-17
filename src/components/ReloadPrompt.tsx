import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
    // interval: 0 means we handle checking manually or rely on browser events.
    // In 'prompt' mode, needRefresh will become true when a new SW is waiting.
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {needRefresh && (
                <div className="fixed bottom-4 right-4 z-[9999] p-4 bg-slate-800 text-white rounded-lg shadow-2xl border border-slate-700 max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="mb-3">
                        <h3 className="font-bold text-lg">New Update Available!</h3>
                        <p className="text-sm text-slate-300 mt-1">
                            A new version of the app is ready. Reload to update.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors flex-1"
                            onClick={() => updateServiceWorker(true)}
                        >
                            Reload
                        </button>
                        <button
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-md font-bold text-sm transition-colors"
                            onClick={close}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
