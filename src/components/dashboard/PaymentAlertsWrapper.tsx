"use client"

import { useState } from "react"
import { PaymentAlerts } from "./PaymentAlerts"
import { PaymentAlert } from "@/services/dashboardService"

interface PaymentAlertsWrapperProps {
  initialAlerts: PaymentAlert[]
}

export function PaymentAlertsWrapper({ initialAlerts }: PaymentAlertsWrapperProps) {
  const [alerts, setAlerts] = useState<PaymentAlert[]>(initialAlerts)
  const [loading, setLoading] = useState(false)

  const refreshAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/payment-alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error refreshing payment alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PaymentAlerts 
      alerts={alerts} 
      onPaymentSuccess={refreshAlerts}
    />
  )
}

// Made with Bob