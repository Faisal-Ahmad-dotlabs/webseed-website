// import type { InferSelectModel } from "drizzle-orm"
// import type { users, reports, userReportAccess } from "@/lib/schema"

declare global {
  type User = InferSelectModel<typeof users>
  type Report = InferSelectModel<typeof reports>
  type UserReportAccess = InferSelectModel<typeof userReportAccess>

  interface AuthTokenPayload {
    userId: string
    email: string
    isPasswordChanged: boolean
    exp: number // Expiration time in seconds
  }
}
// export type User = typeof users.$inferSelect & {
//   assignedReports?: Report[]
// }

// export type Report = typeof reports.$inferSelect
// export type UserReportAccess = {
// user: {
//   id: number
//   name: string | null
//   email: string
//   status: "active" | "inactive"
//   designation: string | null
// }
// reportsCount: number
// reportTypes: string[]
// }

// types/index.d.ts

export type User = {
  id: string // UUIDs are typically strings in JS
  name: string
  email: string
  password?: string // Optional, as it might not always be fetched or needed on client
  temporary_password?: string | null // From DB, can be null
  designation?: string | null // Can be null
  role: "admin" | "user" | string // Allow string for flexibility if other roles exist
  status: "active" | "inactive" | string // Allow string for flexibility if other statuses exist
  is_password_changed: boolean // From DB: is_password_changed
  created_at?: Date
  updated_at?: Date
  assignedReports?: Report[] // Joined data from user_report_access
}

export type Report = {
  id: string // UUID
  title: string
  description?: string | null // Can be null
  power_bi_report_id: string // From DB: power_bi_report_id
  power_bi_embed_url: string // From DB: power_bi_embed_url
  type: "Accounting" | "Manufacturing" | string // Allow string for flexibility
  created_at?: Date
}

export type UserReportAccessOverview = {
  user: {
    id: string
    name: string
    email: string
    status: "active" | "inactive" | string
    designation?: string | null
  }
  reportsCount: number
  reportTypes: string[]
}

// Generic response type for server actions
export type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  redirectPath?: string
}

export type UserReportAccess = {
  user_id: string
  report_id: string
  access_level: "viewer" | "editor" | "admin"
  user_name: string
  report_title: string
  report_type: string
  user_email: string
  user_designation: string
  user_role: "Admin" | "User" | "Viewer"
  user_status: "active" | "inactive"
}

export type UserWithReports = User & {
  reports: Report[]
}

export type ReportWithUsers = Report & {
  users: User[]
}

export type UserReportAccessForm = {
  user_id: string
  report_id: string
  access_level: "viewer" | "editor" | "admin"
}

export type UserFormValues = {
  id?: string
  name: string
  email: string
  designation: string
  role: "Admin" | "User" | "Viewer"
  password?: string
  status: "active" | "inactive"
  assignedReports?: string[]
}

export type ReportFormValues = {
  id?: string
  title: string
  description: string
  power_bi_report_id: string
  type: string
}

export type UserReportAccessTableColumn = ColumnDef<UserReportAccess> & {
  id: string
  header: string
  accessorKey?: keyof UserReportAccess
}

export type UserTableColumn = ColumnDef<User> & {
  id: string
  header: string
  accessorKey?: keyof User
}

export type ReportTableColumn = ColumnDef<Report> & {
  id: string
  header: string
  accessorKey?: keyof Report
}
