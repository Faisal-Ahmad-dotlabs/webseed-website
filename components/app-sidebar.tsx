"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, FileText, ChevronDown, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarMenuSkeleton, // Import Skeleton
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SearchForm } from "./search-form"
import { getUserReports } from "@/lib/actions" // Import server action

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [userReports, setUserReports] = React.useState<any[]>([])
  const [loadingReports, setLoadingReports] = React.useState(true)

  React.useEffect(() => {
    const fetchReports = async () => {
      setLoadingReports(true)
      try {
        const reports = await getUserReports()
        // Flatten the reports from accounting and manufacturing for the sidebar list
        const allReports = [...reports.accounting, ...reports.manufacturing]
        setUserReports(allReports || [])
      } catch (error) {
        console.error("Failed to fetch user reports:", error)
        setUserReports([])
      } finally {
        setLoadingReports(false)
      }
    }
    fetchReports()
  }, [])

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Reports",
      icon: FileText,
      isCollapsible: true,
      items: userReports, // This will be dynamically populated
      loading: loadingReports,
    },
    {
      title: "RBAC",
      url: "/rbac",
      icon: Users, // Changed to Users icon for RBAC
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.isCollapsible ? (
                    <Collapsible
                      defaultOpen={pathname.startsWith("/report") || pathname.startsWith("/dashboard/reports")}
                      className="group/collapsible w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname.startsWith("/report") || pathname.startsWith("/dashboard/reports")}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          {state === "expanded" && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {item.loading ? "..." : item.items.length}
                            </span>
                          )}
                          {state === "expanded" && (
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.loading ? (
                            // Render skeleton while loading
                            Array.from({ length: 3 }).map((_, index) => (
                              <SidebarMenuSubItem key={index}>
                                <SidebarMenuSkeleton showIcon />
                              </SidebarMenuSubItem>
                            ))
                          ) : item.items.length > 0 ? (
                            item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === `/report/${subItem.power_bi_report_id}`}
                                >
                                  <Link href={`/report/${subItem.power_bi_report_id}`}>{subItem.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))
                          ) : (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton disabled>No reports available</SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : // Conditionally render RBAC link based on user designation
                  item.title === "RBAC" && props?.userDesignation !== "Admin" ? null : (
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
