import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';

const STATUS_BADGE = {
    requested: { label: 'Requested', cls: 'bg-yellow-900 text-yellow-300' },
    active:    { label: 'Active',     cls: 'bg-green-900 text-green-300' },
    done:      { label: 'Done',       cls: 'bg-gray-800 text-gray-400' },
};

function StatusBadge({ status }) {
    if (!status) return <span className="text-xs text-gray-600">—</span>;
    const { label, cls } = STATUS_BADGE[status];
    return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function AmenityRow({ signup, userId, onUpdate }) {
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
        if (res.ok) onUpdate(data);
    }

    const done = signup.status === 'done';

    return (
        <div className={`rounded-xl border border-gray-800 p-4 ${done ? 'opacity-40' : ''}`}>
            <div className="flex items-center justify-between">
                <span className="font-medium text-white">{signup.amenity_name}</span>
                <StatusBadge status={signup.status} />
            </div>

            {signup.assignment && (
                <p className="mt-1 text-sm text-gray-400">Assigned: {signup.assignment}</p>
            )}

            {!done && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {signup.requires_assignment && (
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={assignment}
                                onChange={(e) => setAssignment(e.target.value)}
                                placeholder="Table #"
                                className="w-24 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none"
                            />
                            <button
                                onClick={() => action('/admin/assign', { assignment })}
                                disabled={busy || !assignment}
                                className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                            >
                                Assign
                            </button>
                        </div>
                    )}
                    {signup.status !== 'active' && (
                        <button
                            onClick={() => action('/admin/activate')}
                            disabled={busy}
                            className="rounded-lg bg-green-800 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                        >
                            Activate
                        </button>
                    )}
                    {signup.status === 'active' && (
                        <button
                            onClick={() => action('/admin/complete')}
                            disabled={busy}
                            className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                        >
                            Mark Done
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function UserCard({ result, onReset }) {
    const [signups, setSignups] = useState(result.signups);
    const [resetting, setResetting] = useState(false);

    async function handleResetSignups() {
        setResetting(true);
        const res = await fetch('/admin/reset-signups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ user_id: result.user.id }),
        });
        setResetting(false);
        if (res.ok) setSignups([]);
    }

    function handleUpdate(updated) {
        setSignups((prev) =>
            prev.map((s) => (s.amenity_id === updated.amenity_id ? { ...s, ...updated } : s))
        );
    }

    useEffect(() => {
        const channel = window.Echo.private('staff');
        channel.listen('.AmenityStatusChanged', (e) => {
            if (e.userId !== result.user.id) return;
            setSignups((prev) => {
                const exists = prev.some((s) => s.amenity_id === e.amenityId);
                if (exists) {
                    return prev.map((s) =>
                        s.amenity_id === e.amenityId
                            ? { ...s, status: e.status, assignment: e.assignment }
                            : s
                    );
                }
                return [...prev, {
                    amenity_id:          e.amenityId,
                    amenity_name:        e.amenityName,
                    amenity_slug:        e.slug,
                    requires_assignment: e.requiresAssignment,
                    status:              e.status,
                    assignment:          e.assignment,
                }];
            });
        });
        return () => window.Echo.leave('staff');
    }, [result.user.id]);

    return (
        <div className="mt-6">
            <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
                <p className="text-xl font-bold text-white">{result.user.name}</p>
                <p className="mt-0.5 text-sm text-gray-400">
                    {result.user.phone} · Party of {result.user.party_size}
                </p>

                <div className="mt-4 flex flex-col gap-3">
                    {signups.length === 0 && (
                        <p className="text-sm text-gray-600">No activity requests yet.</p>
                    )}
                    {signups.map((signup) => (
                        <AmenityRow
                            key={signup.amenity_id}
                            signup={signup}
                            userId={result.user.id}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={handleResetSignups}
                disabled={resetting || signups.length === 0}
                className="mt-4 w-full rounded-lg border border-red-900/50 py-3 text-sm font-semibold text-red-500 disabled:opacity-30 active:bg-red-950/40"
            >
                Reset All Requests
            </button>

            <button
                onClick={onReset}
                className="mt-2 w-full rounded-lg border border-gray-700 py-3 text-sm text-gray-300"
            >
                Scan another
            </button>
        </div>
    );
}

export default function Scan() {
    const scannerRef = useRef(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        if (!scanning) return;

        let cancelled = false;
        const qr = new Html5Qrcode('qr-reader');
        scannerRef.current = qr;

        qr.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
                if (cancelled) return;
                try { await qr.stop(); } catch { /* already stopped */ }

                const token = decodedText.includes('/')
                    ? decodedText.split('/').pop()
                    : decodedText;

                const res = await fetch('/admin/lookup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                    },
                    body: JSON.stringify({ token }),
                });

                if (cancelled) return;
                const data = await res.json();
                if (cancelled) return;

                // Set scanning false only after fetch completes so the effect
                // cleanup doesn't set cancelled=true mid-flight.
                setScanning(false);
                if (res.ok) {
                    setResult(data);
                } else {
                    setError(data.error ?? 'Unknown error');
                }
            },
        ).catch(() => { if (!cancelled) setError('Camera unavailable — check permissions.'); });

        return () => {
            cancelled = true;
            try { qr.stop().catch(() => {}); } catch { /* not yet started */ }
        };
    }, [scanning]);

    function reset() {
        setResult(null);
        setError(null);
        setScanning(true);
    }

    return (
        <div className="min-h-screen bg-black px-4 py-8 text-white">
            <Head title="Scanner" />
            <div className="mx-auto max-w-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Scan Patron QR</h1>
                    <Link href="/admin" className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300">
                        Back
                    </Link>
                </div>

                {scanning && (
                    <div
                        id="qr-reader"
                        className="overflow-hidden rounded-2xl"
                        style={{ width: '100%' }}
                    />
                )}

                {error && (
                    <div className="mt-4 rounded-xl bg-red-950 px-4 py-3 text-red-300">
                        {error}
                        <button onClick={reset} className="ml-3 underline">
                            Try again
                        </button>
                    </div>
                )}

                {result && <UserCard result={result} onReset={reset} />}
            </div>
        </div>
    );
}
