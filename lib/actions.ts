"use server"

import pool from "@/lib/db" // Assuming pool is your database connection
import { revalidatePath } from "next/cache"
import {
  generateOTP,
  storeOTP,
  verifyOTP,
  createSession,
  verifySession,
  deleteSession,
  hashPassword,
  comparePassword,
} from "./auth" // Import hashPassword and comparePassword
import { sendOTPEmail } from "./emailSender" // Assuming this file exists and works as expected

// Define the ActionResponse type for consistent feedback
export type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  redirectPath?: string
  otpToken?: string // Added for OTP flow
  email?: string // Added for OTP flow
  data?: User | Report // Added to return the created/updated object
}

// Define User and Report types based on your schema
export type User = {
  id: number
  name: string
  email: string
  password?: string
  temporary_password?: string
  is_password_changed: boolean
  designation: string
  role: "Admin" | "User" | "Viewer"
  status: "active" | "inactive"
  assignedReports?: Report[]
}

export type Report = {
  id: number
  title: string
  description?: string
  power_bi_report_id: string
  power_bi_embed_url?: string
  type: string
  created_at?: string
}

// --- Authentication Actions ---
export async function loginUser(email: string, password: string) {
  try {
    // Find user
    const result = await pool.query<User>(
      `SELECT id, name, email, password, is_password_changed, status FROM users WHERE email = $1`,
      [email],
    )
    const user = result.rows[0];
    console.log(`user email-----`, user);
    if (!user) {
      return { success: false, error: "User not found" }
    }
    console.log("User found:", user) // For debugging
    const matchedPassword = comparePassword(user.password, password)
    // Verify password (in production, compare hashed passwords)
    if (!matchedPassword) {
      // Assuming plain text password comparison for now as per original code
      return { success: false, error: "Invalid credentials" }
    }
    // Generate and store OTP
    const otp = await generateOTP()
    console.log("Generated OTP:", otp) // For debugging
    await storeOTP(email, otp, "login")

    // ✅ FIXED: Await sendOTPEmail!
    const emailSent = await sendOTPEmail(user.email, user.name, otp, "login")
    if (!emailSent) {
      return { success: false, error: "Failed to send OTP email" }
    }

    return {
      success: true,
      message: "OTP sent to your email",
      data: { email, userId: user.id }, // Return email and userId for OTP verification
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function verifyLoginOTP(email: string, otp: string) {
  try {
    const isValid = await verifyOTP(email, otp, "login")
    if (!isValid) {
      return { success: false, error: "Invalid or expired OTP" }
    }

    // Find user and create session
    const result = await pool.query<User>(`SELECT id, email, role, is_password_changed FROM users WHERE email = $1`, [
      email,
    ])
    const user = result.rows[0]
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Create session and ensure it's properly stored
    await createSession(user.id, user.email, user.role, user.is_password_changed)

    // Additional delay to ensure session is fully established
    await new Promise((resolve) => setTimeout(resolve, 200))

    return {
      success: true,
      message: "Login successful",
      redirectPath: "/dashboard", // Redirect to dashboard on successful login
    }
  } catch (error) {
    console.error("OTP verification error:", error)
    return { success: false, error: "OTP verification failed" }
  }
}

export async function forgotPassword(email: string) {
  try {
    console.log(`Forgot password request for email: ${email}`)
    const result = await pool.query<User>(
      `SELECT id, name, email, is_password_changed, status
       FROM users
       WHERE email = $1 AND status = 'active'`,
      [email],
    )
    console.log(`result----`, result)
    const user = result.rows[0] || null
    if (!user) {
      return { success: false, error: "User not found or inactive" }
    }

    // Generate and store OTP
    const otp = await generateOTP()
    await storeOTP(email, otp, "forgot-password")

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, user.name, otp, "password reset")
    if (!emailSent) {
      return { success: false, error: "Failed to send reset email" }
    }

    return { success: true, message: "OTP sent to your email" }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { success: false, error: "Failed to send reset email" }
  }
}

export async function verifyResetOTP(email: string, otp: string) {
  try {
    const isValid = await verifyOTP(email, otp, "forgot-password")
    if (!isValid) {
      return { success: false, error: "Invalid or expired OTP" }
    }
    return { success: true, message: "OTP verified successfully" }
  } catch (error) {
    console.error("Reset OTP verification error:", error)
    return { success: false, error: "OTP verification failed" }
  }
}

export async function changePassword(email: string, newPassword: string) {
  try {
    // Check if user exists
    const result = await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
    if (result.rows.length === 0) {
      return { success: false, error: "User not found" }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and set is_password_changed = true
    await pool.query(
      `UPDATE users
       SET password = $1, is_password_changed = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE email = $2`,
      [hashedPassword, email],
    )
    return { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, error: "Failed to change password" }
  }
}

export async function resendOTP(email: string, flow: string) {
  try {
    // Fetch user from DB
    const result = await pool.query(`SELECT email, name FROM users WHERE email = $1`, [email])
    if (result.rows.length === 0) {
      return { success: false, error: "User not found" }
    }
    const user = result.rows[0]

    // Generate new OTP
    const otp = await generateOTP()
    await storeOTP(email, otp, flow)

    // Send OTP email
    const purpose = flow === "login" ? "login" : "password reset"
    const emailSent = await sendOTPEmail(user.email, user.name, otp, purpose)
    if (!emailSent) {
      return { success: false, error: "Failed to send OTP email" }
    }

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return { success: false, error: "Failed to resend OTP" }
  }
}

export async function logout(): Promise<ActionResponse> {
  await deleteSession()
  return { success: true, redirectPath: "/login" }
}

export async function getUserDetails(): Promise<User | null> {
  const session = await verifySession()
  if (!session || !session.userId) {
    console.warn("No session found while getting user details.")
    return null
  }
  const user_id = typeof session.userId === "object" ? session.userId.id : session.userId
  console.log(`🔍 Fetching user details for userId: ${user_id}`)
  try {
    const result = await pool.query<User>(
      `SELECT id, name, email, designation, role, status FROM users WHERE id = $1`,
      [user_id],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Error fetching user details:", error)
    if (error instanceof Error && error.message.includes("Connection terminated due to connection timeout")) {
      console.error("⚠️ Database connection timed out during getUserDetails.")
    }
    return null
  }
}

// Server action to fetch reports accessible by the user
export async function getUserReports() {
  const session = await verifySession()
  if (!session || !session.userId) {
    console.warn("No active session found.")
    return { accounting: [], manufacturing: [] }
  }
  const user_id = typeof session.userId === "object" ? session.userId.id : session.userId
  console.log(`✅ Session userId: ${user_id}`)
  try {
    const result = await pool.query<Report>(
      `SELECT r.id, r.title, r.power_bi_report_id, r.type, r.description, r.created_at
       FROM reports r
       JOIN user_report_access ura ON r.id = ura.report_id
       WHERE ura.user_id = $1
       ORDER BY r.title ASC`,
      [user_id],
    )
    const reports = result.rows
    const accountingReports = reports.filter((report) => report.type === "Accounting")
    const manufacturingReports = reports.filter((report) => report.type === "Manufacturing")
    return { accounting: accountingReports, manufacturing: manufacturingReports }
  } catch (error) {
    console.error("❌ Error fetching user reports:", error)
    if (error instanceof Error && error.message.includes("Connection terminated due to connection timeout")) {
      console.error("⚠️ Database connection timed out during getUserReports.")
    }
    return { accounting: [], manufacturing: [] }
  }
}

export async function getReportByPowerBiId(powerBiId: string): Promise<Report | null> {
  const session = await verifySession()
  if (!session) {
    return null
  }
  try {
    const user_id = typeof session.userId === "object" ? session.userId.id : session.userId
    console.log(`✅ Session userId: ${user_id}`)
    const result = await pool.query<Report>(
      `SELECT r.id, r.title, r.power_bi_report_id, r.type, r.description, r.power_bi_embed_url
       FROM reports r
       JOIN user_report_access ura ON r.id = ura.report_id
       WHERE ura.user_id = $1 AND r.power_bi_report_id = $2`,
      [user_id, powerBiId],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Error fetching report by Power BI ID:", error)
    if (error instanceof Error && error.message.includes("Connection terminated due to connection timeout")) {
      console.error("Database connection timed out during getReportByPowerBiId.")
    }
    return null
  }
}

// --- User Management Actions (RBAC) ---
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.designation, u.role, u.status, u.is_password_changed,
             r.id AS report_id, r.title, r.description, r.power_bi_report_id, r.type
      FROM users u
      LEFT JOIN user_report_access ur ON u.id = ur.user_id
      LEFT JOIN reports r ON ur.report_id = r.id
    `)
    const rows = result.rows
    const usersMap: Record<number, User> = {}

    rows.forEach((row) => {
      if (!usersMap[row.id]) {
        usersMap[row.id] = {
          id: row.id,
          name: row.name,
          email: row.email,
          designation: row.designation,
          role: row.role,
          status: row.status,
          is_password_changed: row.is_password_changed,
          assignedReports: [],
        }
      }
      if (row.report_id) {
        usersMap[row.id].assignedReports?.push({
          id: row.report_id,
          title: row.title,
          description: row.description,
          power_bi_report_id: row.power_bi_report_id,
          type: row.type,
        })
      }
    })
    return Object.values(usersMap)
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

export async function addUser(formData: FormData): Promise<ActionResponse> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  console.log(`password is coming----`, password);
  const designation = formData.get("designation") as string
  const role = formData.get("role") as string
  const assignedReportIds: number[] = JSON.parse(formData.get("assignedReports") as string)

  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." }
  }

  try {
    // ✅ Check if a user with this email already exists
    const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
    if (existingUser.rows.length > 0) {
      return { success: false, error: "User with this email already exists." }
    }

    // ✅ Proceed with user creation
    const hashed = await hashPassword(password)
    const insertUser = await pool.query<{
      id: number
      name: string
      email: string
      designation: string
      role: "Admin" | "User" | "Viewer"
      status: "active" | "inactive"
      is_password_changed: boolean
    }>(
      `INSERT INTO users (name, email, password, designation, role, status, is_password_changed)
       VALUES ($1, $2, $3, $4, $5, 'active', TRUE)
       RETURNING id, name, email, designation, role, status, is_password_changed`,
      [name, email, hashed, designation, role]
    )

    const newUserId = insertUser.rows[0].id
    const newUser: User = { ...insertUser.rows[0], assignedReports: [] }

    if (assignedReportIds.length > 0) {
      const valuesClause = assignedReportIds.map((_, i) => `($1, $${i + 2})`).join(", ")
      await pool.query(`INSERT INTO user_report_access (user_id, report_id) VALUES ${valuesClause}`, [
        newUserId,
        ...assignedReportIds,
      ])

      const assignedReportsDetails = await Promise.all(
        assignedReportIds.map(async (reportId) => {
          const reportResult = await pool.query<Report>(
            `SELECT id, title, description, power_bi_report_id, type FROM reports WHERE id = $1`,
            [reportId]
          )
          return reportResult.rows[0]
        })
      )
      newUser.assignedReports = assignedReportsDetails.filter(Boolean) as Report[]
    }

    revalidatePath("/rbac")

    return {
      success: true,
      message: "User added successfully!",
      data: newUser,
    }
  } catch (err: any) {
    console.error("Error adding user:", err)
    return { success: false, error: "Failed to add user." }
  }
}


export async function updateUser(userId: number, formData: FormData): Promise<ActionResponse> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const designation = formData.get("designation") as string
  const role = formData.get("role") as "Admin" | "User" | "Viewer"
  const resetPassword = formData.get("resetPassword") === "true"
  const assignedReportIds: number[] = JSON.parse(formData.get("assignedReports") as string)

  if (!name || !email || !role) {
    return { success: false, error: "Name, email, and role are required." }
  }

  try {
    const fields = ["name = $1", "email = $2", "designation = $3", "role = $4", "updated_at = CURRENT_TIMESTAMP"]
    const params: any[] = [name, email, designation, role]

    if (resetPassword) {
      const hashedPassword = await hashPassword("Password@123") // Updated default temporary password
      fields.push("password = $" + (params.length + 1))
      params.push(hashedPassword)
      fields.push("is_password_changed = $" + (params.length + 1))
      params.push(false) // Set to false to force password change on next login
    }

    params.push(userId)
    const updatedUserResult = await pool.query<User>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${params.length}
       RETURNING id, name, email, designation, role, status, is_password_changed`, // Return updated user fields
      params,
    )
    const updatedUser = updatedUserResult.rows[0]

    await pool.query("DELETE FROM user_report_access WHERE user_id = $1", [userId])
    if (assignedReportIds.length > 0) {
      const valuesClause = assignedReportIds.map((_, i) => `($1, $${i + 2})`).join(", ")
      await pool.query(`INSERT INTO user_report_access (user_id, report_id) VALUES ${valuesClause}`, [
        userId,
        ...assignedReportIds,
      ])
    }

    // Fetch assigned reports for the updated user to return a complete User object
    const assignedReportsResult = await pool.query<Report>(
      `SELECT r.id, r.title, r.description, r.power_bi_report_id, r.type
       FROM reports r
       JOIN user_report_access ura ON r.id = ura.report_id
       WHERE ura.user_id = $1`,
      [userId],
    )
    updatedUser.assignedReports = assignedReportsResult.rows

    revalidatePath("/rbac")
    return { success: true, message: "User updated successfully!", data: updatedUser }
  } catch (err: any) {
    console.error("Error updating user:", err)
    if (err.message.includes("duplicate key")) {
      return { success: false, error: "User with this email already exists." }
    }
    return { success: false, error: "Failed to update user." }
  }
}

export async function softDeleteUser(userId: number): Promise<ActionResponse> {
  try {
    await pool.query(`UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [userId])
    revalidatePath("/rbac")
    return { success: true, message: "User deactivated successfully!" }
  } catch (error) {
    console.error("Error deactivating user:", error)
    return { success: false, error: "Failed to deactivate user." }
  }
}

// --- Report Management Actions (RBAC) ---
export async function getAllReports(): Promise<Report[]> {
  try {
    const result = await pool.query<Report>(`SELECT * FROM reports ORDER BY title ASC`)
    return result.rows
  } catch (error) {
    console.error("Error fetching all reports:", error)
    return []
  }
}

export async function addReport(formData: FormData): Promise<ActionResponse> {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const powerBiId = formData.get("power_bi_report_id") as string
  const type = formData.get("type") as string

  if (!title || !powerBiId || !type) {
    return { success: false, error: "Title, Power BI ID and Type are required." }
  }

  try {
    const insertReport = await pool.query<Report>(
      `INSERT INTO reports (title, description, power_bi_report_id, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, power_bi_report_id, type, created_at`, // Return all fields for the new report
      [title, description, powerBiId, type],
    )
    const newReport = insertReport.rows[0]

    revalidatePath("/rbac")
    revalidatePath("/dashboard") // Revalidate dashboard to update report list
    return { success: true, message: "Report added successfully!", data: newReport }
  } catch (err: any) {
    console.error("Error adding report:", err)
    if (err.message.includes("duplicate key")) {
      return { success: false, error: "Report with this Power BI ID already exists." }
    }
    return { success: false, error: "Failed to add report." }
  }
}

export async function updateReport(reportId: number, formData: FormData): Promise<ActionResponse> {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const powerBiId = formData.get("power_bi_report_id") as string
  const type = formData.get("type") as string

  console.log(`report id of the coming update call----`, reportId)
  console.log(`This is the update call---`, {title, description, powerBiId, type})

  if (!title || !powerBiId || !type) {
    return { success: false, error: "Title, Power BI ID and Type are required." }
  }

  try {
    const updatedReportResult = await pool.query<Report>(
      `UPDATE reports SET
          title = $1,
          description = $2,
          power_bi_report_id = $3,
          type = $4
        WHERE id = $5
        RETURNING id, title, description, power_bi_report_id, type, created_at`, // Return updated report fields
      [title, description, powerBiId, type, reportId],
    )
    const updatedReport = updatedReportResult.rows[0]

    revalidatePath("/rbac")
    revalidatePath("/dashboard") // Revalidate dashboard to update report list
    revalidatePath(`/report/${powerBiId}`) // Revalidate specific report page
    return { success: true, message: "Report updated successfully!", data: updatedReport }
  } catch (err: any) {
    console.error("Error updating report:", err)
    if (err.message.includes("duplicate key")) {
      return { success: false, error: "Report with this Power BI ID already exists." }
    }
    return { success: false, error: "Failed to update report." }
  }
}

export async function deleteReport(reportId: number): Promise<ActionResponse> {
  try {
    await pool.query(`DELETE FROM user_report_access WHERE report_id = $1`, [reportId])
    await pool.query(`DELETE FROM reports WHERE id = $1`, [reportId])
    revalidatePath("/rbac")
    revalidatePath("/dashboard") // Revalidate dashboard to update report list
    return { success: true, message: "Report deleted successfully!" }
  } catch (error) {
    console.error("Error deleting report:", error)
    return { success: false, error: "Failed to delete report." }
  }
}

// --- User Report Access Actions (RBAC) ---
export type UserReportAccessOverview = {
  user: {
    id: number
    name: string
    email: string
    designation: string
    status: "active" | "inactive"
  }
  reportsCount: number
  reportTypes: string[]
}

export async function getAllUserReportAccess(): Promise<UserReportAccessOverview[]> {
  try {
    const result = await pool.query(`
      SELECT u.id AS user_id, u.name, u.email, u.designation, u.status,
             COUNT(ura.report_id) AS reports_count,
             ARRAY_AGG(DISTINCT r.type) AS report_types
      FROM users u
      LEFT JOIN user_report_access ura ON u.id = ura.user_id
      LEFT JOIN reports r ON ura.report_id = r.id
      GROUP BY u.id, u.name, u.email, u.designation, u.status
      ORDER BY u.name ASC
    `)
    return result.rows.map((r) => ({
      user: {
        id: r.user_id,
        name: r.name,
        email: r.email,
        designation: r.designation,
        status: r.status,
      },
      reportsCount: Number(r.reports_count),
      reportTypes: r.report_types ? r.report_types.filter(Boolean) : [],
    }))
  } catch (error) {
    console.error("Error fetching user report access:", error)
    return []
  }
}
