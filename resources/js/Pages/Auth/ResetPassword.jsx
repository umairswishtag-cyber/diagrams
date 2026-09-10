import { AuthField, AuthHeader, AuthSubmit } from '@/Components/AuthElements';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, LockKeyhole, Mail } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({ token, email, password: '', password_confirmation: '' });
    const submit = (event) => {
        event.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Reset password" />
            <AuthHeader eyebrow="Choose a new password" title="Secure your account" description="Use a strong password you haven’t used for this account before." icon={KeyRound} />

            <form className="auth-form" onSubmit={submit}>
                <AuthField label="Email address" htmlFor="email" icon={Mail} error={errors.email}>
                    <TextInput id="email" type="email" name="email" value={data.email} className="auth-input" autoComplete="username" onChange={(event) => setData('email', event.target.value)} required />
                </AuthField>
                <AuthField label="New password" htmlFor="password" icon={LockKeyhole} error={errors.password}>
                    <TextInput id="password" type="password" name="password" value={data.password} className="auth-input" autoComplete="new-password" isFocused onChange={(event) => setData('password', event.target.value)} placeholder="Enter a new password" required />
                </AuthField>
                <AuthField label="Confirm new password" htmlFor="password_confirmation" icon={LockKeyhole} error={errors.password_confirmation}>
                    <TextInput id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} className="auth-input" autoComplete="new-password" onChange={(event) => setData('password_confirmation', event.target.value)} placeholder="Repeat new password" required />
                </AuthField>
                <AuthSubmit processing={processing}>Update password</AuthSubmit>
            </form>
        </GuestLayout>
    );
}
