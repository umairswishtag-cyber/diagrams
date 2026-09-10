import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function AuthHeader({ eyebrow, title, description, icon: Icon }) {
    return (
        <header className="auth-form-header">
            {Icon && <span className="auth-form-icon"><Icon size={21} strokeWidth={2} /></span>}
            <span className="auth-form-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </header>
    );
}

export function AuthField({ label, htmlFor, icon: Icon, error, children }) {
    return (
        <div className="auth-field">
            <InputLabel htmlFor={htmlFor} value={label} />
            <div className={`auth-input-wrap ${error ? 'has-error' : ''}`}>
                {Icon && <Icon size={17} strokeWidth={1.9} />}
                {children}
            </div>
            <InputError message={error} className="auth-error" />
        </div>
    );
}

export function AuthStatus({ children }) {
    if (!children) return null;
    return <div className="auth-status"><CheckCircle2 size={17} /> <span>{children}</span></div>;
}

export function AuthSubmit({ children, processing, icon = true }) {
    return (
        <PrimaryButton className="auth-submit" disabled={processing}>
            <span>{processing ? 'Please wait…' : children}</span>
            {icon && !processing && <ArrowRight size={17} />}
            {processing && <i className="auth-spinner" />}
        </PrimaryButton>
    );
}
