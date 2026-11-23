import RegisterForm from "@/components/auth/SignUpForm";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Register – Rentora" };

export default function RegisterPage() {
  return <RegisterForm />;
}