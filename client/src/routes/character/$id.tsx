import { createFileRoute } from '@tanstack/react-router'
import { getPerson } from '../../api'
import Section from '../../components/Section'
import Link from '../../components/Link'

export const Route = createFileRoute('/character/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const character = await getPerson(params.id)
    return character
  },
  pendingComponent: () => <div>Loading...</div>
})

function RouteComponent() {
  const character = Route.useLoaderData()

   return <div className="flex flex-col gap-2 px-6 bg-white rounded-lg shadow-lg p-10 w-[700px] m-auto">
      <h1 className="text-lg font-bold">{character.name}</h1>
      <div className="flex justify-between">
        <div className="w-[50%] text-base">
          <Section title="Details">
           <span>{`Birth Year: ${character.birth_year}`}</span>
           <span>{`Gender: ${character.gender}`}</span>
           <span>{`Eye Color: ${character.eye_color}`}</span>
           <span>{`Hair Color: ${character.hair_color}`}</span>
           <span>{`Height: ${character.height}`}</span>
           <span>{`Mass: ${character.mass}`}</span>
          </Section>
        </div>
        <div className="w-[50%] text-base">
        <Section title="Movies">
        <div className="flex flex-wrap">
          {character.movies.map((movie, index) => (
            <>
              <Link to={`/movies/$id`} params={{ id: movie.id }}>{movie.name}</Link>
            {index < character.movies.length - 1 && <span className="text-gray-500 text-base">, </span>}
            </>
          ))}
          </div>
        </Section>
        </div>
   </div>
  </div>
}
