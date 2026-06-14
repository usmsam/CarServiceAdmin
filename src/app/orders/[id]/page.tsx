"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Archive,
  ArrowLeft,
  Clock,
  Car,
  Image as ImageIcon,
  MapPinned,
  NotebookText,
  ReceiptText,
  ShieldCheck,
  Store,
  User as UserIcon,
  Wrench,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrdersService, Order, OrderServiceItem, OrderAuditEntry, OrderMediaItem } from "@/api/orders.service"

type RefEntity =
  | {
      _id?: string
      name?: string
      address?: string
      fullName?: string
      phone?: string
      brand?: string
      model?: string
      licensePlate?: string
      vin?: string
    }
  | string
  | null
  | undefined
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/api\/?$/, "")

const resolveMediaUrl = (fileId: string) => {
  if (!fileId) return null
  if (/^https?:\/\//i.test(fileId)) return fileId
  if (fileId.startsWith("/uploads/")) {
    return `${BACKEND_ORIGIN}${fileId}`
  }
  return null
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [media, setMedia] = useState<OrderMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)

  const loadOrder = useCallback(async () => {
    const [orderRes, mediaRes] = await Promise.all([
      OrdersService.getOrderById(id),
      OrdersService.getOrderMedia(id),
    ])

    return { order: orderRes, media: mediaRes }
  }, [id])

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const res = await loadOrder()
        if (active) {
          setOrder(res.order)
          setMedia(res.media)
        }
      } catch (error) {
        console.error("Failed to fetch order details", error)
        if (active) {
          setOrder(null)
          setMedia([])
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loadOrder])

  const handleArchive = async () => {
    if (!order || order.archivedAt) return
    if (!confirm("Архивировать этот заказ?")) return

    setArchiving(true)
    try {
      await OrdersService.archiveOrder(order._id)
      const res = await loadOrder()
      setOrder(res.order)
      setMedia(res.media)
    } catch (error) {
      console.error("Failed to archive order", error)
    } finally {
      setArchiving(false)
    }
  }

  const formatRef = (ref: RefEntity, fallback = "—") => {
    if (!ref) return fallback
    if (typeof ref === "string") return ref
    return ref.fullName || ref.name || ref.licensePlate || ref.model || fallback
  }

  const renderRefMeta = (ref: RefEntity) => {
    if (!ref || typeof ref === "string") return null
    const parts = [ref.phone, ref.address, ref.vin].filter(Boolean)
    if (!parts.length) return null
    return <div className="text-xs text-slate-500 mt-1">{parts.join(" • ")}</div>
  }

  const statusTone =
    order?.status === "DONE"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : order?.status === "OPEN"
        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
        : order?.status === "CLOSED"
          ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
          : "bg-amber-500/10 text-amber-500 border-amber-500/20"

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-500">
        Заказ не найден
      </div>
    )
  }

  const services = order.services || []
  const totalServices = services.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  )
  const photoAttachments = media.filter((item) => item.type === "PHOTO")
  const auditTrail = [...(order.auditTrail || [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      <div className="flex flex-col gap-4">
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
                Заказ #{order._id.slice(-6).toUpperCase()}
              </h1>
              <Badge className={statusTone}>{order.status}</Badge>
              {order.archivedAt && (
                <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                  Архив
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-xs md:text-sm mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Создан {new Date(order.createdAt).toLocaleString("ru-RU")}
              </span>
              <span className="flex items-center gap-1.5">
                <ReceiptText className="h-3 w-3" />
                Обновлён {new Date(order.updatedAt).toLocaleString("ru-RU")}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleArchive}
              disabled={archiving || !!order.archivedAt}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            >
              <Archive className="h-4 w-4 mr-2" />
              {order.archivedAt ? "Уже в архиве" : "Архивировать"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                Услуги и работы
              </h2>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Сумма услуг
                </div>
                <div className="text-xl font-black text-slate-900">
                  {totalServices.toLocaleString("ru-RU")} UZS
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {services.length > 0 ? (
                services.map((service: OrderServiceItem, idx: number) => (
                  <div
                    key={`${service.title}-${idx}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {service.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {service.price.toLocaleString("ru-RU")} UZS × {service.qty}
                          {service.serviceType ? ` • ${service.serviceType}` : ""}
                        </div>
                        {service.attributes?.length ? (
                          <div className="mt-3 grid gap-2">
                            {service.attributes.map((attr) => (
                              <div
                                key={`${service.title}-${attr.key}`}
                                className="text-xs text-slate-600 flex flex-wrap gap-1"
                              >
                                <span className="font-semibold text-slate-800">
                                  {attr.label}:
                                </span>
                                <span>{attr.value}</span>
                                <span className="text-slate-400">
                                  ({attr.source || "CUSTOM"})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-lg font-black text-slate-900">
                          {(service.price * service.qty).toLocaleString("ru-RU")} UZS
                        </div>
                        {service.catalogId ? (
                          <div className="text-xs text-slate-400 mt-1">
                            Каталог: {formatRef(service.catalogId)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm italic">
                  В заказе нет услуг
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <NotebookText className="h-4 w-4 text-blue-500" />
                Внутренние заметки
              </h3>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {order.note || "Заметок нет"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                Архив и аудит
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div>Архив: {order.archivedAt ? new Date(order.archivedAt).toLocaleString("ru-RU") : "Нет"}</div>
                <div>Архивировал: {formatRef(order.archivedBy)}</div>
                <div>Создал: {formatRef(order.createdBy)}</div>
                <div>Обновил: {formatRef(order.updatedBy)}</div>
                <div>Booking ID: {formatRef(order.bookingId)}</div>
                <div>Пробег: {order.mileage != null ? `${order.mileage.toLocaleString("ru-RU")} км` : "Не указан"}</div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Фото вложений
              </h2>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Фото
                </div>
                <div className="text-xl font-black text-slate-900">
                  {photoAttachments.length}
                </div>
              </div>
            </div>

            {photoAttachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {photoAttachments.map((attachment) => {
                  const previewUrl = resolveMediaUrl(attachment.fileId)

                  return (
                    <div
                      key={attachment._id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      {previewUrl ? (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block aspect-[4/3] bg-slate-100"
                          title="Открыть оригинал"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt={attachment.comment || "Фото вложения"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 px-4 text-center text-sm text-slate-500">
                          Предпросмотр недоступен
                        </div>
                      )}

                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {new Date(attachment.timestamp).toLocaleString("ru-RU")}
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            PHOTO
                          </Badge>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {attachment.comment || "Без комментария"}
                        </div>
                        {!previewUrl ? (
                          <div className="text-xs text-slate-500">
                            Предпросмотр недоступен
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm italic">
                Фото вложений отсутствуют
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-500" />
              СТО
            </h3>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900">{formatRef(order.stationId, "Не указано")}</div>
              {renderRefMeta(order.stationId)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 text-orange-500" />
              Автомобиль
            </h3>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900">{formatRef(order.vehicleId, "Не указано")}</div>
              {renderRefMeta(order.vehicleId)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-purple-500" />
              Клиент
            </h3>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">{formatRef(order.clientId, "Не указано")}</div>
              {renderRefMeta(order.clientId)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-500" />
              Мастер
            </h3>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">{formatRef(order.masterId, "Не назначен")}</div>
              {renderRefMeta(order.masterId)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-slate-500" />
              Статистика
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <span>Сумма заказа</span>
                <span className="font-semibold">{order.totalAmount.toLocaleString("ru-RU")} UZS</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Статус</span>
                <span className="font-semibold">{order.status}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Услуг</span>
                <span className="font-semibold">{services.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          <ReceiptText className="h-5 w-5 text-blue-500" />
          История изменений
        </h3>

        <div className="space-y-3">
          {auditTrail.length > 0 ? (
            auditTrail.map((entry: OrderAuditEntry, index: number) => (
              <div
                key={`${entry.action}-${entry.at}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="font-semibold text-slate-900">
                    {entry.action}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(entry.at).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Исполнитель: {formatRef(entry.actorId)}
                </div>
                {entry.details && Object.keys(entry.details).length > 0 ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-slate-600 border border-slate-200">
                    {JSON.stringify(entry.details, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              История изменений отсутствует
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
