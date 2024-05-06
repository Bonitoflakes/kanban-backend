"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cards = exports.columns = exports.activity_operations = exports.color = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.color = (0, pg_core_1.pgEnum)("color", [
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
exports.activity_operations = (0, pg_core_1.pgEnum)("activity_operations", [
    "READ",
    "INSERT",
    "UPDATE",
    "DELETE",
]);
exports.columns = (0, pg_core_1.pgTable)("columns", {
    id: (0, pg_core_1.bigserial)("id", { mode: "number" }).primaryKey().notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    colorSpace: (0, exports.color)("colorSpace").default("purple").notNull(),
    order: (0, pg_core_1.integer)("order").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
exports.cards = (0, pg_core_1.pgTable)("cards", {
    id: (0, pg_core_1.bigserial)("id", { mode: "number" }).primaryKey().notNull(),
    columnId: (0, pg_core_1.bigint)("column_id", { mode: "number" })
        .notNull()
        .references(() => exports.columns.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    order: (0, pg_core_1.integer)("order").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
