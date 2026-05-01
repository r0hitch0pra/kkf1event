import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Staff({ staff }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/staff', { onSuccess: () => reset() });
    }

    return (
        <div className="flex min-h-screen flex-col bg-black px-6 py-10 text-white">
            <Head title="Manage Staff" />
            <div className="mx-auto w-full max-w-sm">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                            Super Admin
                        </p>
                        <h1 className="mt-0.5 text-2xl font-black">Staff Management</h1>
                    </div>
                    <Link
                        href="/admin"
                        className="text-sm text-zinc-500 active:text-zinc-300"
                    >
                        ← Back
                    </Link>
                </div>

                {/* Create form */}
                <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <p className="mb-4 text-sm font-semibold text-zinc-300">Add Staff Member</p>
                    <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-3">
                        <div>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => {
                                    const titled = e.target.value.replace(/\b\w/g, (c) => c.toUpperCase());
                                    setData('name', titled);
                                }}
                                placeholder="Full name"
                                autoComplete="off"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Username"
                                autoComplete="off"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-400">{errors.username}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 w-full rounded-xl bg-amber-400 py-2.5 text-sm font-bold text-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Creating…' : 'Create Staff Member'}
                        </button>
                    </form>
                </div>

                {/* Staff list */}
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                        Current Staff ({staff.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {staff.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">{member.name}</p>
                                    <p className="text-xs text-zinc-500">@{member.username}</p>
                                </div>
                                {member.is_super_admin && (
                                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                                        Super Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
