import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getStatistics } from '../../api/statistics'
import Card from '../../components/Card/Card'

export const Route = createFileRoute('/stats/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    retry: 3,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading statistics: {error.message}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    )
  }
  console.log(data)
  // Transform data for charts - take top 3 for each category
  const top3QueriesData = data.top5Queries.slice(0, 3).map(item => ({
    name: item.path.replace('/api/', '').substring(0, 20) + (item.path.length > 20 ? '...' : ''),
    count: item.count,
    fullPath: item.path
  }))

  const popularCharactersData = data.popularCharacters.slice(0, 3).map(item => ({
    name: item.name.substring(0, 15) + (item.name.length > 15 ? '...' : ''),
    count: item.requestCount,
    fullName: item.name
  }))

  const popularMoviesData = data.popularMovies.slice(0, 3).map(item => ({
    name: item.name.substring(0, 15) + (item.name.length > 15 ? '...' : ''),
    count: item.requestCount,
    fullName: item.name
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Statistics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
        <p className="text-gray-600">Total requests: {data.totalRequests.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Queries Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top 3 API Endpoints</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top3QueriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload
                    return item?.fullPath || label
                  }}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Popular Characters Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Popular Characters</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCharactersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload
                    return item?.fullName || label
                  }}
                />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Popular Movies Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Popular Movies</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularMoviesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload
                    return item?.fullName || label
                  }}
                />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
