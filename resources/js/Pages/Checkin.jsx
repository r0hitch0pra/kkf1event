import {useState, useEffect} from 'react';
import {Head, Link} from '@inertiajs/react';

const ACTIVITIES = [
    {icon: '🏎️', label: 'Exotic Cars'},
    {icon: '🎱', label: 'Pool Tables'},
    {icon: '🎤', label: 'Comedy Show'},
    {icon: '🏁', label: 'F1 Watch Party'},
];

export default function Checkin() {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setRevealed(true), 120);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
            <Head title="Check In" />
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
            `}</style>
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-950/40 via-transparent to-transparent"/>

            <div className="relative flex flex-1 flex-col px-6 py-16">

                {/* Logo — starts centered on screen, slides up to top */}
                <div
                    style={{
                        transform: revealed ? 'translateY(0)' : 'translateY(38vh)',
                        transition: 'transform 2s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    <img
                        src="/logo.svg"
                        alt="Komic Karma"
                        className="mx-auto w-full max-w-xs"
                        style={{
                            filter: 'brightness(0) invert(1)',
                            animation: revealed ? 'breathe 3s ease-in-out 2s infinite' : 'none',
                        }}
                    />
                    <p
                        className="mt-2 text-xs font-semibold uppercase text-center tracking-[0.25em] text-amber-400"
                        style={{
                            opacity: revealed ? 1 : 0,
                            transition: 'opacity 0.5s ease 1.6s',
                        }}
                    >
                        Cars, Cues &amp; Comedy
                    </p>
                    <p className="mb-8 mt-0 text-sm text-zinc-500 text-center"
                       style={{
                           opacity: revealed ? 1 : 0,
                           transition: 'opacity 0.5s ease 1.6s',
                       }}>
                        Scan in at the door · Get your wristband
                    </p>
                </div>

                {/* Rest of content — fades in after logo settles */}
                <div
                    style={{
                        opacity: revealed ? 1 : 0,
                        transform: revealed ? 'translateY(0)' : 'translateY(24px)',
                        transition: 'opacity 0.5s ease 1.8s, transform 0.5s ease 1.8s',
                    }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {ACTIVITIES.map(({icon, label}) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                            >
                                <span className="text-2xl">{icon}</span>
                                <span className="text-sm font-medium text-zinc-300">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10">
                        <Link
                            href="/signup"
                            className="block w-full rounded-2xl bg-amber-400 py-4 text-center text-base font-bold text-black shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
                        >
                            Check In Now →
                        </Link>
                        <p className="mt-3 text-center text-xs text-zinc-600">Takes less than 30 seconds</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
