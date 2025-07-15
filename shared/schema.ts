import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queueTickets = pgTable("queue_tickets", {
  id: serial("id").primaryKey(),
  roomNumber: integer("room_number").notNull(),
  ticketNumber: integer("ticket_number").notNull(),
  status: text("status", { enum: ["waiting", "called", "completed"] }).notNull().default("waiting"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  calledAt: timestamp("called_at"),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: integer("room_number").notNull().unique(),
  currentTicket: text("current_ticket"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertQueueTicketSchema = createInsertSchema(queueTickets).pick({
  roomNumber: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  roomNumber: true,
  isActive: true,
});

export type InsertQueueTicket = z.infer<typeof insertQueueTicketSchema>;
export type QueueTicket = typeof queueTickets.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// WebSocket message types
export interface WebSocketMessage {
  type: 'ticket_generated' | 'ticket_called' | 'queue_updated' | 'room_updated';
  data: any;
}

export interface QueueState {
  rooms: Room[];
  tickets: QueueTicket[];
  currentCalls: Record<number, string>;
}
