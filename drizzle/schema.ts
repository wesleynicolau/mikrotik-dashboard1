import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * MikroTik device configuration table
 * Stores connection details for RouterOS devices
 */
export const mikrotikDevices = mysqlTable("mikrotik_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  port: int("port").default(8728).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: text("password").notNull(),
  isActive: int("isActive").default(1).notNull(),
  lastConnected: timestamp("lastConnected"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MikrotikDevice = typeof mikrotikDevices.$inferSelect;
export type InsertMikrotikDevice = typeof mikrotikDevices.$inferInsert;

/**
 * System metrics history table
 * Stores historical data for CPU, memory, disk usage
 */
export const systemMetrics = mysqlTable("system_metrics", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  cpuUsage: int("cpuUsage").notNull(),
  memoryUsage: int("memoryUsage").notNull(),
  memoryTotal: int("memoryTotal").notNull(),
  diskUsage: int("diskUsage"),
  diskTotal: int("diskTotal"),
  uptime: varchar("uptime", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;

/**
 * Interface traffic metrics table
 * Stores historical data for network interface traffic
 */
export const interfaceMetrics = mysqlTable("interface_metrics", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  interfaceName: varchar("interfaceName", { length: 255 }).notNull(),
  rxBytes: varchar("rxBytes", { length: 255 }).notNull(),
  txBytes: varchar("txBytes", { length: 255 }).notNull(),
  rxPackets: varchar("rxPackets", { length: 255 }).notNull(),
  txPackets: varchar("txPackets", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterfaceMetric = typeof interfaceMetrics.$inferSelect;
export type InsertInterfaceMetric = typeof interfaceMetrics.$inferInsert;