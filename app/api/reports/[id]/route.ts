import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import pool from "@/lib/db"
import { verifySession } from "@/lib/auth" // Import verifySession

// Ensure these environment variables are set in your Vercel project settings
const config = {
  tenantId: process.env.TENANT_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  workspaceId: process.env.WORKSPACE_ID,
  authorityUrl: "https://login.microsoftonline.com/",
  scope: "https://analysis.windows.net/powerbi/api/.default",
  powerBiApiUrl: "https://api.powerbi.com/",
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const powerBiReportId = params.id // The ID from the URL is the Power BI Report ID
    const session = await verifySession() // Verify session from cookie

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Session invalid or expired." }, { status: 401 })
    }

    if (!powerBiReportId) {
      return NextResponse.json({ error: "Missing report ID in URL" }, { status: 400 })
    }

    // Ensure all Power BI environment variables are set
    if (!config.tenantId || !config.clientId || !config.clientSecret || !config.workspaceId) {
      console.error("❌ Missing one or more Power BI environment variables!")
      return NextResponse.json({ error: "Server configuration error: Power BI credentials missing." }, { status: 500 })
    }
      
    const user_id = session.userId 
      ? (typeof session.userId === "object" && "id" in session.userId ? session.userId.id : session.userId) 
      : null;

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized: User ID is missing." }, { status: 401 });
    }
    // Verify user has access to this report using the power_bi_report_id
    if (!pool) {
      console.error("Database connection pool is not initialized.");
      return NextResponse.json({ error: "Server configuration error: Database connection unavailable." }, { status: 500 });
    }

    const accessResult = await pool.query(
      `SELECT r.id, r.title, r.power_bi_report_id, r.type, r.description
       FROM reports r
       JOIN user_report_access ura ON r.id = ura.report_id
       WHERE ura.user_id = $1 AND r.power_bi_report_id = $2`,
      [user_id, powerBiReportId],
    );

    const report = accessResult.rows[0]

    if (!report) {
      return NextResponse.json({ error: "Access denied or report not found." }, { status: 403 })
    }

    // Get Power BI access token
    const tokenResponse = await axios.post(
      `${config.authorityUrl}${config.tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: config.scope,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    )
    const accessToken = tokenResponse.data.access_token

    // Get embed token
    const embedResponse = await axios.post(
      `${config.powerBiApiUrl}v1.0/myorg/groups/${config.workspaceId}/reports/${powerBiReportId}/GenerateToken`,
      {
        accessLevel: "View",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    // Get embed URL
    const reportResponse = await axios.get(
      `${config.powerBiApiUrl}v1.0/myorg/groups/${config.workspaceId}/reports/${powerBiReportId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return NextResponse.json({
      embedToken: embedResponse.data.token,
      embedUrl: reportResponse.data.embedUrl,
      reportId: powerBiReportId,
      name: reportResponse.data.name,
      title: report.title, // Pass the title from our DB for consistency
      description: report.description, // Pass description from our DB
      type: report.type, // Pass type from our DB
    })
  } catch (error) {
    console.error("Power BI Embed Error:", error)
    if (axios.isAxiosError(error)) {
      console.error("Axios error response data:", error.response?.data)
      console.error("Axios error response status:", error.response?.status)
      return NextResponse.json(
        { error: `Failed to get embed details: ${error.response?.data?.error_description || error.message}` },
        { status: error.response?.status || 500 },
      )
    }
    return NextResponse.json({ error: "An unexpected error occurred while fetching report details." }, { status: 500 })
  }
}
