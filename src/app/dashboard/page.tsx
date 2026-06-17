import { redirect } from "next/navigation"

export default function DashboardRedirect() {
  // Redirect /dashboard to root where the actual dashboard is
  redirect("/")
}

// Made with Bob