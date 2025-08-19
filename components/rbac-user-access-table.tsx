"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import type { UserReportAccessOverview } from "@/lib/actions"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function RbacUserAccessTable({
  initialUserReportAccess,
}: {
  initialUserReportAccess: UserReportAccessOverview[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // You can adjust this number

  const filteredAccess = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return initialUserReportAccess.filter(
      (item) =>
        item.user.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.user.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.user.designation?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.user.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.reportTypes.some((type) => type.toLowerCase().includes(lowerCaseSearchTerm)),
    )
  }, [initialUserReportAccess, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAccess.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedAccess = filteredAccess.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search user access..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-700 hover:bg-gray-700">
            <TableHead className="text-blue-300">User</TableHead>
            <TableHead className="text-blue-300">Reports Count</TableHead>
            <TableHead className="text-blue-300">Report Types</TableHead>
            <TableHead className="text-blue-300">Status</TableHead>
            <TableHead className="text-blue-300">Designation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAccess.length > 0 ? (
            paginatedAccess.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-700">
                <TableCell className="font-medium">{item.user.name || item.user.email}</TableCell>
                <TableCell>{item.reportsCount}</TableCell>
                <TableCell>{item.reportTypes.join(", ")}</TableCell>
                <TableCell>{item.user.status}</TableCell>
                <TableCell>{item.user.designation}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                No user report access data found.
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
