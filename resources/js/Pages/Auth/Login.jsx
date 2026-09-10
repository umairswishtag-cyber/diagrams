import { AuthField, AuthHeader, AuthStatus, AuthSubmit } from '@/Components/AuthElements';
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LockKeyhole, LogIn, Mail } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: '', password: '', remember: false });
    const submit = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <AuthHeader eyebrow="Welcome back" title="Sign in to FlowCraft" description="Continue building and sharing your visual workspace." icon={LogIn} />
            <AuthStatus>{status}</AuthStatus>

            <form className="auth-form" onSubmit={submit}>
                <AuthField label="Email address" htmlFor="email" icon={Mail} error={errors.email}>
                    <TextInput id="email" type="email" name="email" value={data.email} className="auth-input" autoComplete="username" isFocused onChange={(event) => setData('email', event.target.value)} placeholder="you@example.com" required />
                </AuthField>
                <AuthField label="Password" htmlFor="password" icon={LockKeyhole} error={errors.password}>
                    <TextInput id="password" type="password" name="password" value={data.password} className="auth-input" autoComplete="current-password" onChange={(event) => setData('password', event.target.value)} placeholder="Enter your password" required />
                </AuthField>

                <div className="auth-form-options">
                    <label className="auth-checkbox">
                        <Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} />
                        <span>Remember me</span>
                    </label>
                    {canResetPassword && <Link href={route('password.request')} className="auth-text-link">Forgot password?</Link>}
                </div>

                <AuthSubmit processing={processing}>Sign in</AuthSubmit>
            </form>

            <p className="auth-switch">New to FlowCraft? <Link href={route('register')}>Create an account</Link></p>
        </GuestLayout>
    );
}
