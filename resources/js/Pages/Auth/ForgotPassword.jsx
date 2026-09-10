import { AuthField, AuthHeader, AuthStatus, AuthSubmit } from '@/Components/AuthElements';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit = (event) => { event.preventDefault(); post(route('password.email')); };

    return (
        <GuestLayout>
            <Head title="Forgot password" />
            <AuthHeader eyebrow="Account recovery" title="Reset your password" description="Enter your account email and we’ll send you a secure reset link." icon={KeyRound} />
            <AuthStatus>{status}</AuthStatus>

            <form className="auth-form" onSubmit={submit}>
                <AuthField label="Email address" htmlFor="email" icon={Mail} error={errors.email}>
                    <TextInput id="email" type="email" name="email" value={data.email} className="auth-input" autoComplete="username" isFocused onChange={(event) => setData('email', event.target.value)} placeholder="you@example.com" required />
                </AuthField>
                <AuthSubmit processing={processing}>Send reset link</AuthSubmit>
            </form>

            <p className="auth-switch"><Link href={route('login')}><ArrowLeft size={14} /> Back to sign in</Link></p>
        </GuestLayout>
    );
}
