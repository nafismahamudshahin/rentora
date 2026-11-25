import RegisterForm from "@/components/auth/SignUpForm"
import { GuestOnly } from "@/components/auth/guest-only"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Register – Rentora" }

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  )
}
