import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Skeleton className="h-10 w-64 mb-4 bg-gray-700" /> {/* Skeleton for Welcome message */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gray-800 text-white border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-20 bg-gray-700" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-32 mt-1 bg-gray-700" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32 bg-gray-700" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48 bg-gray-700" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full rounded-lg bg-gray-700" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48 bg-gray-700" />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md bg-gray-700" />
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48 bg-gray-700" />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md bg-gray-700" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
