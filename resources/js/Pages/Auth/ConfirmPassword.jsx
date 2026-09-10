import { AuthField, AuthHeader, AuthSubmit } from '@/Components/AuthElements';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });
    const submit = (event) => {
        event.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirm password" />
            <AuthHeader eyebrow="Security check" title="Confirm it’s you" description="This area contains sensitive information. Enter your password to continue." icon={ShieldCheck} />
            <form className="auth-form" onSubmit={submit}>
                <AuthField label="Password" htmlFor="password" icon={LockKeyhole} error={errors.password}>
                    <TextInput id="password" type="password" name="password" value={data.password} className="auth-input" autoComplete="current-password" isFocused onChange={(event) => setData('password', event.target.value)} placeholder="Enter your password" required />
                </AuthField>
                <AuthSubmit processing={processing}>Continue securely</AuthSubmit>
            </form>
        </GuestLayout>
    );
}
