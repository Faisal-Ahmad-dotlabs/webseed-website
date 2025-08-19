"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { verifyLoginOTP, verifyResetOTP, resendOTP } from "@/lib/actions"

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [userEmail, setUserEmail] = useState("")
  const [flow, setFlow] = useState<"login" | "forgot-password">("login")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get user data from session storage
    const tempUser = sessionStorage.getItem("tempUser")
    if (!tempUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(tempUser)
    setUserEmail(userData.email)
    setFlow(userData.flow || "login")

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result =
        flow === "login" ? await verifyLoginOTP(userEmail, otpString) : await verifyResetOTP(userEmail, otpString)

      if (result.success) {
        // Clear temporary data
        sessionStorage.removeItem("tempUser")

        if (flow === "login") {
          setIsRedirecting(true)
          setSuccess("Login successful! Redirecting to dashboard...")

          // Wait a bit longer to ensure session is fully established
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Use replace to avoid back button issues
          router.replace("/dashboard")
        } else {
          // Redirect to change password
          sessionStorage.setItem("resetUser", JSON.stringify({ email: userEmail }))
          router.push("/change-password")
        }
      } else {
        setError(result.error || "Invalid OTP")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const result = await resendOTP(userEmail, flow)

      if (result.success) {
        setSuccess("OTP sent successfully!")
        setTimeLeft(300) // Reset timer
        setOtp(["", "", "", "", "", ""]) // Clear OTP inputs
      } else {
        setError(result.error || "Failed to resend OTP")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 px-4">
        <Card className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">WS</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">Verify OTP</CardTitle>
            <CardDescription className="text-center text-gray-200">Enter the 6-digit code sent to {userEmail}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    disabled={isLoading || isRedirecting}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Time remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
                </p>

                {timeLeft > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isResending || isLoading || isRedirecting}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isResending || isLoading || isRedirecting}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
                {isLoading || isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRedirecting ? "Redirecting..." : "Verifying..."}
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
