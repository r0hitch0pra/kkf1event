import { Head, Link, useForm, usePage } from '@inertiajs/react';

const NAV_CARDS = [
    {
        href: '/admin/scan',
        icon: '📷',
        label: 'Scanner',
        sub: 'Scan patron QR codes',
        style: 'border-zinc-700 bg-zinc-900/60',
        labelStyle: 'text-white',
    },
    {
        href: '/admin/checkin',
        icon: '✅',
        label: 'Check In Patron',
        sub: 'Manually check someone in',
        style: 'border-amber-700/60 bg-amber-950/40',
        labelStyle: 'text-amber-400',
    },
    {
        href: '/admin/users',
        icon: '👥',
        label: 'Attendees',
        sub: 'View everyone checked in',
        style: 'border-zinc-700 bg-zinc-900/60',
        labelStyle: 'text-white',
    },
];

const SUPER_CARDS = [
    {
        href: '/admin/staff',
        icon: '🔑',
        label: 'Manage Staff',
        sub: 'Add or view staff accounts',
        style: 'border-amber-800/50 bg-amber-950/30',
        labelStyle: 'text-amber-400',
    },
    {
        href: '/admin/amenities',
        icon: '🕐',
        label: 'Event Times',
        sub: 'Update amenity schedules',
        style: 'border-amber-800/50 bg-amber-950/30',
        labelStyle: 'text-amber-400',
    },
];

export default function Home() {
    const { auth } = usePage().props;
    const { post, processing } = useForm();

    const cards = auth.user?.is_super_admin ? [...NAV_CARDS, ...SUPER_CARDS] : NAV_CARDS;

    function logout(e) {
        e.preventDefault();
        post('/admin/logout');
    }

    return (
        <div className="flex min-h-screen flex-col bg-black px-5 py-14 text-white">
            <Head title="Staff Portal" />
            <div className="mx-auto w-full max-w-sm">
            <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                    Komic Karma
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight">Staff Portal</h1>
                <p className="mt-1 text-sm text-zinc-500">Welcome, {auth.user?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className={`flex aspect-square flex-col justify-between rounded-2xl border p-5 active:scale-[0.97] transition-transform ${card.style}`}
                    >
                        <span className="text-4xl">{card.icon}</span>
                        <div>
                            <p className={`text-base font-bold leading-tight ${card.labelStyle}`}>{card.label}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">{card.sub}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-auto pt-12 text-center">
                <form onSubmit={logout}>
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-xs text-zinc-700 disabled:opacity-40 active:text-zinc-500"
                    >
                        Sign out
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}
