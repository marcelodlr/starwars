interface Props {
    title: string
    children: React.ReactNode
}

export default function Section({ title, children }: Props) {
    return <div className="flex flex-col gap-2 pr-4">
        <h2 className="text-base font-bold border-separator border-b-[0.5px]">{title}</h2>
        {children}
    </div>
}
