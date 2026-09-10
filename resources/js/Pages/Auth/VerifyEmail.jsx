import { AuthHeader, AuthStatus, AuthSubmit } from '@/Components/AuthElements';
import GuestLayout from '@/Layouts/NonEmbedded/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const submit = (event) => { event.preventDefault(); post(route('verification.send')); };

    return (
        <GuestLayout>
            <Head title="Verify email" />
            <AuthHeader eyebrow="One last step" title="Check your inbox" description="We sent a verification link to your email. Open it to activate your FlowCraft workspace." icon={MailCheck} />
            {status === 'verification-link-sent' && <AuthStatus>A new verification link has been sent to your email address.</AuthStatus>}

            <div className="auth-info-box">Didn’t receive it? Check your spam folder or request another email below.</div>
            <form className="auth-form" onSubmit={submit}>
                <AuthSubmit processing={processing}>Resend verification email</AuthSubmit>
            </form>
            <p className="auth-switch"><Link href={route('logout')} method="post" as="button">Sign out and use another account</Link></p>
        </GuestLayout>
    );
}
