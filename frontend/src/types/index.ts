export type Role = 'CUSTOMER' | 'ADMIN';
export type ProductCategory = 'SUITS' | 'SHIRTS' | 'TROUSERS' | 'JACKETS' | 'ACCESSORIES' | 'CUSTOM';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type ProductType = 'SUIT' | 'SHIRT' | 'TROUSER' | 'JACKET' | 'CUSTOM';
export type MeasureUnit = 'CM' | 'INCHES';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type DesignRequestStatus = 'PENDING' | 'REVIEWING' | 'QUOTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive?: boolean;
  address?: { line1: string; city: string; state?: string; country: string; postalCode?: string } | null;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  images: string[];
  status: ProductStatus;
  variations?: any;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  customNotes?: string;
  product?: Pick<Product, 'id' | 'name' | 'images' | 'category'>;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: any;
  notes?: string;
  internalNotes?: string;
  assignedTo?: string;
  items: OrderItem[];
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  statusLogs?: OrderStatusLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  userId: string;
  name: string;
  productType: ProductType;
  unit: MeasureUnit;
  measurements: Record<string, number | null>;
  isDefault: boolean;
  measuredDate: string;
  notes?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignMessage {
  id: string;
  designRequestId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
}

export interface DesignRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  budget?: number | null;
  deadline?: string | null;
  status: DesignRequestStatus;
  adminNotes?: string | null;
  attachments: string[];
  messages: DesignMessage[];
  user?: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  createdAt: string;
  user?: Pick<User, 'name' | 'role'>;
}

export interface AdminStats {
  overview: { totalUsers: number; totalOrders: number; totalProducts: number; totalDesignRequests: number; totalRevenue: number };
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
  recentUsers: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>[];
  recentAuditLogs: AuditLog[];
}

// Payloads
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; phone?: string }
export interface CreateProductPayload {
  name: string; description: string; price: number;
  category: ProductCategory; stock: number; images?: string[];
  status?: ProductStatus; variations?: any;
}
export interface CreateOrderPayload {
  items: { productId: string; quantity: number; customNotes?: string }[];
  shippingAddress?: any; notes?: string;
}
export interface MeasurementPayload {
  name?: string; productType: ProductType; unit?: MeasureUnit;
  measurements: Record<string, number | null>; isDefault?: boolean;
  measuredDate?: string; notes?: string;
}
export interface CreateDesignRequestPayload {
  title: string; description: string; budget?: number; deadline?: string; attachments?: string[];
}
export interface CartItem { product: Product; quantity: number; customNotes?: string }

// Measurement field definitions per product type
export const MEASUREMENT_FIELDS: Record<ProductType, { key: string; label: string }[]> = {
  SUIT: [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'sleeve', label: 'Sleeve' },
    { key: 'length', label: 'Length' },
    { key: 'jacketLength', label: 'Jacket Length' },
    { key: 'trouserWaist', label: 'Trouser Waist' },
    { key: 'inseam', label: 'Inseam' },
    { key: 'outseam', label: 'Outseam' },
  ],
  SHIRT: [
    { key: 'collar', label: 'Collar' },
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'sleeve', label: 'Sleeve' },
    { key: 'length', label: 'Length' },
    { key: 'cuff', label: 'Cuff' },
  ],
  TROUSER: [
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'inseam', label: 'Inseam' },
    { key: 'outseam', label: 'Outseam' },
    { key: 'thigh', label: 'Thigh' },
    { key: 'knee', label: 'Knee' },
    { key: 'calf', label: 'Calf' },
  ],
  JACKET: [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'sleeve', label: 'Sleeve' },
    { key: 'length', label: 'Length' },
    { key: 'armhole', label: 'Armhole' },
  ],
  CUSTOM: [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'sleeve', label: 'Sleeve' },
    { key: 'length', label: 'Length' },
    { key: 'inseam', label: 'Inseam' },
    { key: 'neck', label: 'Neck' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight (kg)' },
  ],
};
