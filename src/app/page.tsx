"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Car, CreditCard, ShoppingBag } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      icon: ShoppingBag,
      description: "+20.1% from last month",
    },
    {
      title: "Revenue",
      value: "$45,231.89",
      icon: CreditCard,
      description: "+15% from last month",
    },
    {
      title: "Active Vehicles",
      value: "573",
      icon: Car,
      description: "+201 since last week",
    },
    {
      title: "Active Masters",
      value: "24",
      icon: Activity,
      description: "Currently working",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-neutral-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Placeholders or other widgets can go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px] flex items-center justify-center text-neutral-500 border-t border-neutral-800">
            [Chart Area Placeholder]
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-neutral-500 border-t border-neutral-800">
            [Recent Orders List]
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
