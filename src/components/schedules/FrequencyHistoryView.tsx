"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { History, TrendingUp } from "lucide-react"

interface FrequencyHistoryRecord {
  id: string
  weeklyFrequency: number
  monthlyFee: number | null
  effectiveFrom: string
  effectiveTo: string | null
  isCurrent: boolean
}

interface FrequencyHistoryViewProps {
  enrollmentId: string
}

export function FrequencyHistoryView({
  enrollmentId,
}: FrequencyHistoryViewProps) {
  const [data, setData] = useState<{ history: FrequencyHistoryRecord[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(
          `/api/student-schedules/${enrollmentId}/frequency-history`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch frequency history")
        }

        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [enrollmentId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Frecuencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Frecuencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Error al cargar el historial
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.history || data.history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Frecuencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay historial de cambios de frecuencia
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          Historial de Frecuencias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.history.map((record, index) => (
            <div
              key={record.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                record.isCurrent
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    record.isCurrent
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                {index < data.history.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={record.isCurrent ? "default" : "secondary"}
                    className="font-semibold"
                  >
                    {record.weeklyFrequency}x/semana
                  </Badge>
                  {record.isCurrent && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Actual
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>
                    <strong>Desde:</strong>{" "}
                    {format(new Date(record.effectiveFrom), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                  {record.effectiveTo && (
                    <p>
                      <strong>Hasta:</strong>{" "}
                      {format(new Date(record.effectiveTo), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </p>
                  )}
                  {!record.effectiveTo && (
                    <p className="text-green-600">
                      <strong>Hasta:</strong> Presente
                    </p>
                  )}
                  {record.monthlyFee && (
                    <p className="text-blue-600 font-medium">
                      Cuota personalizada: ${record.monthlyFee.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Made with Bob
