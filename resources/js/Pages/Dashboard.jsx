import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AddFriendModal from '../Components/AddFriendModal';
import EventTimeline from '../Components/EventTimeline';

const AMENITY_ICON = {
    pool:     '🎱',
    comedy:   '🎤',
    f1_party: '🏁',
};

const FRIEND_STATUS_PILL = {
    requested: 'bg-amber-400/20 text-amber-400',
    active:    'bg-green-400/20 text-green-400',
    done:      'bg-zinc-800 text-zinc-500',
};

function AmenityCard({ amenity }) {
    const unstarted  = amenity.status === null;
    const isRequested = amenity.status === 'requested';
    const isActive   = amenity.status === 'active';
    const isDone     = amenity.status === 'done';

    function request() {
        if (!unstarted) return;
        router.post(`/amenities/${amenity.id}/request`, {}, { preserveScroll: true });
    }

    let borderCls = 'border-zinc-800';
    let bgCls     = 'bg-zinc-900/60';
    if (isRequested) { borderCls = 'border-amber-700/60'; bgCls = 'bg-amber-950/40'; }
    if (isActive)    { borderCls = 'border-green-700/60'; bgCls = 'bg-green-950/40'; }
    if (isDone)      { borderCls = 'border-zinc-800';     bgCls = 'bg-zinc-900/30'; }

    return (
        <button
            onClick={request}
            disabled={!unstarted}
            className={[
                'w-full rounded-2xl border px-4 py-4 text-left transition-all',
                bgCls, borderCls,
                unstarted ? 'active:scale-[0.98]' : 'cursor-default',
                isDone ? 'opacity-40' : '',
            ].join(' ')}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{AMENITY_ICON[amenity.slug] ?? '🎟️'}</span>
                    <span className="font-semibold text-white">{amenity.name}</span>
                </div>
                {isRequested && (
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Pending</span>
                )}
                {isActive && (
                    <span className="rounded-full bg-green-400/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                        {amenity.assignment ?? 'Active'}
                    </span>
                )}
                {isDone && <span className="text-xs font-medium text-zinc-600">Done ✓</span>}
            </div>
            {unstarted   && <p className="ml-11 mt-0.5 text-xs text-zinc-600">Tap to request →</p>}
            {isRequested && <p className="ml-11 mt-0.5 text-xs text-amber-600">Find a staff member</p>}
            {isActive && amenity.assignment && <p className="ml-11 mt-0.5 text-xs text-green-600">You're all set!</p>}
        </button>
    );
}

function FriendCard({ friend, onRemove }) {
    const signups = Object.values(friend.signups ?? {});

    function remove() {
        router.delete(`/friends/${friend.id}`, {
            onSuccess: onRemove,
        });
    }

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{friend.name}</p>
                <button
                    onClick={remove}
                    className="text-zinc-700 transition-colors active:text-red-400"
                    aria-label="Remove friend"
                >
                    🗑
                </button>
            </div>
            {signups.length === 0 ? (
                <p className="mt-1 text-xs text-zinc-600">No activity yet</p>
            ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {signups.map((s) => {
                        const pill = FRIEND_STATUS_PILL[s.status] ?? '';
                        const label = s.status === 'active' && s.assignment ? s.assignment : s.status;
                        return (
                            <span key={s.slug} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill}`}>
                                {AMENITY_ICON[s.slug] ?? '🎟️'} {label}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Dashboard({ amenities: initialAmenities, friends: initialFriends, qrSvg }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { post: logout } = useForm();

    const [amenities, setAmenities] = useState(initialAmenities);
    const [friends, setFriends]     = useState(initialFriends);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { setAmenities(initialAmenities); }, [initialAmenities]);
    useEffect(() => { setFriends(initialFriends); }, [initialFriends]);

    useEffect(() => {
        const channel = window.Echo.private(`user.${user.id}`);

        channel.listen('.AmenityStatusChanged', (e) => {
            setAmenities((prev) =>
                prev.map((a) =>
                    a.id === e.amenityId
                        ? { ...a, status: e.status, assignment: e.assignment }
                        : a,
                ),
            );
        });

        channel.listen('.FriendAdded', (e) => {
            setFriends((prev) => {
                if (prev.some((f) => f.id === e.friend.id)) return prev;
                return [...prev, e.friend];
            });
        });

        channel.listen('.FriendStatusChanged', (e) => {
            setFriends((prev) =>
                prev.map((f) =>
                    f.id === e.userId
                        ? {
                            ...f,
                            signups: {
                                ...f.signups,
                                [e.slug]: { slug: e.slug, status: e.status, assignment: e.assignment },
                            },
                          }
                        : f,
                ),
            );
        });

        channel.listen('.FriendRemoved', (e) => {
            setFriends((prev) => prev.filter((f) => f.id !== e.removedUserId));
        });

        return () => { window.Echo.leave(`user.${user.id}`); };
    }, [user.id]);

    return (
        <div className="relative min-h-screen bg-black text-white">
            <Head title="My Dashboard" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-950/30 via-transparent to-transparent" />

            <div className="relative mx-auto max-w-sm px-4 py-10">

                <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                    Cars, Cues &amp; Comedy
                </p>

                {/* QR card */}
                <div className="flex flex-col items-center">
                    <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-2xl shadow-amber-900/20">
                        <div
                            dangerouslySetInnerHTML={{ __html: qrSvg }}
                            className="[&>svg]:block [&>svg]:h-full [&>svg]:w-full"
                            style={{ width: 228, height: 228 }}
                        />
                    </div>
                    <p className="mt-4 text-xl font-black tracking-tight">{user.name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">Party of {user.party_size} · Show this to staff</p>
                </div>

                {/* Tonight's schedule */}
                <EventTimeline amenities={amenities} />

                {/* Activities */}
                <div className="mt-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Activities</p>
                    <div className="flex flex-col gap-2">
                        {amenities.map((amenity) => (
                            <AmenityCard key={amenity.id} amenity={amenity} />
                        ))}
                    </div>
                </div>

                {/* Friends */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                            Friends {friends.length > 0 && `(${friends.length})`}
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 active:bg-zinc-800"
                        >
                            + Add Friend
                        </button>
                    </div>

                    {friends.length === 0 ? (
                        <p className="text-sm text-zinc-700">No friends added yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {friends.map((friend) => (
                                <FriendCard
                                    key={friend.id}
                                    friend={friend}
                                    onRemove={() => setFriends((prev) => prev.filter((f) => f.id !== friend.id))}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="pb-8 pt-12 text-center">
                    <button
                        onClick={() => logout('/logout')}
                        className="text-xs text-zinc-700 active:text-zinc-500"
                    >
                        Sign out
                    </button>
                </div>

            </div>

            {showModal && <AddFriendModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
