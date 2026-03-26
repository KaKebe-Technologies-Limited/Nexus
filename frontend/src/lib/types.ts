// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'cashier' | 'attendant' | 'accountant';
  is_active: boolean;
  created_at: string;
}

// Outlets
export interface Outlet {
  id: number;
  name: string;
  outlet_type: 'fuel_station' | 'cafe' | 'supermarket' | 'boutique' | 'bridal' | 'general';
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Categories
export interface Category {
  id: number;
  name: string;
  business_unit: 'fuel' | 'cafe' | 'supermarket' | 'boutique' | 'bridal' | 'general';
  description: string;
  parent: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Products
export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: number;
  category_name: string;
  cost_price: string;
  selling_price: string;
  tax_rate: string;
  track_stock: boolean;
  stock_quantity: string;
  reorder_level: string;
  unit: 'piece' | 'litre' | 'kg' | 'metre' | 'box' | 'pack';
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

// Discounts
export interface Discount {
  id: number;
  name: string;
  discount_type: 'percentage' | 'fixed';
  value: string;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

// Shifts
export interface Shift {
  id: number;
  outlet: number;
  user_id: number;
  status: 'open' | 'closed';
  opening_cash: string;
  closing_cash: string | null;
  expected_cash: string | null;
  notes: string;
  opened_at: string;
  closed_at: string | null;
}

// Sales
export interface Sale {
  id: number;
  receipt_number: string;
  outlet: number;
  shift: number;
  cashier_id: number;
  subtotal: string;
  tax_total: string;
  discount_total: string;
  grand_total: string;
  discount: number | null;
  status: 'completed' | 'voided' | 'refunded';
  notes: string;
  items: SaleItem[];
  payments: SalePayment[];
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  unit_price: string;
  quantity: string;
  tax_rate: string;
  tax_amount: string;
  discount: number | null;
  discount_amount: string;
  line_total: string;
}

export interface SalePayment {
  id: number;
  payment_method: 'cash' | 'bank' | 'mobile_money' | 'card';
  amount: string;
  reference: string;
  created_at: string;
}

// Checkout
export interface CheckoutRequest {
  items: Array<{
    product_id: number;
    quantity: string;
    discount_id?: number;
  }>;
  payments: Array<{
    payment_method: 'cash' | 'bank' | 'mobile_money' | 'card';
    amount: string;
    reference?: string;
  }>;
  discount_id?: number;
  notes?: string;
}

// Cart (frontend-only)
export interface CartItem {
  product: Product;
  quantity: number;
  discount_id?: number;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutletStock {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  outlet: number;
  outlet_name: string;
  quantity: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity_ordered: string;
  quantity_received: string;
  unit_cost: string;
  line_total: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier: number;
  supplier_name: string;
  outlet: number;
  outlet_name: string;
  ordered_by: number;
  status: 'draft' | 'submitted' | 'partial' | 'received' | 'cancelled';
  expected_date: string | null;
  total_cost: string;
  notes: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderCreate {
  supplier_id: number;
  outlet_id: number;
  expected_date?: string;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity_ordered: string;
    unit_cost: string;
  }>;
}

export interface StockTransferItem {
  id: number;
  product: number;
  product_name: string;
  quantity: string;
  quantity_received: string;
}

export interface StockTransfer {
  id: number;
  transfer_number: string;
  from_outlet: number;
  from_outlet_name: string;
  to_outlet: number;
  to_outlet_name: string;
  initiated_by: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes: string;
  items: StockTransferItem[];
  created_at: string;
  updated_at: string;
}

export interface StockTransferCreate {
  from_outlet_id: number;
  to_outlet_id: number;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: string;
  }>;
}

export interface StockAuditLog {
  id: number;
  product: number;
  product_name: string;
  outlet: number | null;
  outlet_name: string | null;
  movement_type: 'sale' | 'void' | 'adjustment' | 'transfer_out' | 'transfer_in' | 'purchase';
  movement_type_display: string;
  quantity_change: string;
  quantity_before: string;
  quantity_after: string;
  reference_type: string;
  reference_id: number | null;
  user_id: number;
  notes: string;
  created_at: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  today_revenue: string;
  today_sales_count: number;
  today_items_sold: string;
  low_stock_count: number;
  open_shifts: number;
  payment_method_breakdown: Array<{
    payment_method: string;
    total: string;
    count: number;
  }>;
  recent_sales: Sale[];
}

export interface SalesSummary {
  date_from: string | null;
  date_to: string | null;
  total_sales: number;
  total_revenue: string;
  total_tax: string;
  total_discounts: string;
  average_sale: string;
}

export interface SalesByOutlet {
  outlet_id: number;
  outlet_name: string;
  total_sales: number;
  total_revenue: string;
}

export interface SalesByProduct {
  product_id: number;
  product_name: string;
  sku: string;
  total_quantity: string;
  total_revenue: string;
}

export interface SalesByPaymentMethod {
  payment_method: string;
  total_amount: string;
  count: number;
}

export interface HourlySales {
  hour: string;
  total_sales: number;
  total_revenue: string;
}

export interface StockLevel {
  product_id: number;
  product_name: string;
  sku: string;
  outlet_id: number | null;
  outlet_name: string | null;
  quantity: string;
  reorder_level: string;
  is_low_stock: boolean;
}

export interface ShiftSummaryReport {
  shift_id: number;
  outlet_name: string;
  cashier_name: string;
  opened_at: string;
  closed_at: string | null;
  status: string;
  sales_count: number;
  total_revenue: string;
  opening_cash: string;
  closing_cash: string | null;
}
