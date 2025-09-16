

interface Props {
    children: React.ReactNode
    className?: string
}

export default function Card({ children, className }: Props) {
    return <div className={`bg-white rounded-lg shadow-lg ${className}`}>{children}</div>
}