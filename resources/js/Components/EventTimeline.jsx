import { useState, useEffect } from 'react';

const AMENITY_ICON = {
    pool:     '🎱',
    comedy:   '🎤',
    f1_party: '🏁',
};

function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
    });
}

const SOON_MS = 15 * 60 * 1000; // 15 minutes

function getPhase(startsAt, endsAt, now) {
    if (!startsAt) return 'upcoming';
    const start = new Date(startsAt).getTime();
    const end   = endsAt ? new Date(endsAt).getTime() : Infinity;
    if (now >= end)                   return 'past';
    if (now >= start)                 return 'active';
    if (start - now <= SOON_MS)       return 'soon';
    return 'upcoming';
}

function minutesUntil(startsAt, now) {
    return Math.ceil((new Date(startsAt).getTime() - now) / 60_000);
}

export default function EventTimeline({ amenities }) {
    const [now, setNow] = useState(Date.now());

    // Tick every 30s so "starting soon" countdown stays fresh
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(t);
    }, []);

    const sorted = [...amenities].sort(
        (a, b) => new Date(a.starts_at ?? 0) - new Date(b.starts_at ?? 0),
    );

    return (
        <div className="mt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Tonight's Schedule
            </p>

            <div className="relative pl-6">
                {/* Vertical spine */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />

                {sorted.map((amenity, i) => {
                    const phase      = getPhase(amenity.starts_at, amenity.ends_at, now);
                    const isActive   = phase === 'active';
                    const isSoon     = phase === 'soon';
                    const isPast     = phase === 'past';
                    const isLast     = i === sorted.length - 1;
                    const minsLeft   = isSoon ? minutesUntil(amenity.starts_at, now) : null;

                    return (
                        <div key={amenity.id} className={`relative flex gap-4 ${isLast ? '' : 'pb-6'}`}>
                            {/* Node */}
                            <div className="absolute -left-6 flex items-center justify-center" style={{ top: 2 }}>
                                {isActive ? (
                                    <span className="relative flex h-3.5 w-3.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400" />
                                    </span>
                                ) : isSoon ? (
                                    <span className="h-3.5 w-3.5 animate-pulse rounded-full border-2 border-amber-400 bg-black" />
                                ) : isPast ? (
                                    <span className="h-3.5 w-3.5 rounded-full bg-zinc-700" />
                                ) : (
                                    <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-700 bg-black" />
                                )}
                            </div>

                            {/* Content */}
                            <div className={isPast ? 'opacity-35' : ''}>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none">
                                        {AMENITY_ICON[amenity.slug] ?? '🎟️'}
                                    </span>
                                    <span className={`font-semibold ${isActive ? 'text-amber-400' : isSoon ? 'text-amber-300' : 'text-white'}`}>
                                        {amenity.name}
                                    </span>
                                    {isActive && (
                                        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                                            Now
                                        </span>
                                    )}
                                </div>
                                <p className={`mt-0.5 text-xs ${isActive ? 'text-amber-600' : isSoon ? 'text-amber-800' : 'text-zinc-600'}`}>
                                    {amenity.starts_at ? (
                                        <>
                                            {formatTime(amenity.starts_at)}
                                            {amenity.ends_at && ` – ${formatTime(amenity.ends_at)}`}
                                        </>
                                    ) : 'All night'}
                                </p>
                                {isSoon && (
                                    <p className="mt-0.5 animate-pulse text-xs font-semibold text-amber-500">
                                        Starting in {minsLeft} min
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
