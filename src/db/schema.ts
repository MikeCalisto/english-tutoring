/**
 * Схема данных. Связка «учитель — ученик» заложена как полноценное отношение:
 * на ней строятся проверка работ, занятия и финансы второй версии.
 */
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // nanoid
    role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
    telegramId: text("telegram_id"),
    telegramUsername: text("telegram_username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    /** Учителю доступ включает админ (потом бот Zenedu). Ученик активен всегда. */
    active: boolean("active").notNull().default(false),
    /** Сколько учеников может пригласить учитель. */
    studentLimit: integer("student_limit").notNull().default(10),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_telegram_id_idx").on(t.telegramId)],
);

export const teacherStudent = pgTable(
  "teacher_student",
  {
    teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** Как учитель называет ученика у себя. */
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.studentId] })],
);

export const invites = pgTable(
  "invites",
  {
    code: text("code").primaryKey(),
    teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    label: text("label"),
    usedBy: text("used_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [index("invites_teacher_idx").on(t.teacherId)],
);

/** Одна активная сессия на аккаунт: при новом входе старые удаляются. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    userAgent: text("user_agent"),
    ip: text("ip"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginLog = pgTable("login_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  method: text("method").notNull(), // telegram | code
  ok: boolean("ok").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  note: text("note"),
});

/* ---------- тесты ---------- */

export const tests = pgTable("tests", {
  id: text("id").primaryKey(), // slug
  title: text("title").notNull(),
  topic: text("topic"),
  data: jsonb("data").notNull(), // вопросы и ответы
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testAttempts = pgTable(
  "test_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    testId: text("test_id").notNull().references(() => tests.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    max: integer("max").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("attempts_user_idx").on(t.userId), index("attempts_test_idx").on(t.testId)],
);

export const testAnswers = pgTable(
  "test_answers",
  {
    attemptId: text("attempt_id").notNull().references(() => testAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answer: jsonb("answer"),
    correct: boolean("correct").notNull(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

/* ---------- v2: занятия и финансы (заготовка) ---------- */

export const rates = pgTable(
  "rates",
  {
    teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** Стоимость одного занятия в минимальных единицах валюты. */
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("UAH"),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.studentId] })],
);

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  at: timestamp("at", { withTimezone: true }).notNull(),
  note: text("note"),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("UAH"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  note: text("note"),
});
