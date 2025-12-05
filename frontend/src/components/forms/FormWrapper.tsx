import React from 'react';
import styles from '@/styles/components/forms/Form.module.css';
import Divider from '@/components/shared/Divider';

interface FormWrapperProps {
    title: string;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    error?: string | null;
    footer?: React.ReactNode;
}

export default function FormWrapper({
    title,
    subtitle,
    children,
    onSubmit,
    error,
    footer
}: FormWrapperProps) {
    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                <form className={styles.form} onSubmit={onSubmit}>
                    {error && <p className={styles.error}>{error}</p>}
                    {children}
                </form>

                {footer && (
                    <>
                        <Divider size="xlarge" thickness="thin" />
                        <div className={styles.footer}>
                            {footer}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}