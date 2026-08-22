/**
 * Order & Payment State Machine
 * Strict state graph enforcement for Plug KE transactions
 */

export type OrderState =
  | 'pending'
  | 'payment_initiated'
  | 'payment_confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'buyer_inspection'
  | 'completed'
  | 'refunded'
  | 'cancelled'
  | 'disputed';

export const VALID_ORDER_TRANSITIONS: Record<OrderState, OrderState[]> = {
  pending: ['payment_initiated', 'payment_confirmed', 'cancelled'],
  payment_initiated: ['payment_confirmed', 'pending', 'cancelled'],
  payment_confirmed: ['processing', 'refunded', 'cancelled'],
  processing: ['dispatched', 'refunded', 'cancelled'],
  dispatched: ['delivered', 'disputed', 'refunded'],
  delivered: ['buyer_inspection', 'completed', 'disputed'],
  buyer_inspection: ['completed', 'disputed', 'refunded'],
  completed: ['disputed'],
  disputed: ['refunded', 'completed', 'cancelled'],
  refunded: [],
  cancelled: [],
};

export function canTransitionOrder(fromState: OrderState, toState: OrderState): boolean {
  if (fromState === toState) return true;
  const allowed = VALID_ORDER_TRANSITIONS[fromState];
  return allowed ? allowed.includes(toState) : false;
}

export function getOrderStateBadgeConfig(state: OrderState): {
  label: string;
  badgeClass: string;
} {
  switch (state) {
    case 'pending':
      return { label: 'Payment Pending', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'payment_initiated':
      return { label: 'M-PESA Prompt Sent', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'payment_confirmed':
      return { label: 'M-PESA Paid / Confirmed', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'processing':
      return { label: 'Packaging / In QC', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'dispatched':
      return { label: 'Dispatched to Courier', badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
    case 'delivered':
      return { label: 'Delivered to Customer', badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    case 'buyer_inspection':
      return { label: 'Buyer 24h Inspection Period', badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'completed':
      return { label: 'Order Completed', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'disputed':
      return { label: 'Under Dispute / Review', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'refunded':
      return { label: 'M-PESA Refunded', badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    default:
      return { label: state, badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  }
}
