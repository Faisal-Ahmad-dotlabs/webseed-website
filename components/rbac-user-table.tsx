"use client"

import { useState, useMemo } from "react"
import { Edit, Eye, UserPlus } from "lucide-react"
import Swal from "sweetalert2"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { UserFormClient } from "../app/dashboard/rbac/rbac-forms-client"
import { DeleteButtonClient } from "@/components/delete-button-client"
import type { User, Report } from "@/lib/actions"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function RbacUserTable({ initialUsers, initialReports }: { initialUsers: User[]; initialReports: Report[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentUsers, setCurrentUsers] = useState(initialUsers)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // You can adjust this number

  const filteredUsers = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return currentUsers?.filter(
      (user) =>
        user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user?.designation?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user?.role?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user?.status?.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [currentUsers, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  // const handleUserAddedOrUpdated = (user: User, action: "add" | "update") => {
  //   if (action === "add") {
  //     setCurrentUsers((prevUsers) => [...prevUsers, user].sort((a, b) => a.name.localeCompare(b.name)))
  //   } else if (action === "update") {
  //     setCurrentUsers((prevUsers) =>
  //       prevUsers.map((u) => (u.id === user.id ? user : u)).sort((a, b) => a.name.localeCompare(b.name)),
  //     )
  //   }
  // }
  const handleUserAddedOrUpdated = (user: User, action: "add" | "update") => {
  if (action === "add") {
    setCurrentUsers((prevUsers) => [...prevUsers, user].sort((a, b) => a.name.localeCompare(b.name)))

    // Show SweetAlert for add
    Swal.fire({
      icon: "success",
      title: "User Added",
      text: `${user.name} has been added successfully.`,
      confirmButtonColor: "#3085d6",
    })
  } else if (action === "update") {
    setCurrentUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? user : u)).sort((a, b) => a.name.localeCompare(b.name)),
    )

    // Show SweetAlert for update
    Swal.fire({
      icon: "success",
      title: "User Updated",
      text: `${user.name}'s details have been updated successfully.`,
      confirmButtonColor: "#3085d6",
    })
  }
}

  // const handleUserDeactivated = (deactivatedUserId: number) => {
  //   setCurrentUsers((prevUsers) =>
  //     prevUsers.map((user) => (user.id === deactivatedUserId ? { ...user, status: "inactive" } : user)),
  //   )
  // }
  const handleUserDeactivated = (deactivatedUserId: number) => {
  setCurrentUsers((prevUsers) =>
    prevUsers.map((user) =>
      user.id === deactivatedUserId ? { ...user, status: "inactive" } : user,
    ),
  )

  const deactivatedUser = currentUsers.find((user) => user.id === deactivatedUserId)
  if (deactivatedUser) {
    Swal.fire({
      icon: "success",
      title: "User Deactivated",
      text: `${deactivatedUser.name} has been deactivated successfully.`,
      confirmButtonColor: "#3085d6",
    })
  }
}

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setIsEditUserDialogOpen(true)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
            <DialogHeader className="bg-gray-700 p-4 rounded-t-lg">
              <DialogTitle className="text-blue-300">Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-400 mb-4">Fill in the details to add a new user.</p>
              <UserFormClient
                reports={initialReports}
                onSuccess={handleUserAddedOrUpdated}
                onClose={() => setIsAddUserDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-700 hover:bg-gray-700">
            <TableHead className="text-blue-300">Name</TableHead>
            <TableHead className="text-blue-300">Email</TableHead>
            <TableHead className="text-blue-300">Designation</TableHead>
            <TableHead className="text-blue-300">Role</TableHead>
            <TableHead className="text-blue-300">Status</TableHead>
            <TableHead className="text-right text-blue-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-700">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.designation}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-gray-700">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
                        <DialogHeader className="bg-gray-700 p-4 rounded-t-lg">
                          <DialogTitle className="text-blue-300">User Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 px-4">
                          <p>
                            <strong>Name:</strong> {user.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p>
                            <strong>Designation:</strong> {user.designation}
                          </p>
                          <p>
                            <strong>Role:</strong> {user.role}
                          </p>
                          <p>
                            <strong>Status:</strong> {user.status}
                          </p>
                          <p>
                            <strong>Assigned Reports:</strong>
                          </p>
                          <ul className="list-disc pl-5">
                            {user.assignedReports?.map((report) => (
                              <li key={report.id}>
                                {report.title} ({report.type})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isEditUserDialogOpen && editingUser?.id === user.id}
                      onOpenChange={setIsEditUserDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-400 hover:bg-gray-700"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
                        <DialogHeader className="bg-gray-700 p-4 rounded-t-lg">
                          <DialogTitle className="text-blue-300">Edit User</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <UserFormClient
                            user={editingUser}
                            reports={initialReports}
                            onSuccess={handleUserAddedOrUpdated}
                            onClose={() => setIsEditUserDialogOpen(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    {user.status === "active" && (
                      <DeleteButtonClient id={user.id} type="user" onSuccess={handleUserDeactivated} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                No users found.
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
