export interface BaseMovie {
    id: string
    title: string
}

export interface Movie extends BaseMovie {
    opening_crawl: string
    characters: { id: string, name: string }[]
}
