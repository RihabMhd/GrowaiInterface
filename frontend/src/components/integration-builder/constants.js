// Backend sends `category` per action (main_action | province_city | lookup | webhook).
// This map drives sidebar section ordering + labels — single source of truth, no
// carrier-specific branching needed anywhere in the frontend.
export const CATEGORY_ORDER = ['main_action', 'province_city', 'lookup', 'webhook'];

export const CATEGORY_LABELS = {
  main_action: 'MAIN ACTION',
  province_city: 'PROVINCE/CITY SELECTORS',
  lookup: 'OTHER LOOKUP DATA',
  webhook: 'WEBHOOK',
};