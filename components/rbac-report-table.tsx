"use client"

import { useState, useMemo } from "react"
import { Edit, FilePlus } from "lucide-react"
import Swal from "sweetalert2" // Ensure this is imported at the top
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ReportFormClient } from "../app/dashboard/rbac/rbac-forms-client"
import { DeleteButtonClient } from "@/components/delete-button-client"
import type { Report } from "@/lib/actions"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function RbacReportTable({ initialReports }: { initialReports: Report[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentReports, setCurrentReports] = useState(initialReports)
  const [isAddReportDialogOpen, setIsAddReportDialogOpen] = useState(false)
  const [isEditReportDialogOpen, setIsEditReportDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | undefined>(undefined)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // You can adjust this number

  const filteredReports = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return currentReports.filter(
      (report) =>
        report?.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        report?.type.toLowerCase().includes(lowerCaseSearchTerm) ||
        report?.power_bi_report_id.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [currentReports, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem)

  const handleReportAddedOrUpdated = (report: Report, action: "add" | "update") => {
    if (action === "add") {
      setCurrentReports((prevReports) =>
        [...prevReports, report].sort((a, b) => a.title.localeCompare(b.title)),
      )

      Swal.fire({
        icon: "success",
        title: "Report Added",
        text: `"${report.title}" has been added successfully.`,
        confirmButtonColor: "#3085d6",
      })
    } else if (action === "update") {
      setCurrentReports((prevReports) =>
        prevReports.map((r) => (r.id === report.id ? report : r)).sort((a, b) => a.title.localeCompare(b.title)),
      )

      Swal.fire({
        icon: "success",
        title: "Report Updated",
        text: `"${report.title}" has been updated successfully.`,
        confirmButtonColor: "#3085d6",
      })
    }
  }

  const handleReportDeleted = (deletedReportId: number) => {
    const deletedReport = currentReports.find((r) => r.id === deletedReportId)

    setCurrentReports((prevReports) =>
      prevReports.filter((report) => report.id !== deletedReportId),
    )

    if (deletedReport) {
      Swal.fire({
        icon: "success",
        title: "Report Deleted",
        text: `"${deletedReport.title}" has been deleted successfully.`,
        confirmButtonColor: "#3085d6",
      })
    }
  }

  const openEditDialog = (report: Report) => {
    setEditingReport(report)
    setIsEditReportDialogOpen(true)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />
        <Dialog open={isAddReportDialogOpen} onOpenChange={setIsAddReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <FilePlus className="mr-2 h-4 w-4" /> Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
            <DialogHeader className="bg-gray-700 p-4 rounded-t-lg">
              <DialogTitle className="text-blue-300">Add New Report</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-400 mb-4">Fill in the details to add a new report.</p>
              <ReportFormClient
                onSuccess={handleReportAddedOrUpdated}
                onClose={() => setIsAddReportDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-700 hover:bg-gray-700">
            <TableHead className="text-blue-300">Title</TableHead>
            <TableHead className="text-blue-300">Type</TableHead>
            <TableHead className="text-blue-300">Power BI ID</TableHead>
            <TableHead className="text-right text-blue-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedReports.length > 0 ? (
            paginatedReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-700">
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.power_bi_report_id}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={isEditReportDialogOpen && editingReport?.id === report.id}
                      onOpenChange={setIsEditReportDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-400 hover:bg-gray-700"
                          onClick={() => openEditDialog(report)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
                        <DialogHeader className="bg-gray-700 p-4 rounded-t-lg">
                          <DialogTitle className="text-blue-300">Edit Report</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <ReportFormClient
                            report={editingReport}
                            onSuccess={handleReportAddedOrUpdated}
                            onClose={() => setIsEditReportDialogOpen(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DeleteButtonClient id={report.id} type="report" onSuccess={handleReportDeleted} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                No reports found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
