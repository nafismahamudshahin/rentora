import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login – Rentora" };

export default function LoginPage() {
    return <LoginForm />;
}