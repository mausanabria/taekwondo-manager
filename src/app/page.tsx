import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { requireAuth } from "@/lib/auth"
import { dashboardService } from "@/services/dashboardService"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { StudentsByBelt } from "@/components/dashboard/StudentsByBelt"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { PaymentAlerts } from "@/components/dashboard/PaymentAlerts"
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses"
import { RecentActivity } from "@/components/dashboard/RecentActivity"

export default async function Home() {
  const session = await requireAuth()
  const schoolId = session.user.schoolId

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No hay escuela asociada
        </h1>
        <p className="text-gray-600">
          Por favor, contacta al administrador para configurar tu escuela.
        </p>
      </div>
    )
  }

  // Fetch all dashboard data
  const [stats, recentActivity, upcomingClasses, paymentAlerts, attendanceTrend] =
    await Promise.all([
      dashboardService.getDashboardStats(schoolId),
      dashboardService.getRecentActivity(schoolId, 10),
      dashboardService.getUpcomingClasses(schoolId),
      dashboardService.getPaymentAlerts(schoolId, 5),
      dashboardService.getAttendanceTrend(schoolId, 7)
    ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Resumen general de tu escuela de Taekwondo
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Stats */}
      <DashboardStats stats={stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <UpcomingClasses classes={upcomingClasses} />
          <StudentsByBelt distribution={stats.studentsByBelt} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <PaymentAlerts alerts={paymentAlerts} />
          <RecentActivity activities={recentActivity} />
        </div>
      </div>

      {/* Full Width Chart */}
      <AttendanceChart trends={attendanceTrend} />

      {/* Today's Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Resumen de Hoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{stats.todayAttendances}</div>
            <div className="text-blue-100">Asistencias Registradas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{stats.todayPayments}</div>
            <div className="text-blue-100">Pagos Recibidos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {upcomingClasses.filter(c => c.dayOfWeek === new Date().getDay()).length}
            </div>
            <div className="text-blue-100">Clases de Hoy</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
