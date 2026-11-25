import LoginForm from "@/components/auth/LoginForm"
import { GuestOnly } from "@/components/auth/guest-only"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Login – Rentora" }

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  )
}
