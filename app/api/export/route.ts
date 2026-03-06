import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { format, data } = await request.json()

    if (format === "csv") {
      const csv = data
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="patients-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    if (format === "json") {
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
