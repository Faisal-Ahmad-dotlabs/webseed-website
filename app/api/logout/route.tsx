import { deleteSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  await deleteSession()
  return NextResponse.json({ message: "Logged out" }, { status: 200 })
}
