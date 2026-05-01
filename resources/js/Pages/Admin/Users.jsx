import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

const AMENITY_ICON = { pool: '🎱', comedy: '🎤', f1_party: '🏁' };
const AMENITY_LABEL = { pool: 'Pool', comedy: 'Comedy', f1_party: 'F1' };
const AMENITIES = ['pool', 'comedy', 'f1_party'];

const STATUS_PILL = {
    requested: 'bg-amber-400/20 text-amber-400',
    active:    'bg-green-400/20 text-green-400',
    done:      'bg-zinc-800 text-zinc-500',
};

function StatusPill({ signup }) {
    if (!signup) return null;
    const cls = STATUS_PILL[signup.status] ?? '';
    const label = signup.status === 'active' && signup.assignment ? signup.assignment : signup.status;
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            {AMENITY_ICON[signup.slug] ?? '🎟️'} {label}
        </span>
    );
}

function AmenityAction({ signup, userId, onUpdate }) {
    const [assignment, setAssignment] = useState(signup.assignment ?? '');
    const [busy, setBusy] = useState(false);

    async function action(endpoint, extra = {}) {
        setBusy(true);
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ user_id: userId, amenity_id: signup.amenity_id, ...extra }),
        });
        const data = await res.json();
        setBusy(false);
        if (res.ok) onUpdate(signup.slug, data);
    }

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{AMENITY_ICON[signup.slug] ?? '🎟️'}</span>
                <span className="font-semibold text-white">{signup.amenity_name}</span>
                {signup.status === 'done' && (
                    <span className="ml-auto rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
                        Done ✓
                    </span>
                )}
                {signup.status === 'active' && (
                    <span className="ml-auto rounded-full bg-green-400/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                        {signup.assignment ? signup.assignment : 'Active'}
                    </span>
                )}
                {signup.status === 'requested' && (
                    <span className="ml-auto rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                        Pending
                    </span>
                )}
            </div>

            {signup.status !== 'done' && (
                <div className="flex flex-col gap-2">
                    {signup.requires_assignment && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={assignment}
                                onChange={(e) => setAssignment(e.target.value)}
                                placeholder="Table / spot #"
                                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                            />
                            <button
                                onClick={() => action('/admin/assign', { assignment })}
                                disabled={busy || !assignment}
                                className="rounded-xl bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:bg-zinc-600"
                            >
                                Assign
                            </button>
                        </div>
                    )}
                    {signup.status !== 'active' && (
                        <button
                            onClick={() => action('/admin/activate')}
                            disabled={busy}
                            className="w-full rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:bg-green-700"
                        >
                            Activate
                        </button>
                    )}
                    {signup.status === 'active' && (
                        <button
                            onClick={() => action('/admin/complete')}
                            disabled={busy}
                            className="w-full rounded-xl bg-zinc-700 py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:bg-zinc-600"
                        >
                            Mark Done
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function UserCard({ user, signups, onSignupUpdate, onSignupsReset, selected, onToggle }) {
    const activeSignups = Object.values(signups);

    return (
        <div className={`rounded-2xl border transition-colors ${selected ? 'border-amber-700/50 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/40'}`}>
            {/* Card header — always visible, tap to expand */}
            <button
                onClick={onToggle}
                className="w-full px-4 py-4 text-left"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate font-bold text-white">{user.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            {user.phone} · Party of {user.party_size}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-zinc-600">{user.created_at}</span>
                        <span className={`text-zinc-500 transition-transform ${selected ? 'rotate-180' : ''}`}>
                            ▾
                        </span>
                    </div>
                </div>

                {/* Amenity status pills */}
                {activeSignups.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {activeSignups.map((s) => (
                            <StatusPill key={s.slug} signup={s} />
                        ))}
                    </div>
                )}

                {/* Checked in by */}
                <p className="mt-2 text-xs text-zinc-600">
                    Checked in by <span className="text-zinc-500">{user.checked_in_by_name}</span>
                </p>
            </button>

            {/* Expanded actions */}
            {selected && (
                <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
                    {activeSignups.length === 0 ? (
                        <p className="text-sm text-zinc-600">No activity requests yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {activeSignups.map((signup) => (
                                <AmenityAction
                                    key={signup.amenity_id}
                                    signup={signup}
                                    userId={user.id}
                                    onUpdate={onSignupUpdate}
                                />
                            ))}
                            <button
                                onClick={onSignupsReset}
                                className="mt-1 w-full rounded-xl border border-red-900/50 py-2.5 text-sm font-semibold text-red-500 active:bg-red-950/40"
                            >
                                Reset All Requests
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Users({ users: initialUsers }) {
    const [users, setUsers] = useState(initialUsers);
    const [selectedId, setSelectedId] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const channel = window.Echo.private('staff');

        channel.listen('.PatronCheckedIn', (e) => {
            setUsers((prev) => {
                const exists = prev.some((u) => u.id === e.patron.id);
                if (exists) {
                    return prev.map((u) => u.id === e.patron.id ? { ...u, ...e.patron } : u);
                }
                return [e.patron, ...prev];
            });
        });

        channel.listen('.AmenityStatusChanged', (e) => {
            setUsers((prev) =>
                prev.map((user) => {
                    if (user.id !== e.userId) return user;
                    return {
                        ...user,
                        signups: {
                            ...user.signups,
                            [e.slug]: {
                                amenity_id:          e.amenityId,
                                slug:                e.slug,
                                amenity_name:        e.amenityName,
                                requires_assignment: e.requiresAssignment,
                                ...(user.signups[e.slug] ?? {}),
                                status:     e.status,
                                assignment: e.assignment,
                            },
                        },
                    };
                }),
            );
        });

        return () => window.Echo.leave('staff');
    }, []);

    async function handleSignupsReset(userId) {
        const res = await fetch('/admin/reset-signups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ user_id: userId }),
        });
        if (res.ok) {
            setUsers((prev) =>
                prev.map((u) => u.id === userId ? { ...u, signups: {} } : u)
            );
        }
    }

    function handleSignupUpdate(userId, slug, updated) {
        setUsers((prev) =>
            prev.map((user) => {
                if (user.id !== userId) return user;
                return {
                    ...user,
                    signups: {
                        ...user.signups,
                        [slug]: { ...user.signups[slug], ...updated },
                    },
                };
            }),
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Head title="Attendees" />
            <div className="mx-auto max-w-2xl px-4 py-8">

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Attendees</h1>
                        <p className="mt-0.5 text-sm text-zinc-500">{users.length} checked in</p>
                    </div>
                    <Link href="/admin" className="text-sm text-zinc-500 active:text-zinc-300">
                        ← Home
                    </Link>
                </div>

                <div className="mb-4">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or phone…"
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                    />
                </div>

                {users.length === 0 ? (
                    <p className="text-zinc-600">No patrons checked in yet.</p>
                ) : (() => {
                    const q = query.trim().toLowerCase();
                    const filtered = q
                        ? users.filter((u) =>
                            u.name?.toLowerCase().includes(q) ||
                            u.phone?.toLowerCase().includes(q),
                        )
                        : users;
                    return filtered.length === 0 ? (
                        <p className="text-zinc-600">No results for "{query}".</p>
                    ) : (
                    <div className="flex flex-col gap-2">
                        {filtered.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                signups={user.signups}
                                onSignupUpdate={(slug, updated) => handleSignupUpdate(user.id, slug, updated)}
                                onSignupsReset={() => handleSignupsReset(user.id)}
                                selected={selectedId === user.id}
                                onToggle={() => setSelectedId((prev) => (prev === user.id ? null : user.id))}
                            />
                        ))}
                    </div>
                    );
                })()}

            </div>
        </div>
    );
}
