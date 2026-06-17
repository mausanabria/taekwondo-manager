import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "@/components/SessionProvider"
import DashboardNav from "@/components/DashboardNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="container mx-auto px-4 py-4">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Taekwondo Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </SessionProvider>
  )
}

// Made with Bob
