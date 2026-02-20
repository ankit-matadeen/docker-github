import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date, pgEnum, numeric } from "drizzle-orm/pg-core";

// Enums
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const hostelGenderEnum = pgEnum("hostel_gender", ["boys", "girls"]);
export const bedTypeEnum = pgEnum("bed_type", ["single", "double"]);
export const acTypeEnum = pgEnum("ac_type", ["ac", "non_ac"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected", "waitlisted"]);
export const allocationStatusEnum = pgEnum("allocation_status", ["active", "completed"]);
export const paymentTypeEnum = pgEnum("payment_type", ["rent", "deposit", "fine"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);
export const complaintStatusEnum = pgEnum("complaint_status", ["open", "in_progress", "resolved"]);
export const govtIdTypeEnum = pgEnum("govt_id_type", ["aadhaar", "passport", "driving_license"]);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
});

export const wardens = pgTable("wardens", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  gender: genderEnum("gender").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 150 }).unique(),
  govtIdType: govtIdTypeEnum("govt_id_type").notNull(),
  govtIdNumber: varchar("govt_id_number", { length: 50 }).notNull().unique(),
  addressId: uuid("address_id").references(() => addresses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hostels = pgTable("hostels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  genderType: hostelGenderEnum("gender_type").notNull(),
  bedType: bedTypeEnum("bed_type").notNull(),
  acType: acTypeEnum("ac_type").notNull(),
  addressId: uuid("address_id").references(() => addresses.id),
  wardenId: uuid("warden_id").references(() => wardens.id),
  totalRooms: integer("total_rooms").notNull(),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostelId: uuid("hostel_id").notNull().references(() => hostels.id),
  roomNumber: varchar("room_number", { length: 20 }).notNull(),
  capacity: integer("capacity").notNull(),
  currentOccupancy: integer("current_occupancy").default(0),
});

export const beds = pgTable("beds", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").notNull().references(() => rooms.id),
  bedNumber: varchar("bed_number", { length: 10 }).notNull(),
  isOccupied: boolean("is_occupied").default(false),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 150 }).unique(),
  govtIdType: govtIdTypeEnum("govt_id_type").notNull(),
  govtIdNumber: varchar("govt_id_number", { length: 50 }).notNull().unique(),
  addressId: uuid("address_id").references(() => addresses.id),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guardians = pgTable("guardians", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  relation: varchar("relation", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  addressId: uuid("address_id").references(() => addresses.id),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  preferredHostelId: uuid("preferred_hostel_id").references(() => hostels.id),
  stayDurationMonths: integer("stay_duration_months").notNull(),
  status: applicationStatusEnum("status").default("pending"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const allocations = pgTable("allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  bedId: uuid("bed_id").notNull().references(() => beds.id),
  checkInDate: date("check_in_date").notNull(),
  expectedCheckoutDate: date("expected_checkout_date"),
  actualCheckoutDate: date("actual_checkout_date"),
  status: allocationStatusEnum("status").default("active"),
});

export const feeStructures = pgTable("fee_structures", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostelId: uuid("hostel_id").notNull().references(() => hostels.id),
  monthlyRent: numeric("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }).notNull(),
  maintenanceFee: numeric("maintenance_fee", { precision: 10, scale: 2 }),
  effectiveFrom: date("effective_from").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  allocationId: uuid("allocation_id").references(() => allocations.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  paymentDate: timestamp("payment_date"),
  transactionReference: varchar("transaction_reference", { length: 150 }),
});

export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  hostelId: uuid("hostel_id").notNull().references(() => hostels.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: complaintStatusEnum("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const visitors = pgTable("visitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  visitorName: varchar("visitor_name", { length: 150 }).notNull(),
  visitorPhone: varchar("visitor_phone", { length: 20 }),
  relation: varchar("relation", { length: 100 }),
  checkInTime: timestamp("check_in_time").notNull(),
  checkOutTime: timestamp("check_out_time"),
});
