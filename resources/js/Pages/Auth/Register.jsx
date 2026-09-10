import { AuthField, AuthHeader, AuthSubmit } from '@/Components/AuthElements';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LockKeyhole, Mail, User, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    const submit = (event) => {
        event.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Create account" />
            <AuthHeader eyebrow="Get started" title="Create your workspace" description="Start turning ideas into polished, shareable diagrams." icon={UserPlus} />

            <form className="auth-form" onSubmit={submit}>
                <AuthField label="Full name" htmlFor="name" icon={User} error={errors.name}>
                    <TextInput id="name" name="name" value={data.name} className="auth-input" autoComplete="name" isFocused onChange={(event) => setData('name', event.target.value)} placeholder="Your name" required />
                </AuthField>
                <AuthField label="Email address" htmlFor="email" icon={Mail} error={errors.email}>
                    <TextInput id="email" type="email" name="email" value={data.email} className="auth-input" autoComplete="username" onChange={(event) => setData('email', event.target.value)} placeholder="you@example.com" required />
                </AuthField>
                <div className="auth-field-grid">
                    <AuthField label="Password" htmlFor="password" icon={LockKeyhole} error={errors.password}>
                        <TextInput id="password" type="password" name="password" value={data.password} className="auth-input" autoComplete="new-password" onChange={(event) => setData('password', event.target.value)} placeholder="8+ characters" required />
                    </AuthField>
                    <AuthField label="Confirm password" htmlFor="password_confirmation" icon={LockKeyhole} error={errors.password_confirmation}>
                        <TextInput id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} className="auth-input" autoComplete="new-password" onChange={(event) => setData('password_confirmation', event.target.value)} placeholder="Repeat password" required />
                    </AuthField>
                </div>

                <p className="auth-terms">By creating an account, you agree to use FlowCraft responsibly.</p>
                <AuthSubmit processing={processing}>Create account</AuthSubmit>
            </form>

            <p className="auth-switch">Already have an account? <Link href={route('login')}>Sign in</Link></p>
        </GuestLayout>
    );
}
