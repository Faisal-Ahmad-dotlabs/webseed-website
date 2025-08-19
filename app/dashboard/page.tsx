import { cookies } from "next/headers"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Settings,
  AccessibilityIcon,
  FileText,
  ChevronDown,
  Briefcase,
  PieChart,
  BookOpen,
  Factory,
  User2,
  BarChart2,
} from "lucide-react"
import Link from "next/link"
import { getUserDetails, getUserReports } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DashboardHeader } from "@/components/global-header"
import { getSessionUser } from "@/lib/auth" // Ensure this is imported for route protection

export default async function DashboardPage() {
  await getSessionUser() // Protect this route

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const user = await getUserDetails()
  const userReports = await getUserReports()

  const totalReports = userReports.accounting.length + userReports.manufacturing.length
  const accountingReportsCount = userReports.accounting.length
  const manufacturingReportsCount = userReports.manufacturing.length

  const breadcrumbItems = [{ label: "Dashboard", href: "/dashboard" }]

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center p-4 bg-gray-900 text-white">
          <h1 className="text-xl font-bold">Web-Seed-Portal</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={true}>
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <FileText />
                        <span>Reports</span>
                        <SidebarMenuBadge>{totalReports}</SidebarMenuBadge> {/* Display total reports count */}
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {totalReports === 0 ? (
                        <SidebarMenuSub className="text-muted-foreground text-xs px-4 py-2">
                          No reports available.
                        </SidebarMenuSub>
                      ) : (
                        <SidebarMenuSub>
                          {accountingReportsCount > 0 && (
                            <SidebarMenuSubItem>
                              <Collapsible defaultOpen className="group/collapsible">
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton size="sm">
                                    <BookOpen className="text-blue-400" />
                                    <span>Accounting Reports</span>
                                    <SidebarMenuBadge>{accountingReportsCount}</SidebarMenuBadge>
                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="border-l border-gray-700 ml-2 pl-2">
                                    {userReports.accounting.map((report) => (
                                      <SidebarMenuSubItem key={report.id}>
                                        <SidebarMenuSubButton asChild size="sm" className="hover:bg-gray-700">
                                          <Link href={`/report/${report.power_bi_report_id}`}>
                                            <span>{report.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            </SidebarMenuSubItem>
                          )}
                          {manufacturingReportsCount > 0 && (
                            <SidebarMenuSubItem>
                              <Collapsible defaultOpen className="group/collapsible">
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton size="sm">
                                    <Factory className="text-green-400" />
                                    <span>Manufacturing Reports</span>
                                    <SidebarMenuBadge>{manufacturingReportsCount}</SidebarMenuBadge>
                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="border-l border-gray-700 ml-2 pl-2">
                                    {userReports.manufacturing.map((report) => (
                                      <SidebarMenuSubItem key={report.id}>
                                        <SidebarMenuSubButton asChild size="sm" className="hover:bg-gray-700">
                                          <Link href={`/report/${report.power_bi_report_id}`}>
                                            <span>{report.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      )}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              {user?.designation === "Admin" && ( 
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/rbac">
                      <AccessibilityIcon />
                      <span>RBAC</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-gray-950">
        {" "}
        {/* Darker background for the main content area */}
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Welcome Note Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Good evening, {user?.name || user?.email}!</h1>
              <p className="text-sm mt-1">Welcome back to your dashboard. You have access to {totalReports} reports.</p>
              <p className="text-xs mt-2 opacity-80">Last Login: {new Date().toLocaleDateString()}</p>
            </div>
            <LayoutDashboard className="h-12 w-12 opacity-70" />
          </div>

          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs opacity-90">Accessible reports</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-800 to-green-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Report Types</CardTitle>
                <PieChart className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accountingReportsCount > 0 && "Accounting"}
                  {accountingReportsCount > 0 && manufacturingReportsCount > 0 && ", "}
                  {manufacturingReportsCount > 0 && "Manufacturing"}
                  {totalReports === 0 && "None"}
                </div>
                <p className="text-xs opacity-90">Categories of reports you can view</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-800 to-purple-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Designation</CardTitle>
                <Briefcase className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.designation || "N/A"}</div>
                <p className="text-xs opacity-90">Your current role</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-800 to-orange-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Role</CardTitle>
                <User2 className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.role || "N/A"}</div>
                <p className="text-xs opacity-90">Company: WebSeed</p> {/* Added static company branding */}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Your Reports Section */}
            <Card className="bg-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription className="text-gray-300">Quick access to your assigned reports.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {totalReports === 0 ? (
                  <p className="text-muted-foreground">No reports assigned to you.</p>
                ) : (
                  <>
                    {userReports.accounting.map((report) => (
                      <Link
                        key={report.id}
                        href={`/report/${report.power_bi_report_id}`}
                        className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
                          <span className="font-medium">{report.title}</span>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-gray-300">Accounting</span>
                      </Link>
                    ))}
                    {userReports.manufacturing.map((report) => (
                      <Link
                        key={report.id}
                        href={`/report/${report.power_bi_report_id}`}
                        className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-green-300 group-hover:text-green-200" />
                          <span className="font-medium">{report.title}</span>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-gray-300">Manufacturing</span>
                      </Link>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Report Categories Section */}
            <Card className="bg-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
                <CardDescription className="text-gray-300">Explore reports by category.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {accountingReportsCount > 0 && (
                  <div className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
                      <span className="font-medium">Accounting</span>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">
                      {accountingReportsCount} reports
                    </span>
                  </div>
                )}
                {manufacturingReportsCount > 0 && (
                  <div className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-green-300 group-hover:text-green-200" />
                      <span className="font-medium">Manufacturing</span>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">
                      {manufacturingReportsCount} reports
                    </span>
                  </div>
                )}
                {totalReports === 0 && <p className="text-muted-foreground">No report categories available.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// import { cookies } from "next/headers"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarInset,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarRail,
//   SidebarMenuSub,
//   SidebarMenuSubItem,
//   SidebarMenuSubButton,
//   SidebarMenuBadge,
// } from "@/components/ui/sidebar"
// import {
//   LayoutDashboard,
//   Settings,
//   AccessibilityIcon,
//   FileText,
//   ChevronDown,
//   Briefcase,
//   PieChart,
//   BookOpen,
//   Factory,
//   User2,
//   BarChart2,
// } from "lucide-react"
// import Link from "next/link"
// import { getUserDetails, getUserReports } from "@/lib/actions"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { DashboardHeader } from "@/components/dashboard-header"
// import { getSessionUser } from "@/lib/auth" // Ensure this is imported for route protection

// export default async function DashboardPage() {
//   await getSessionUser() // Protect this route
//   const cookieStore = cookies()
//   const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
//   const user = await getUserDetails()
//   const userReports = await getUserReports()
//   const totalReports = userReports.accounting.length + userReports.manufacturing.length
//   const accountingReportsCount = userReports.accounting.length
//   const manufacturingReportsCount = userReports.manufacturing.length
//   const breadcrumbItems = [{ label: "Dashboard", href: "/dashboard" }]

//   return (
//     <SidebarProvider defaultOpen={defaultOpen}>
//       <Sidebar>
//         <SidebarHeader className="flex items-center justify-center p-4 bg-gray-900 text-white">
//           <h1 className="text-xl font-bold">Web-Seed-Portal</h1>
//         </SidebarHeader>
//         <SidebarContent>
//           <SidebarGroup>
//             <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 <SidebarMenuItem>
//                   <SidebarMenuButton asChild isActive={true}>
//                     <Link href="/dashboard">
//                       <LayoutDashboard />
//                       <span>Dashboard</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//                 <Collapsible defaultOpen className="group/collapsible">
//                   <SidebarMenuItem>
//                     <CollapsibleTrigger asChild>
//                       <SidebarMenuButton>
//                         <FileText />
//                         <span>Reports</span>
//                         <SidebarMenuBadge>{totalReports}</SidebarMenuBadge>{" "}
//                         <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
//                       </SidebarMenuButton>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       {totalReports === 0 ? (
//                         <SidebarMenuSub className="text-muted-foreground text-xs px-4 py-2">
//                           No reports available.
//                         </SidebarMenuSub>
//                       ) : (
//                         <SidebarMenuSub>
//                           {accountingReportsCount > 0 && (
//                             <SidebarMenuSubItem>
//                               <Collapsible defaultOpen className="group/collapsible">
//                                 <CollapsibleTrigger asChild>
//                                   <SidebarMenuSubButton size="sm">
//                                     <BookOpen className="text-blue-400" />
//                                     <span>Accounting Reports</span>
//                                     <SidebarMenuBadge>{accountingReportsCount}</SidebarMenuBadge>
//                                     <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
//                                   </SidebarMenuSubButton>
//                                 </CollapsibleTrigger>
//                                 <CollapsibleContent>
//                                   <SidebarMenuSub className="border-l border-gray-700 ml-2 pl-2">
//                                     {userReports.accounting.map((report) => (
//                                       <SidebarMenuSubItem key={report.id}>
//                                         <SidebarMenuSubButton asChild size="sm" className="hover:bg-gray-700">
//                                           <Link href={`/report/${report.power_bi_report_id}`}>
//                                             <span>{report.title}</span>
//                                           </Link>
//                                         </SidebarMenuSubButton>
//                                       </SidebarMenuSubItem>
//                                     ))}
//                                   </SidebarMenuSub>
//                                 </CollapsibleContent>
//                               </Collapsible>
//                             </SidebarMenuSubItem>
//                           )}
//                           {manufacturingReportsCount > 0 && (
//                             <SidebarMenuSubItem>
//                               <Collapsible defaultOpen className="group/collapsible">
//                                 <CollapsibleTrigger asChild>
//                                   <SidebarMenuSubButton size="sm">
//                                     <Factory className="text-green-400" />
//                                     <span>Manufacturing Reports</span>
//                                     <SidebarMenuBadge>{manufacturingReportsCount}</SidebarMenuBadge>
//                                     <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
//                                   </SidebarMenuSubButton>
//                                 </CollapsibleTrigger>
//                                 <CollapsibleContent>
//                                   <SidebarMenuSub className="border-l border-gray-700 ml-2 pl-2">
//                                     {userReports.manufacturing.map((report) => (
//                                       <SidebarMenuSubItem key={report.id}>
//                                         <SidebarMenuSubButton asChild size="sm" className="hover:bg-gray-700">
//                                           <Link href={`/report/${report.power_bi_report_id}`}>
//                                             <span>{report.title}</span>
//                                           </Link>
//                                         </SidebarMenuSubButton>
//                                       </SidebarMenuSubItem>
//                                     ))}
//                                   </SidebarMenuSub>
//                                 </CollapsibleContent>
//                               </Collapsible>
//                             </SidebarMenuSubItem>
//                           )}
//                         </SidebarMenuSub>
//                       )}
//                     </CollapsibleContent>
//                   </SidebarMenuItem>
//                 </Collapsible>
//                 {user?.designation === "Admin" && (
//                   <SidebarMenuItem>
//                     <SidebarMenuButton asChild>
//                       <Link href="/dashboard/rbac">
//                         <AccessibilityIcon />
//                         <span>RBAC</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 )}
//                 <SidebarMenuItem>
//                   <SidebarMenuButton asChild>
//                     <Link href="/dashboard/settings">
//                       <Settings />
//                       <span>Settings</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>
//         <SidebarRail />
//       </Sidebar>
//       <SidebarInset className="bg-gray-950">
//         {" "}
//         <DashboardHeader breadcrumbItems={breadcrumbItems} />
//         <div className="flex flex-1 flex-col gap-4 p-4">
//           {/* Welcome Note Section */}
//           <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold">Good evening, {user?.name || user?.email}!</h1>
//               <p className="text-sm mt-1">Welcome back to your dashboard. You have access to {totalReports} reports.</p>
//               <p className="text-xs mt-2 opacity-80">Last Login: {new Date().toLocaleDateString()}</p>
//             </div>
//             <LayoutDashboard className="h-12 w-12 opacity-70" />
//           </div>
//           {/* Stat Cards */}
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <Card className="bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
//                 <FileText className="h-4 w-4 opacity-80" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{totalReports}</div>
//                 <p className="text-xs opacity-90">Accessible reports</p>
//               </CardContent>
//             </Card>
//             <Card className="bg-gradient-to-br from-green-800 to-green-600 text-white shadow-lg">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Report Types</CardTitle>
//                 <PieChart className="h-4 w-4 opacity-80" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {accountingReportsCount > 0 && "Accounting"}
//                   {accountingReportsCount > 0 && manufacturingReportsCount > 0 && ", "}
//                   {manufacturingReportsCount > 0 && "Manufacturing"}
//                   {totalReports === 0 && "None"}
//                 </div>
//                 <p className="text-xs opacity-90">Categories of reports you can view</p>
//               </CardContent>
//             </Card>
//             <Card className="bg-gradient-to-br from-purple-800 to-purple-600 text-white shadow-lg">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Designation</CardTitle>
//                 <Briefcase className="h-4 w-4 opacity-80" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{user?.designation || "N/A"}</div>
//                 <p className="text-xs opacity-90">Your current role</p>
//               </CardContent>
//             </Card>
//             <Card className="bg-gradient-to-br from-orange-800 to-orange-600 text-white shadow-lg">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">User Role</CardTitle>
//                 <User2 className="h-4 w-4 opacity-80" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{user?.role || "N/A"}</div>
//                 <p className="text-xs opacity-90">Company: WebSeed</p>{" "}
//               </CardContent>
//             </Card>
//           </div>
//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Your Reports Section */}
//             <Card className="bg-gray-800 text-white shadow-lg">
//               <CardHeader>
//                 <CardTitle>Your Reports</CardTitle>
//                 <CardDescription className="text-gray-300">Quick access to your assigned reports.</CardDescription>
//               </CardHeader>
//               <CardContent className="grid gap-2">
//                 {totalReports === 0 ? (
//                   <p className="text-muted-foreground">No reports assigned to you.</p>
//                 ) : (
//                   <>
//                     {userReports.accounting.map((report) => (
//                       <Link
//                         key={report.id}
//                         href={`/report/${report.power_bi_report_id}`}
//                         className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
//                       >
//                         <div className="flex items-center gap-2">
//                           <BarChart2 className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
//                           <span className="font-medium">{report.title}</span>
//                         </div>
//                         <span className="text-sm text-gray-400 group-hover:text-gray-300">Accounting</span>
//                       </Link>
//                     ))}
//                     {userReports.manufacturing.map((report) => (
//                       <Link
//                         key={report.id}
//                         href={`/report/${report.power_bi_report_id}`}
//                         className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
//                       >
//                         <div className="flex items-center gap-2">
//                           <BarChart2 className="h-4 w-4 text-green-300 group-hover:text-green-200" />
//                           <span className="font-medium">{report.title}</span>
//                         </div>
//                         <span className="text-sm text-gray-400 group-hover:text-gray-300">Manufacturing</span>
//                       </Link>
//                     ))}
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//             {/* Report Categories Section */}
//             <Card className="bg-gray-800 text-white shadow-lg">
//               <CardHeader>
//                 <CardTitle>Report Categories</CardTitle>
//                 <CardDescription className="text-gray-300">Explore reports by category.</CardDescription>
//               </CardHeader>
//               <CardContent className="grid gap-2">
//                 {accountingReportsCount > 0 && (
//                   <div className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
//                     <div className="flex items-center gap-2">
//                       <BookOpen className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
//                       <span className="font-medium">Accounting</span>
//                     </div>
//                     <span className="text-sm text-gray-400 group-hover:text-gray-300">
//                       {accountingReportsCount} reports
//                     </span>
//                   </div>
//                 )}
//                 {manufacturingReportsCount > 0 && (
//                   <div className="group flex items-center justify-between p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
//                     <div className="flex items-center gap-2">
//                       <Factory className="h-4 w-4 text-green-300 group-hover:text-green-200" />
//                       <span className="font-medium">Manufacturing</span>
//                     </div>
//                     <span className="text-sm text-gray-400 group-hover:text-gray-300">
//                       {manufacturingReportsCount} reports
//                     </span>
//                   </div>
//                 )}
//                 {totalReports === 0 && <p className="text-muted-foreground">No report categories available.</p>}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }