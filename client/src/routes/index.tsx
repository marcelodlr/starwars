import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, SearchResult } from '../features/search'
import { useState } from 'react'
import type { SearchType } from '../features/search/types'
import { useQuery } from '@tanstack/react-query'
import { getSearch } from '../api'

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [searchType, setSearchType] = useState<SearchType>('people')
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['search'],
        queryFn: () => getSearch(searchType, searchQuery),
        retry: false,
        enabled: false,
        gcTime: 0,
    })

    const handleSeeDetailsClick = (id: string) => {
        if(searchType === 'movies') {
            navigate({ to: '/movies/$id', params: { id } })
        } else {
            navigate({ to: '/character/$id', params: { id } })
        }
    }

    return (
        <div className="flex items-center justify-center gap-4 px-6">
            <Search
                onSearch={refetch}
                searchType={searchType}
                searchQuery={searchQuery}
                onSearchTypeChange={setSearchType}
                onSearchQueryChange={setSearchQuery}
            />
            <SearchResult
                results={data ?? []}
                onSeeDetailsClick={handleSeeDetailsClick}
                isLoading={isLoading}
                error={error}
            />
        </div>
    )
}
