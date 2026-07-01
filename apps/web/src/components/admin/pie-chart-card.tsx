import { ChartCard, type ChartCardProps } from '@/components/admin/chart-card';
import { PieChart, type PieSlice } from '@/components/admin/charts/pie-chart';

export interface PieChartCardProps extends Omit<ChartCardProps, 'children'> {
  data: PieSlice[];
  emptyLabel?: string;
}

export function PieChartCard({ data, emptyLabel = 'Henüz veri yok', ...rest }: PieChartCardProps) {
  return (
    <ChartCard {...rest}>
      {data.length === 0 ? (
        <p className="rounded-md border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
          {emptyLabel}
        </p>
      ) : (
        <PieChart data={data} />
      )}
    </ChartCard>
  );
}
