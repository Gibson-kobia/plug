export type Role =
  | 'guest'
  | 'buyer'
  | 'seller'
  | 'fulfillment'
  | 'moderator'
  | 'admin'
  | 'super_admin';

export type PermissionKey =
  | 'products.manage'
  | 'categories.manage'
  | 'moderate.listings'
  | 'moderate.reports'
  | 'sellers.verify'
  | 'users.manage'
  | 'analytics.view'
  | 'system.configure'
  | 'finance.ledger'
  | 'audit.view'
  | 'impersonate.use'
  | 'orders.view'
  | 'orders.manage'
  | 'fulfillment.manage'
  | 'delivery.manage'
  | 'staff.manage';

export interface AuthedSession {
  userId: string;
  role: Exclude<Role, 'guest'>;
  email?: string;
  phone?: string;
}
