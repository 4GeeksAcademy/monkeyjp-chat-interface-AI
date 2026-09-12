import { Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Metrics = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: string
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function MetricsSidebar({
  metrics,
  onClear,
}: {
  metrics: Metrics
  onClear: () => void
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-border bg-sidebar p-4 md:w-72 md:border-l">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Métricas</h2>
      </div>

      <div className="flex flex-col gap-2">
        <MetricRow label="Prompt Tokens" value={metrics.promptTokens} />
        <MetricRow label="Completion Tokens" value={metrics.completionTokens} />
        <MetricRow label="Total Tokens" value={metrics.totalTokens} />
        <MetricRow label="Model" value={metrics.model} />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        className="mt-auto w-full gap-2 text-destructive hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Borrar conversación
      </Button>
    </aside>
  )
}
