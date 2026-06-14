"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CarFront, CalendarClock, Fingerprint, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Vehicle, VehiclesService } from "@/api/vehicles.service"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  const loadVehicle = useCallback(async () => VehiclesService.getVehicleById(id), [id])

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const res = await loadVehicle()
        if (active) setVehicle(res)
      } catch (error) {
        console.error("Failed to fetch vehicle details", error)
        if (active) setVehicle(null)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loadVehicle])

  const formatOwner = (owner: Vehicle["ownerId"], fallback = "—") => {
    if (!owner) return fallback
    if (typeof owner === "string") return owner
    return owner.fullName || owner.name || owner._id || fallback
  }

  const formatOwnerMeta = (owner: Vehicle["ownerId"]) => {
    if (!owner || typeof owner === "string") return null
    const parts = [owner.phone, owner._id].filter(Boolean)
    if (!parts.length) return null
    return <div className="text-xs text-slate-500 mt-1">{parts.join(" • ")}</div>
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!vehicle) {
    return <div className="text-center py-20 text-slate-500">Автомобиль не найден</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-10"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-100 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight truncate">
              {vehicle.licensePlate.toUpperCase()}
            </h1>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              Vehicle
            </Badge>
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              Создан {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString("ru-RU") : "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              Обновлён {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleString("ru-RU") : "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
              <CarFront className="h-5 w-5 text-blue-500" />
              Основные данные
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Марка</div>
                <div className="font-semibold text-slate-900">{vehicle.brand}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Модель</div>
                <div className="font-semibold text-slate-900">{vehicle.model}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Госномер</div>
                <div className="font-semibold text-slate-900">{vehicle.licensePlate.toUpperCase()}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">VIN</div>
                <div className="font-semibold text-slate-900">{vehicle.vin || "—"}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-purple-500" />
              Владелец
            </h3>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">{formatOwner(vehicle.ownerId)}</div>
              {formatOwnerMeta(vehicle.ownerId)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-emerald-500" />
              Системный ID
            </h3>
            <div className="text-sm font-mono text-slate-700 break-all">{vehicle._id}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
