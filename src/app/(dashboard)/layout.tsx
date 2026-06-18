import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "@/components/SessionProvider"
import Sidebar from "@/components/Sidebar"

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
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            {/* Top padding for mobile menu button */}
            <div className="lg:hidden h-16" />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} Taekwondo Manager. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}

// Made with Bob
