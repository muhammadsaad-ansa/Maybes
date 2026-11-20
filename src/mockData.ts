import { TableDefinition, AuthUser, StorageBucket, StorageFile } from './types';

export const INITIAL_TABLES: TableDefinition[] = [
  {
    id: 'table-1',
    name: 'users',
    schema: 'public',
    rowCount: 4,
    size: '48 KB',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'name', type: 'text', isNullable: false },
      { name: 'email', type: 'text', isNullable: false },
      { name: 'role', type: 'text', isNullable: false, defaultValue: "'customer'" },
      { name: 'is_active', type: 'boolean', isNullable: false, defaultValue: 'true' },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    rows: [
      { id: 'u-101', name: 'Lumajang Saad', email: 'lumajangsaad@gmail.com', role: 'admin', is_active: true, created_at: '2026-01-10 14:20:00' },
      { id: 'u-102', name: 'Siti Rahma', email: 'siti.rahma@example.com', role: 'moderator', is_active: true, created_at: '2026-02-12 09:15:30' },
      { id: 'u-103', name: 'Budi Santoso', email: 'budi.santoso@example.com', role: 'customer', is_active: true, created_at: '2026-03-01 16:45:10' },
      { id: 'u-104', name: 'Dewi Lestari', email: 'dewi.lestari@example.com', role: 'customer', is_active: false, created_at: '2026-03-15 11:05:00' }
    ]
  },
  {
    id: 'table-2',
    name: 'products',
    schema: 'public',
    rowCount: 5,
    size: '64 KB',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'title', type: 'text', isNullable: false },
      { name: 'price', type: 'numeric', isNullable: false },
      { name: 'stock', type: 'integer', isNullable: false, defaultValue: '0' },
      { name: 'category', type: 'text', isNullable: true },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    rows: [
      { id: 'p-201', title: 'MacBook Pro M3 Max', price: 3499.00, stock: 12, category: 'Hardware', created_at: '2026-02-01 10:00:00' },
      { id: 'p-202', title: 'UltraWide 4K Monitor 38"', price: 1199.50, stock: 8, category: 'Displays', created_at: '2026-02-05 14:22:10' },
      { id: 'p-203', title: 'Ergonomic Mechanical Keyboard', price: 215.00, stock: 45, category: 'Accessories', created_at: '2026-02-10 09:11:00' },
      { id: 'p-204', title: 'Wireless Noise-Canceling Headphones', price: 349.99, stock: 20, category: 'Audio', created_at: '2026-02-18 16:30:45' },
      { id: 'p-205', title: 'Thunderbolt 4 Dock Station', price: 289.00, stock: 15, category: 'Accessories', created_at: '2026-02-25 08:45:00' }
    ]
  },
  {
    id: 'table-3',
    name: 'orders',
    schema: 'public',
    rowCount: 3,
    size: '36 KB',
    rlsEnabled: false,
    columns: [
      { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', isNullable: false },
      { name: 'total_amount', type: 'numeric', isNullable: false },
      { name: 'status', type: 'text', isNullable: false, defaultValue: "'pending'" },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    rows: [
      { id: 'ord-301', user_id: 'u-103', total_amount: 3714.00, status: 'completed', created_at: '2026-03-02 10:12:00' },
      { id: 'ord-302', user_id: 'u-101', total_amount: 1199.50, status: 'processing', created_at: '2026-03-10 15:20:11' },
      { id: 'ord-303', user_id: 'u-102', total_amount: 504.99, status: 'shipped', created_at: '2026-03-18 09:05:30' }
    ]
  },
  {
    id: 'table-4',
    name: 'app_logs',
    schema: 'public',
    rowCount: 4,
    size: '52 KB',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimaryKey: true, isNullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'level', type: 'text', isNullable: false },
      { name: 'message', type: 'text', isNullable: false },
      { name: 'metadata', type: 'jsonb', isNullable: true },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    rows: [
      { id: 'log-1', level: 'INFO', message: 'User signed in successfully', metadata: '{"ip": "192.168.1.10", "client": "Web"}', created_at: '2026-03-19 08:00:12' },
      { id: 'log-2', level: 'WARN', message: 'Rate limit approaching for API key', metadata: '{"limit": 1000, "current": 890}', created_at: '2026-03-19 08:15:40' },
      { id: 'log-3', level: 'ERROR', message: 'Failed database transaction rollback', metadata: '{"code": "23505"}', created_at: '2026-03-19 09:12:00' },
      { id: 'log-4', level: 'INFO', message: 'Storage bucket backup completed', metadata: '{"bucket": "avatars", "files": 12}', created_at: '2026-03-19 10:00:00' }
    ]
  }
];

export const INITIAL_USERS: AuthUser[] = [
  { id: 'u-101', email: 'lumajangsaad@gmail.com', provider: 'google', createdAt: '2026-01-10 14:20:00', lastSignIn: '2026-03-19 23:00:00', status: 'active', role: 'admin' },
  { id: 'u-102', email: 'siti.rahma@example.com', provider: 'email', createdAt: '2026-02-12 09:15:30', lastSignIn: '2026-03-19 18:10:00', status: 'active', role: 'moderator' },
  { id: 'u-103', email: 'budi.santoso@example.com', provider: 'github', createdAt: '2026-03-01 16:45:10', lastSignIn: '2026-03-18 14:20:00', status: 'active', role: 'user' },
  { id: 'u-104', email: 'dewi.lestari@example.com', provider: 'email', createdAt: '2026-03-15 11:05:00', lastSignIn: '2026-03-15 11:05:00', status: 'banned', role: 'user' }
];

export const INITIAL_BUCKETS: StorageBucket[] = [
  { id: 'b-1', name: 'avatars', public: true, fileCount: 14, size: '2.4 MB', createdAt: '2026-01-10' },
  { id: 'b-2', name: 'product-assets', public: true, fileCount: 35, size: '48.1 MB', createdAt: '2026-02-01' },
  { id: 'b-3', name: 'secure-documents', public: false, fileCount: 8, size: '15.6 MB', createdAt: '2026-02-15' }
];

export const INITIAL_FILES: StorageFile[] = [
  { id: 'f-1', bucketId: 'b-1', name: 'lumajang-avatar.png', size: '142 KB', mimeType: 'image/png', createdAt: '2026-01-10', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'f-2', bucketId: 'b-1', name: 'siti-profile.jpg', size: '98 KB', mimeType: 'image/jpeg', createdAt: '2026-02-12', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'f-3', bucketId: 'b-2', name: 'macbook-m3-hero.jpg', size: '1.2 MB', mimeType: 'image/jpeg', createdAt: '2026-02-01', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
  { id: 'f-4', bucketId: 'b-2', name: 'ultrawide-monitor.jpg', size: '890 KB', mimeType: 'image/jpeg', createdAt: '2026-02-05', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
  { id: 'f-5', bucketId: 'b-3', name: 'annual-report-2025.pdf', size: '4.5 MB', mimeType: 'application/pdf', createdAt: '2026-02-15', url: '#' }
];
