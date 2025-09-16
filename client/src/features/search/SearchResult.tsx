import Button from '../../components/Button'
import Card from '../../components/Card/Card';

interface Props {
    results: { id: string; name: string }[]
    isLoading: boolean
    error: Error | null
    onSeeDetailsClick: (id: string) => void
}

export default function SearchResult({
    results,
    onSeeDetailsClick,
    isLoading,
    error,
}: Props) {
    return (
        <Card className="p-10 h-[600px] w-[700px]">
            <h3 className="text-lg font-bold pb-2 border-separator border-b-[0.5px]">
                Results
            </h3>
            <div className="h-full overflow-y-auto">
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Searching...</div>
                </div>
            )}

            {error && !isLoading && (
                <div className="flex items-center justify-center py-16">
                    <div className="text-red-500">Error: {error.message}</div>
                </div>
            )}

            {!isLoading && !error && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-typography-secondary h-full">
                    <p className="mb-2 text-wrap">There are zero matches.<br />
                    Use the form to search for People or Movies.</p>
                </div>
            )}

            {!isLoading && !error && results.length > 0 && (
                <div className="flex flex-col">
                    {results.map(({ id, name }) => (
                        <div
                            key={id}
                            className="flex items-center justify-between py-2 border-b-[0.5px] border-separator"
                        >
                            <span className="font-semibold text-base">
                                {name}
                            </span>
                            <Button
                                onClick={() => onSeeDetailsClick(id)}
                                label="See Details"
                            />
                        </div>
                    ))}
                </div>
            )}
            </div>
        </Card>
    )
}
