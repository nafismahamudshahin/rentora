// app/(site)/layout.tsx  (public pages: Navbar + Footer)
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/footer"

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar />
            {children}
            <Footer />
        </div>
    )
}