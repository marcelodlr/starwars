interface ButtonProps {
    onClick: () => void
    label: string
    disabled?: boolean
    fullWidth?: boolean
}

export default function Button({
    onClick,
    label,
    disabled = false,
    fullWidth = false,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${fullWidth ? 'w-full' : ''} ${disabled ? 'bg-disabled' : 'bg-primary cursor-pointer hover:brightness-90'} text-white font-bold text-xs py-2 px-4 rounded-full transition-colors duration-200 uppercase`}
            disabled={disabled}
        >
            {label}
        </button>
    )
}
