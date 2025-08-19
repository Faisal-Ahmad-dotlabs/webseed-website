"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/global-header"
import { Badge } from "@/components/ui/badge"
import { PowerBIEmbed } from "powerbi-client-react" // Import PowerBIEmbed
import { models } from "powerbi-client" // Import models for TokenType

export default function ReportDetailPage() {
  const params = useParams()
  const powerBiReportId = params.id || null
  const [isClient, setIsClient] = useState(false)

  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setIsClient(true)
    const fetchReport = async () => {
      setLoading(true)
      setError("")
      try {
        // The browser will automatically send the session cookie with this request
        const response = await fetch(`/api/reports/${powerBiReportId}`)
        if (response.ok) {
          const data = await response.json()
          setReportData(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to load report details.")
        }
      } catch (err) {
        console.error("Error fetching report:", err)
        setError("An unexpected error occurred while loading the report.")
      } finally {
        setLoading(false)
      }
    }

    if (powerBiReportId) {
      fetchReport()
    }
  }, [powerBiReportId])

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/dashboard" },
    { label: reportData?.title || "Loading Report...", isPage: true },
  ]

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset className="bg-muted">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <main className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-full" /> {/* Placeholder for banner */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="min-h-[calc(100vh-250px)] flex-1 rounded-xl bg-muted/50 md:min-h-min flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <p className="mt-4 text-lg">Loading Report...</p>
                  <p className="text-sm">Connecting to Power BI...</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !reportData) {
    return (
      <SidebarProvider>
        <SidebarInset className="bg-muted">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <main className="flex flex-1 flex-col gap-4 p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error || "Report not found or access denied."}</AlertDescription>
            </Alert>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <SidebarInset className="bg-muted">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        <main className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{reportData.title}</h1>
              <p className="text-muted-foreground text-sm">{reportData.description || "No description provided."}</p>
            </div>
            <div className="flex items-center gap-2">
              {reportData.type && <Badge variant="secondary">{reportData.type}</Badge>}
              <span className="text-sm text-muted-foreground">
                Last updated: {reportData?.created_at ? new Date(reportData.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Free trial banner */}
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-center">
            This is a free trial version, to remove this label a capacity must be purchased.{" "}
            <Link href="#" className="underline ml-1">
              Learn more
            </Link>
          </div>
          <div className="w-full min-h-[80vh] border rounded-lg overflow-hidden">
              <PowerBIEmbed
                embedConfig={{
                  type: "report",
                  id: reportData.reportId,
                  embedUrl: reportData.embedUrl,
                  accessToken: reportData.embedToken,
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: {
                      filters: {
                        expanded: false,
                        visible: false,
                      },
                      pageNavigation: {
                        visible: false,
                      },
                    },
                  },
                }}
                eventHandlers={
                  new Map([
                    [
                      "loaded",
                      () => {
                        console.log("Report loaded");
                      },
                    ],
                    [
                      "rendered",
                      () => {
                        console.log("Report rendered");
                      },
                    ],
                    [
                      "error",
                      (event) => {
                        console.error("Power BI Embed Error:", event.detail);
                      },
                    ],
                  ])
                }
                cssClassName="w-full h-full"
              />
            </div>

         <Card>
          <CardHeader>
            <CardTitle>Power BI Report</CardTitle>
            <CardDescription>Interactive dashboard and analytics</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
          </CardContent>
        </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
