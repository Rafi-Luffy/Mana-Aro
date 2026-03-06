"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import Link from "next/link"

export function ReportWidget() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Generate Reports</CardTitle>
        </div>
        <CardDescription>Create and export patient and clinic reports</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Generate comprehensive reports for patients and clinics. Export as PDF or CSV for easy sharing and
          documentation.
        </p>
        <Link href="/reports">
          <Button className="w-full">Access Reports</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
