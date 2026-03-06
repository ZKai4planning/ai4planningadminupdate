"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import axiosInstance from "@/app/lib/axiosinstance"

export function ClientLogin() {
  const router = useRouter()
  const [step, setStep] = useState<"REQUEST_OTP" | "VERIFY_OTP">("REQUEST_OTP")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [otpError, setOtpError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "string") return error
    if (error && typeof error === "object") {
      const err = error as {
        response?: { data?: { message?: string; error?: string; detail?: string }; status?: number }
        message?: string
      }
      const apiMessage =
        err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail
      if (apiMessage) return apiMessage
      if (err.message) return err.message
      if (err.response?.status) return `Login failed (${err.response.status}).`
    }
    return "Login failed. Please try again."
  }

  const isOtpExpiredError = (error: unknown) => {
    if (!error || typeof error !== "object") return false
    const err = error as {
      response?: { data?: { message?: string; error?: string; detail?: string } }
      message?: string
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.response?.data?.detail ||
      err.message ||
      ""
    return message.toLowerCase().includes("expired")
  }

  const handleResendOtp = async () => {
    if (isResending || isSubmitting) return false
    const email = identifier.trim()
    if (!email) {
      setErrorMessage("Email is required to resend OTP.")
      return false
    }

    setIsResending(true)
    setErrorMessage("")
    try {
      await axiosInstance.post("/admin/auth/resend-otp", { email })
      setOtp(Array(6).fill(""))
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return false
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return
    setErrorMessage("")
    setOtpError("")

    const email = identifier.trim()
    if (!email || !password) {
      setErrorMessage("Email and password are required.")
      return
    }

    if (step === "REQUEST_OTP") {
      setIsSubmitting(true)
      try {
        await axiosInstance.post("/admin/auth/login", {
          email,
          password,
        })
        setStep("VERIFY_OTP")
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post("/admin/auth/verify-otp", {
        email: email,
        otp: otpCode,
      })

      const data = response?.data ?? {}
      const token =
        data?.token || data?.accessToken || data?.jwt || data?.data?.token || ""
      const authPayload = {
        token,
        email,
        user: data?.user || data?.data?.user,
      }

      sessionStorage.setItem("currentAuth", JSON.stringify(authPayload))
      localStorage.setItem("currentAuth", JSON.stringify(authPayload))
      document.cookie = "admin_auth=1; path=/; samesite=lax"
      router.push("/admin")
      router.refresh()
    } catch (error) {
      if (isOtpExpiredError(error)) {
        const resent = await handleResendOtp()
        setOtpError(
          resent
            ? "OTP expired. A new OTP has been sent."
            : "OTP expired. Please resend OTP."
        )
      } else {
        setErrorMessage(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {step === "REQUEST_OTP" && "Enter your email and password, then continue."}
          {step === "VERIFY_OTP" && `Enter the OTP sent to ${identifier}.`}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <button
          type="button"
          disabled
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-4">
          <hr className="flex-1 border-slate-300 dark:border-slate-700" />
        </div>

        <div className="group">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            Email
          </label>
          <input
            type="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isSubmitting || step === "VERIFY_OTP"}
            placeholder="you@example.com"
            className={`
              w-full h-14 px-4 rounded-lg
              bg-slate-50 dark:bg-slate-800/50
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              focus:ring-2 focus:ring-primary focus:border-primary
              transition-all
              ${isSubmitting || step === "VERIFY_OTP" ? "opacity-70 cursor-not-allowed" : ""}
            `}
          />
        </div>

        <div className="group">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isSubmitting || step === "VERIFY_OTP"}
              className={`
                w-full h-14 px-4 pr-12 rounded-lg
                bg-slate-50 dark:bg-slate-800/50
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-white
                focus:ring-2 focus:ring-primary focus:border-primary
                transition-all
                ${isSubmitting || step === "VERIFY_OTP" ? "opacity-70 cursor-not-allowed" : ""}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {step === "VERIFY_OTP" && (
          <div className="group">
            <div className="flex items-end justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                6-Digit OTP
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || isSubmitting}
                className="text-[10px] text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
            <div className="flex items-center justify-center gap-1">
              {otp.map((digit, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/, "")
                      if (!value) return

                      const newOtp = [...otp]
                      newOtp[index] = value
                      setOtp(newOtp)

                      if (index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...otp]
                        newOtp[index] = ""
                        setOtp(newOtp)

                        if (index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus()
                        }
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6)
                      if (pasted.length === 6) {
                        setOtp(pasted.split(""))
                      }
                    }}
                    disabled={isSubmitting || isResending}
                    className="
                      w-10 h-10 text-center text-lg font-semibold
                      bg-slate-50 dark:bg-slate-800/50
                      border border-slate-200 dark:border-slate-700
                      rounded-lg text-slate-900 dark:text-white
                      focus:ring-2 focus:ring-primary focus:border-primary
                      transition-all
                    "
                  />
                  {index < otp.length - 1 && (
                    <span className="mx-1 text-slate-400 font-bold select-none">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>
            {otpError && (
              <p className="mt-2 text-xs font-medium text-red-600">{otpError}</p>
            )}
          </div>
        )}

        {errorMessage && (
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full bg-primary text-white font-bold py-3 rounded
            transition-all duration-300 active:scale-95
            rotate-[-3deg] hover:rotate-0
          "
        >
          {step === "REQUEST_OTP"
            ? "Continue"
            : isSubmitting
              ? "Signing In..."
              : "Sign In"}
        </button>
      </form>
    </div>
  )
}
