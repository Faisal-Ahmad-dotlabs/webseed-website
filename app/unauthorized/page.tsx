// "use client"

// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ShieldOff } from "lucide-react" // Importing an icon for visual appeal

// export default function Unauthorized() {
//   const router = useRouter()

//   return (
//     <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 text-center">
//       <div className="mb-8 flex flex-col items-center">
//         <ShieldOff className="h-24 w-24 text-red-500 mb-6 animate-pulse" /> {/* Added an icon */}
//         <h1 className="text-6xl font-extrabold text-red-500 mb-4 drop-shadow-lg">401</h1>
//         <h2 className="text-3xl font-bold text-gray-100 mb-4">Unauthorized Access</h2>
//         <p className="max-w-md text-lg text-gray-300 mb-8 leading-relaxed">
//           You don't have access for this action. Please contact your administrator for assistance. We apologize for any
//           inconvenience.
//         </p>
//       </div>
//       <div className="flex flex-col sm:flex-row gap-4">
//         <Button
//           onClick={() => router.back()}
//           className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
//         >
//           Go Back
//         </Button>
//         <Link href="/dashboard" passHref>
//           <Button
//             variant="outline"
//             className="px-8 py-3 text-lg bg-transparent border-2 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
//           >
//             Go to Dashboard
//           </Button>
//         </Link>
//       </div>
//     </div>
//   )
// }

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldOff } from "lucide-react"

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-white p-4 text-center">
      <div className="relative mb-8">
        <ShieldOff className="h-24 w-24 text-red-500 opacity-70 animate-pulse" />
        <h1 className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-red-600 drop-shadow-lg">
          401
        </h1>
      </div>
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Unauthorized Access</h2>
      <p className="text-lg text-gray-300 max-w-md mb-8">
        You do not have access for this action. Please contact your administrator for assistance.
        <br />
        <span className="text-sm text-gray-400 mt-2 block">Sorry for the inconvenience.</span>
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        >
          Go Back
        </Button>
        <Link href="/dashboard" passHref>
          <Button
            variant="outline"
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 shadow-lg transition-all duration-200 hover:scale-105"
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
