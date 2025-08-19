import { getSessionUser } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RbacUserTable } from "@/components/rbac-user-table"
import { RbacReportTable } from "@/components/rbac-report-table"
import { getAllUsers, getAllReports, getAllUserReportAccess, getUserDetails } from "@/lib/actions"
import { redirect } from "next/navigation"
import { RbacUserAccessTable } from "@/components/rbac-user-access-table" // Import the new component

export default async function RBACPage() {
  // This function runs on the server, protecting the route
  await getSessionUser()
  const user = await getUserDetails()
  if (!user || user.designation !== "Admin") {
    redirect("/unauthorized")
  }
  const initialUsers = await getAllUsers()
  const initialReports = await getAllReports()
  const initialUserReportAccess = await getAllUserReportAccess()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold mb-4">Role-Based Access Control</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 text-gray-300">
          <TabsTrigger value="users" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            Reports
          </TabsTrigger>
          <TabsTrigger value="user-access" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            User Reports Access
          </TabsTrigger>
        </TabsList>
        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription className="text-gray-400">
                View, add, edit, and deactivate user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RbacUserTable initialUsers={initialUsers} initialReports={initialReports} />
            </CardContent>
          </Card>
        </TabsContent>
        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Manage Reports</CardTitle>
              <CardDescription className="text-gray-400">Add, edit, and delete Power BI reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <RbacReportTable initialReports={initialReports} />
            </CardContent>
          </Card>
        </TabsContent>
        {/* User Reports Access Tab */}
        <TabsContent value="user-access" className="mt-4">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>User Reports Access Overview</CardTitle>
              <CardDescription className="text-gray-400">Read-only view of user-report assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              <RbacUserAccessTable initialUserReportAccess={initialUserReportAccess} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
