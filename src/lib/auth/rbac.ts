import 'server-only';

import { type PermissionKey, type Role } from '@/types';

/**
 * RBAC permission matrix — maps each role to the permission keys it holds.
 * Source of truth: PRD §2.1 role descriptions + Technical-Architecture §4.1.
 * NOTE: `guest` is the Supabase anon JWT and holds no permission keys.
 */

const ROLE_PERMISSIONS: Record<Exclude<Role, 'guest'>, PermissionKey[]> = {
  buyer: [],
  seller: [],
  fulfillment: ['orders.view', 'fulfillment.manage', 'delivery.manage'],
  moderator: ['moderate.listings', 'moderate.reports', 'sellers.verify'],
  admin: [
    'products.manage',
    'categories.manage',
    'moderate.listings',
    'moderate.reports',
    'sellers.verify',
    'users.manage',
    'analytics.view',
    'system.configure',
    'finance.ledger',
    'audit.view',
    'orders.view',
    'orders.manage',
    'fulfillment.manage',
    'delivery.manage',
  ],
  super_admin: [
    'products.manage',
    'categories.manage',
    'moderate.listings',
    'moderate.reports',
    'sellers.verify',
    'users.manage',
    'analytics.view',
    'system.configure',
    'finance.ledger',
    'audit.view',
    'impersonate.use',
    'orders.view',
    'orders.manage',
    'fulfillment.manage',
    'delivery.manage',
    'staff.manage',
  ],
};

/** Role hierarchy: index 0 is lowest privilege. Used for >= comparisons. */
const ROLE_ORDER: Exclude<Role, 'guest'>[] = [
  'buyer',
  'seller',
  'fulfillment',
  'moderator',
  'admin',
  'super_admin',
];

export function roleToPermissions(role: Exclude<Role, 'guest'>): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(
  role: Exclude<Role, 'guest'>,
  permission: PermissionKey
): boolean {
  return roleToPermissions(role).includes(permission);
}

/** True if `role` is at least as privileged as `minimum`. */
export function roleAtLeast(
  role: Exclude<Role, 'guest'>,
  minimum: Exclude<Role, 'guest'>
): boolean {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(minimum);
}