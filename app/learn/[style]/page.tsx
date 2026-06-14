import { notFound } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StagePath } from "@/components/dashboard/stage-path"
import { STYLE_ORDER, type StyleKey } from "@/lib/learning-styles"

export function generateStaticParams() {
  return STYLE_ORDER.map((style) => ({ style }))
}

export default async function StyleLearnPage({
  params,
}: {
  params: Promise<{ style: string }>
}) {
  const { style } = await params
  if (!STYLE_ORDER.includes(style as StyleKey)) {
    notFound()
  }
  return (
    <DashboardShell activeItem={style as StyleKey}>
      <StagePath style={style as StyleKey} />
    </DashboardShell>
  )
}
