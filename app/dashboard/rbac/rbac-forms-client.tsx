"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { addUser, updateUser, addReport, updateReport } from "@/lib/actions"
import type { User, Report, ActionResponse } from "@/lib/actions" // Import ActionResponse

// Client component for Add/Edit User Form
export function UserFormClient({
  user,
  reports,
  onSuccess,
  onClose,
}: {
  user?: User
  reports: Report[]
  onSuccess: (item: User, action: "add" | "update") => void
  onClose: () => void
}) {
  const [selectedReports, setSelectedReports] = useState<number[]>(user?.assignedReports?.map((r) => r.id) || [])
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReportSelect = (reportId: number, checked: boolean) => {
    setSelectedReports((prev) => (checked ? [...prev, reportId] : prev.filter((id) => id !== reportId)))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.append("assignedReports", JSON.stringify(selectedReports))

    if (user && isResetPassword) {
      formData.append("resetPassword", "true")
    }

    let result
    if (user) {
      result = await updateUser(user.id, formData)
    } else {
      result = await addUser(formData)
    }

    setLoading(false)

    if (result.success) {
      toast({ title: "Success", description: result.message })
      onSuccess(result.data as User, user ? "update" : "add")
      onClose()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user?.name || ""}
            required
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            required
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="designation" className="text-right">Designation</Label>
          <Input
            id="designation"
            name="designation"
            defaultValue={user?.designation || ""}
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select name="role" defaultValue={user?.role || "User"}>
            <SelectTrigger className="col-span-3 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!user && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {user && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reset-password" className="text-right text-blue-300 font-bold">Reset Password</Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="reset-password"
                checked={isResetPassword}
                onCheckedChange={(checked) => setIsResetPassword(!!checked)}
                className="border-blue-400 data-[state=checked]:bg-blue-400 data-[state=checked]:text-white"
              />
              <label htmlFor="reset-password" className="text-sm font-medium leading-none">
                Reset to "password123"
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right">Assign Reports</Label>
          <ScrollArea className="col-span-3 h-40 rounded-md border border-gray-700 p-4 bg-gray-800">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`report-${report.id}`}
                  checked={selectedReports.includes(report.id)}
                  onCheckedChange={(checked) => handleReportSelect(report.id, !!checked)}
                  className="border-blue-400 data-[state=checked]:bg-blue-400 data-[state=checked]:text-white"
                />
                <label htmlFor={`report-${report.id}`} className="text-sm font-medium leading-none">
                  {report.title} ({report.type})
                </label>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? (user ? "Saving..." : "Adding...") : user ? "Save changes" : "Add User"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Client component for Add/Edit Report Form
export function ReportFormClient({
  report,
  onSuccess,
  onClose,
}: {
  report?: Report
  onSuccess: (item: Report, action: "add" | "update") => void
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    let result
    if (report) {
      result = await updateReport(report.id, formData)
    } else {
      result = await addReport(formData)
    }

    setLoading(false)

    if (result.success) {
      toast({ title: "Success", description: result.message })
      onSuccess(result.data as Report, report ? "update" : "add")
      onClose()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={report?.title || ""}
            required
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={report?.description || ""}
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="power_bi_report_id" className="text-right">Power BI Report ID</Label>
          <Input
            id="power_bi_report_id"
            name="power_bi_report_id"
            defaultValue={report?.power_bi_report_id || ""}
            required
            className="col-span-3 bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">Type</Label>
          <Select name="type" defaultValue={report?.type || "Accounting"}>
            <SelectTrigger className="col-span-3 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="Accounting">Accounting</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? (report ? "Saving..." : "Adding...") : report ? "Save changes" : "Add Report"}
        </Button>
      </div>
    </form>
  )
}
