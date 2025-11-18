import styles from '@/styles/components/shared/Input.module.css';

interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
}

export default function Input({
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    disabled = false,
    required = false,
    name,
    id,
    ...props
}: InputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${styles.input} ${className}`}
            disabled={disabled}
            required={required}
            name={name}
            id={id}
            {...props}
        />
    );
}