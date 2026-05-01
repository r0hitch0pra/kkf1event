import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';

function formatPhoneDisplay(digits) {
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function PhoneTab({ onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({ phone: '' });
    const [display, setDisplay] = useState('');

    function handleChange(e) {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setDisplay(formatPhoneDisplay(digits));
        setData('phone', digits.length === 10 ? `+1${digits}` : digits);
    }

    function submit(e) {
        e.preventDefault();
        post('/friends', { onSuccess: () => { reset(); setDisplay(''); onSuccess(); } });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-4 pt-2">
            <div>
                <div className={`flex items-center gap-3 rounded-2xl border bg-zinc-900 px-4 py-3.5 transition-colors ${errors.friend || errors.phone ? 'border-red-500' : 'border-zinc-800 focus-within:border-amber-400'}`}>
                    <span className="text-lg">🇺🇸</span>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={display}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        autoFocus
                        className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none"
                    />
                </div>
                {(errors.friend || errors.phone) && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.friend ?? errors.phone}</p>
                )}
            </div>
            <button
                type="submit"
                disabled={processing || data.phone.length < 12}
                className="w-full rounded-2xl bg-amber-400 py-3.5 font-bold text-black disabled:opacity-40 active:scale-95 transition-transform"
            >
                {processing ? 'Looking up…' : 'Add Friend'}
            </button>
        </form>
    );
}

function QrTab({ onSuccess }) {
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const qr = new Html5Qrcode('friend-qr-reader');

        qr.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
                if (cancelled) return;
                try { qr.stop().catch(() => {}); } catch { /* not started */ }

                const token = decodedText.includes('/')
                    ? decodedText.split('/').pop()
                    : decodedText;

                router.post('/friends', { token }, {
                    onSuccess: () => { if (!cancelled) { setDone(true); onSuccess(); } },
                    onError: (errors) => { if (!cancelled) setError(errors.friend ?? 'Could not add friend.'); },
                });
            },
        ).catch(() => { if (!cancelled) setError('Camera unavailable — check permissions.'); });

        return () => {
            cancelled = true;
            try { qr.stop().catch(() => {}); } catch { /* not started */ }
        };
    }, []);

    if (done) return <p className="py-6 text-center text-sm text-green-400">Friend added!</p>;

    return (
        <div className="pt-2">
            <div id="friend-qr-reader" className="overflow-hidden rounded-2xl" />
            {error && (
                <p className="mt-3 text-center text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

export default function AddFriendModal({ onClose }) {
    const [tab, setTab] = useState('phone');

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Add Friend</h2>
                    <button onClick={onClose} className="text-zinc-500 active:text-white">✕</button>
                </div>

                {/* Tabs */}
                <div className="mb-5 flex rounded-xl border border-zinc-800 p-1">
                    {['phone', 'scan'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                        >
                            {t === 'phone' ? '📱 Phone' : '📷 Scan QR'}
                        </button>
                    ))}
                </div>

                {tab === 'phone' && <PhoneTab onSuccess={onClose} />}
                {tab === 'scan'  && <QrTab onSuccess={onClose} />}
            </div>
        </div>
    );
}
