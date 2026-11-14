"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StudentMonthlyAttendance from "@/components/attendance/StudentMonthlyAttendance"

export default function StudentAttendanceSummaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/attendance"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Resumen por alumno
        </h1>
      </div>

      <StudentMonthlyAttendance />
    </div>
  )
}
