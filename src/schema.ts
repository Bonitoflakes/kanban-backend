import { InferSelectModel } from "drizzle-orm";
import {
  bigint,
  pgTable,
  serial,
  text,
  varchar,
  bigserial,
  timestamp,
  index,
  pgEnum,
  unique,
  integer,
} from "drizzle-orm/pg-core";

export const color = pgEnum("color", [
  "rose",
  "yellow",
  "red",
  "purple",
  "blue",
  "green",
  "orange",
  "brown",
  "gray",
]);

export const activity_operations = pgEnum("activity_operations", [
  "READ",
  "INSERT",
  "UPDATE",
  "DELETE",
]);

export const columns = pgTable("columns", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  title: text("title").notNull(),
  colorSpace: color("colorSpace").default("purple").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const cards = pgTable("cards", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  columnId: bigint("column_id", { mode: "number" })
    .notNull()
    .references(() => columns.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

// export const activityLog = pgTable("activity_log", {
//   id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
//   table_name: varchar("table_name").notNull(),
//   operation: activity_operations("operation").notNull(),
//   record_id: bigint("record_id", { mode: "number" }).notNull(),
//   user_id: bigint("user_id", { mode: "number" }),
//   user_ip: varchar("user_ip").notNull(),
//   created_at: timestamp("timestamp", { withTimezone: true, mode: "string" })
//     .defaultNow()
//     .notNull(),
// });

export type T_Column = InferSelectModel<typeof columns>;
export type T_Card = InferSelectModel<typeof cards>;
