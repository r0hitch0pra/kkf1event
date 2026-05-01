import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

function formatPhoneDisplay(digits) {
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Signup({ staffCheckin = false }) {
    const action = staffCheckin ? '/admin/checkin' : '/signup';

    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        name: '',
        party_size: 1,
    });

    const [displayPhone, setDisplayPhone] = useState('');
    const [checkState, setCheckState] = useState('idle'); // idle | checking | exists | new

    function handlePhoneChange(e) {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setDisplayPhone(formatPhoneDisplay(digits));
        const e164 = digits.length === 10 ? `+1${digits}` : digits;
        setData('phone', e164);

        if (digits.length === 10) {
            checkPhone(e164);
        } else {
            setCheckState('idle');
        }
    }

    async function checkPhone(phone) {
        setCheckState('checking');
        try {
            const res = await fetch('/phone-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ phone }),
            });
            const json = await res.json();
            setCheckState(json.exists ? 'exists' : 'new');
        } catch {
            setCheckState('new');
        }
    }

    function adjustParty(delta) {
        setData('party_size', Math.min(20, Math.max(1, (data.party_size || 1) + delta)));
    }

    function submit(e) {
        e.preventDefault();
        post(action);
    }

    const isExists = checkState === 'exists';
    const isNew = checkState === 'new';
    const isReady = isExists || isNew;

    return (
        <div className="relative flex min-h-screen flex-col bg-black text-white">
            <Head title={staffCheckin ? 'Staff Check-In' : 'Sign Up'} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-950/30 via-transparent to-transparent" />

            <div className="relative flex flex-1 flex-col px-6 py-12">

                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                            {staffCheckin ? 'Staff · Check In' : 'Komic Karma'}
                        </p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight">
                            {isExists
                                ? (staffCheckin ? 'Found them!' : 'Welcome back!')
                                : (staffCheckin ? 'New Patron' : 'Join the party')}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {isExists
                                ? "Account found. Tap below to check in."
                                : isNew
                                    ? 'Just a couple more details.'
                                    : 'Enter their phone number.'}
                        </p>
                    </div>
                    {staffCheckin && (
                        <Link href="/admin" className="text-sm text-zinc-500 active:text-zinc-300">
                            ← Back
                        </Link>
                    )}
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col gap-5">

                    {/* Phone */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Phone number
                        </label>
                        <div className={`flex items-center gap-3 rounded-2xl border bg-zinc-900 px-4 py-3.5 transition-colors ${errors.phone ? 'border-red-500' : 'border-zinc-800 focus-within:border-amber-400'}`}>
                            <span className="text-lg">🇺🇸</span>
                            <input
                                type="tel"
                                inputMode="numeric"
                                value={displayPhone}
                                onChange={handlePhoneChange}
                                placeholder="(555) 000-0000"
                                className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none"
                            />
                            {checkState === 'checking' && (
                                <span className="text-xs text-zinc-500">checking…</span>
                            )}
                            {isExists && (
                                <span className="text-xs font-semibold text-green-400">✓ Found</span>
                            )}
                        </div>
                        {errors.phone && (
                            <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>
                        )}
                    </div>

                    {/* New patron: name + party size */}
                    {isNew && (
                        <>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    {staffCheckin ? 'Patron name' : 'Your name'}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value.replace(/\b\w/g, (c) => c.toUpperCase()))}
                                    placeholder="First name or nickname"
                                    autoFocus
                                    className={`w-full rounded-2xl border bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 transition-colors focus:outline-none ${errors.name ? 'border-red-500' : 'border-zinc-800 focus:border-amber-400'}`}
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Party size
                                </label>
                                <div className={`flex items-center justify-between rounded-2xl border bg-zinc-900 px-4 py-3 ${errors.party_size ? 'border-red-500' : 'border-zinc-800'}`}>
                                    <button
                                        type="button"
                                        onClick={() => adjustParty(-1)}
                                        disabled={data.party_size <= 1}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-xl font-bold text-white disabled:opacity-30 active:bg-zinc-700"
                                    >
                                        −
                                    </button>
                                    <div className="text-center">
                                        <span className="text-2xl font-bold">{data.party_size}</span>
                                        <span className="ml-1.5 text-sm text-zinc-500">
                                            {data.party_size === 1 ? 'person' : 'people'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => adjustParty(1)}
                                        disabled={data.party_size >= 20}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-xl font-bold text-white disabled:opacity-30 active:bg-zinc-700"
                                    >
                                        +
                                    </button>
                                </div>
                                {errors.party_size && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.party_size}</p>
                                )}
                            </div>
                        </>
                    )}

                    {isReady && (
                        <div className="mt-auto pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-2xl bg-amber-400 py-4 text-base font-bold text-black shadow-lg shadow-amber-900/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Checking in…'
                                    : staffCheckin ? 'Check In Patron →' : "Let's go →"}
                            </button>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}
