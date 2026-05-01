import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
            <h1 className="mb-1 text-2xl font-bold">Staff Login</h1>
            <p className="mb-8 text-gray-400">Cars, Cues &amp; Comedy</p>

            <form onSubmit={submit} className="flex w-full max-w-xs flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        autoComplete="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 w-full rounded-lg bg-white py-3 font-semibold text-black disabled:opacity-50"
                >
                    {processing ? 'Logging in…' : 'Log in'}
                </button>
            </form>
        </div>
    );
}
