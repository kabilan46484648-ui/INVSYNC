import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SalesTrend {
  saleDate: string;
  category: string;
  totalQuantitySold: number;
}

export interface DashboardOverview {
  totalStockValue: number;
  activeItems: number;
  lowStockAlerts: number;
  pendingPurchaseOrders: number;
  salesToday: number;
  stockInToday: number;
  stockOutToday: number;
}

export interface LowStockAlert {
  stockLevelId: number;
  productName: string;
  warehouseName: string;
  currentQuantity: number;
  threshold: number;
  sku: string;
}

export interface Supplier {
  id?: number;
  name: string;
  contactEmail: string;
  phoneNumber?: string;
}

export interface Item {
  id?: number;
  sku: string;
  name: string;
  unit: string;
  minStockLevel: number;
  category?: string;
  price?: number;
  supplierId?: number;
  supplierName?: string;
  active?: boolean;
}

export interface Warehouse {
  id?: number;
  name: string;
  location?: string;
}

export interface UserAccount {
  id?: number;
  name: string;
  email: string;
  role: string;
}

export interface StockLevel {
  id?: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  lowStockThreshold: number;
  productName?: string;
  warehouseName?: string;
  sku?: string;
}

export interface StockOverview {
  stockLevelId: number;
  productId: number;
  sku: string;
  productName: string;
  unit: string;
  warehouseId: number;
  warehouseName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  currentQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  stockValue: number;
}

export interface StockMovementRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  movementType: string;
  movementDate?: string;
  unitCost?: number;
  notes?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  movementType: string;
  quantity: number;
  balanceAfter: number;
  unitCost?: number;
  referenceNumber?: string;
  notes?: string;
  movementDate: string;
}

export interface PurchaseOrderLine {
  id?: number;
  productId: number;
  productName?: string;
  sku?: string;
  warehouseId: number;
  warehouseName?: string;
  orderedQuantity: number;
  receivedQuantity?: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id?: number;
  poNumber?: string;
  supplierId: number;
  supplierName?: string;
  status?: string;
  orderDate?: string;
  expectedDate?: string;
  receivedDate?: string | null;
  notes?: string;
  lines: PurchaseOrderLine[];
}

export interface ReportSummary {
  openingStock: number;
  stockIn: number;
  stockOut: number;
  adjustments: number;
  currentStock: number;
  stockValue: number;
}

export interface StockValueRow {
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

export const fetchDashboardOverview = () => apiClient.get<DashboardOverview>('/dashboard/overview');
export const fetchSalesTrends = () => apiClient.get<SalesTrend[]>('/dashboard/sales-trends');
export const fetchLowStockAlerts = () => apiClient.get<LowStockAlert[]>('/inventory/low-stock-alerts');

export const fetchSuppliers = () => apiClient.get<Supplier[]>('/suppliers');
export const createSupplier = (data: Supplier) => apiClient.post<Supplier>('/suppliers', data);
export const deleteSupplier = (id: number) => apiClient.delete(`/suppliers/${id}`);

export const fetchItems = () => apiClient.get<Item[]>('/setup/items');
export const createItem = (data: Item) => apiClient.post<Item>('/setup/items', data);

export const fetchWarehouses = () => apiClient.get<Warehouse[]>('/setup/warehouses');
export const createWarehouse = (data: Warehouse) => apiClient.post<Warehouse>('/setup/warehouses', data);

export const fetchUsers = () => apiClient.get<UserAccount[]>('/setup/users');
export const createUser = (data: UserAccount) => apiClient.post<UserAccount>('/setup/users', data);

export const addStockLevel = (data: StockLevel) => apiClient.post<StockLevel>('/inventory/stock', data);
export const fetchStockOverview = () => apiClient.get<StockOverview[]>('/inventory/stock');
export const recordStockOut = (data: StockMovementRequest) => apiClient.post<StockMovement>('/inventory/stock-out', data);
export const recordAdjustment = (data: StockMovementRequest) => apiClient.post<StockMovement>('/inventory/adjustments', data);
export const fetchStockMovements = () => apiClient.get<StockMovement[]>('/inventory/movements');

export const fetchPurchaseOrders = () => apiClient.get<PurchaseOrder[]>('/purchases/orders');
export const createPurchaseOrder = (data: PurchaseOrder) => apiClient.post<PurchaseOrder>('/purchases/orders', data);
export const receivePurchaseOrder = (id: number) => apiClient.post<PurchaseOrder>(`/purchases/orders/${id}/receive`, {});

export const fetchReportSummary = () => apiClient.get<ReportSummary>('/reports/summary');
export const fetchReportMovements = () => apiClient.get<StockMovement[]>('/reports/movements');
export const fetchReportLowStock = () => apiClient.get<LowStockAlert[]>('/reports/low-stock');
export const fetchStockValueReport = () => apiClient.get<StockValueRow[]>('/reports/stock-value');
