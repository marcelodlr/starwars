import { createFileRoute } from '@tanstack/react-router'
import { getMovie } from '../../api'
import Section from '../../components/Section'
import Link from '../../components/Link'

export const Route = createFileRoute('/movies/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const movie = await getMovie(params.id)
    return movie
  }
})

function RouteComponent() {
  const movie = Route.useLoaderData()
  return <div className="flex flex-col gap-2 px-6 bg-white rounded-lg shadow-lg p-10 w-[700px] m-auto">
      <h1 className="text-lg font-bold">{movie.title}</h1>
      <div className="flex justify-between">
        <div className="w-[50%]">
          <Section title="Opening Crawl">
            <p className="text-base pr-4 w-[70%]">{movie.opening_crawl}</p>
          </Section>
        </div>
        <div className="w-[50%]">
        <Section title="Characters">
          <div className="flex flex-wrap">
          {movie.characters.map((character, index) => (
            <>
            <Link key={character.id} to={`/character/$id`} params={{ id: character.id }}>{character.name}</Link>
            {index < movie.characters.length - 1 && <span className="tex  t-gray-500 text-sm">, </span>}
            </>
          ))}
          </div>
        </Section>
        </div>
   </div>
  </div>
}
