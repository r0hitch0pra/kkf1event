import { Head, Link, useForm } from '@inertiajs/react';

const ICON = { pool: '🎱', comedy: '🎤', f1_party: '🏁' };

function AmenityForm({ amenity }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        starts_at: amenity.starts_at ?? '',
        ends_at:   amenity.ends_at   ?? '',
    });

    function submit(e) {
        e.preventDefault();
        post(`/admin/amenities/${amenity.id}`);
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{ICON[amenity.slug] ?? '🎟️'}</span>
                <span className="font-semibold text-white">{amenity.name}</span>
                {recentlySuccessful && (
                    <span className="ml-auto text-xs font-semibold text-green-400">Saved ✓</span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Starts
                    </label>
                    <input
                        type="datetime-local"
                        value={data.starts_at}
                        onChange={(e) => setData('starts_at', e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                    {errors.starts_at && (
                        <p className="mt-1 text-xs text-red-400">{errors.starts_at}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Ends
                    </label>
                    <input
                        type="datetime-local"
                        value={data.ends_at}
                        onChange={(e) => setData('ends_at', e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                    {errors.ends_at && (
                        <p className="mt-1 text-xs text-red-400">{errors.ends_at}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-black disabled:opacity-40 active:bg-amber-400"
                >
                    Save
                </button>
            </div>
        </form>
    );
}

export default function Amenities({ amenities }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <Head title="Event Times" />
            <div className="mx-auto max-w-sm px-4 py-10">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                            Super Admin
                        </p>
                        <h1 className="mt-1 text-2xl font-black tracking-tight">Event Times</h1>
                        <p className="mt-0.5 text-sm text-zinc-500">All times are Eastern.</p>
                    </div>
                    <Link href="/admin" className="text-sm text-zinc-500 active:text-zinc-300">
                        ← Home
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    {amenities.map((amenity) => (
                        <AmenityForm key={amenity.id} amenity={amenity} />
                    ))}
                </div>

            </div>
        </div>
    );
}
