import { pgTable, serial, text, boolean, timestamp, uniqueIndex, integer } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  temporary_password: text("temporary_password"),
  is_password_changed: boolean("is_password_changed").default(false).notNull(),
  name: text("name"),
  designation: text("designation"),
  role: text("role").default("user").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  power_bi_report_id: text("power_bi_report_id").notNull().unique(),
  type: text("type").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const userReportAccess = pgTable(
  "user_report_access",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    report_id: integer("report_id")
      .notNull()
      .references(() => reports.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    unq: uniqueIndex("user_report_access_unq").on(t.user_id, t.report_id),
  }),
)
