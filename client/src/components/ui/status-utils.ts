export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

export const getStatusBadgeVariant = (status?: string): BadgeVariant =>
  status === 'COMPLETED'
    ? 'success'
    : status === 'CANCELLED'
    ? 'destructive'
    : status === 'SCHEDULED'
    ? 'warning'
    : 'outline';


