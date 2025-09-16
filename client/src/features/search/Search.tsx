import { useState } from 'react'
import Button from '../../components/Button'
import type { SearchType } from './types'

interface Props {
    searchType: SearchType
    searchQuery: string
    onSearchTypeChange: (searchType: SearchType) => void
    onSearchQueryChange: (searchQuery: string) => void
    onSearch: () => void
}

export default function Search({
    searchType,
    searchQuery,
    onSearch,
    onSearchTypeChange,
    onSearchQueryChange,
}: Props) {
    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleRadioChange = (value: 'people' | 'movies') => {
        onSearchTypeChange(value)
        onSearchQueryChange('')
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col gap-4 w-[400px] self-start">
            <h2 className="text-base font-semibold text-typography-primary">
                What are you searching for?
            </h2>

            <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="searchType"
                        value="people"
                        checked={searchType === 'people'}
                        onChange={() => handleRadioChange('people')}
                        className="w-4 h-4 text-[#93c5fd] border-gray-300 focus:ring-[#93c5fd]"
                    />
                    <span className="ml-2 text-gray-700 font-medium">
                        People
                    </span>
                </label>

                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="searchType"
                        value="movies"
                        checked={searchType === 'movies'}
                        onChange={() => handleRadioChange('movies')}
                        className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 font-medium">
                        Movies
                    </span>
                </label>
            </div>

            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    onKeyUp={handleKeyPress}
                    placeholder="Search"
                    className="w-full px-4 h-[35px] border-[0.5px] border-[#383838] rounded-xs text-gray-700 shadow-[inset_0_0.5px_1.5px_0_text-gray-600/75]"
                />
            </div>

            <Button
                onClick={handleSearch}
                label="Search"
                disabled={!searchQuery.trim()}
            />
        </div>
    )
}
