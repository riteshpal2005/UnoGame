import { SQLiteDatabase } from 'expo-sqlite';


export type TransactionType = 'credit' | 'debit';

export type SyncStatus = 'pending' | 'synced' | 'deleted';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: number;
  type: TransactionType;
  categoryId: string;
  merchant?: string;
  accountId?: string;
  sync_status: SyncStatus;
  updated_at: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sync_status: SyncStatus;
  updated_at: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Credit Card';
  balance: number;
  currentBalance?: number;
  sync_status: SyncStatus;
  updated_at: number;
}

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    sync_status TEXT DEFAULT 'pending',
    updated_at INTEGER
  );
`;

export const CREATE_ACCOUNTS_TABLE = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    sync_status TEXT DEFAULT 'pending',
    updated_at INTEGER
  );
`;

export const CREATE_EXPENSES_TABLE = `
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    description TEXT,
    date INTEGER NOT NULL,
    categoryId TEXT NOT NULL,
    type TEXT NOT NULL,
    merchant TEXT,
    accountId TEXT,
    sync_status TEXT DEFAULT 'pending',
    updated_at INTEGER
  );
`;

export const CREATE_EXPENSES_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
`;

export const CREATE_EXPENSES_CATEGORY_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_expenses_categoryId ON expenses(categoryId);
`;

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(CREATE_ACCOUNTS_TABLE);
  await db.execAsync(CREATE_CATEGORIES_TABLE);
  await db.execAsync(CREATE_EXPENSES_TABLE);

  await db.execAsync(CREATE_EXPENSES_DATE_INDEX);
  await db.execAsync(CREATE_EXPENSES_CATEGORY_INDEX);


  const categoriesCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (categoriesCount && categoriesCount.count === 0) {
    const defaultTime = Date.now();
    await db.execAsync(`
      INSERT INTO categories (id, name, icon, color, updated_at) VALUES 
      ('cat-1', 'Food & Dining', 'restaurant', '#f43f5e', ${defaultTime}),
      ('cat-2', 'Shopping', 'cart', '#3b82f6', ${defaultTime}),
      ('cat-3', 'Transportation', 'car', '#eab308', ${defaultTime}),
      ('cat-4', 'Entertainment', 'film', '#a855f7', ${defaultTime}),
      ('cat-5', 'Bills & Utilities', 'flash', '#10b981', ${defaultTime});
    `);
  }
}