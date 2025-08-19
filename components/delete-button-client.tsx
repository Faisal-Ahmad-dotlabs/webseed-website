"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { softDeleteUser, deleteReport } from "@/lib/actions" // Import specific actions
import type { ActionResponse } from "@/lib/actions"

interface DeleteButtonClientProps {
  id: number
  type: "user" | "report"
  onSuccess: (id: number) => void // Callback to update parent state
}

export function DeleteButtonClient({ id, type, onSuccess }: DeleteButtonClientProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    let result: ActionResponse
    if (type === "user") {
      result = await softDeleteUser(id)
    } else {
      result = await deleteReport(id)
    }

    if (result.success) {
      toast({ title: "Success", description: result.message })
      onSuccess(id) // Call the success callback to update parent state
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-gray-700" disabled={isPending}>
          {isPending ? (
            <span className="animate-spin">⚙️</span> // Simple spinner
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 text-white border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-blue-300">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will{" "}
            {type === "user" ? "deactivate the user account" : "permanently delete the report"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(handleDelete)}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
