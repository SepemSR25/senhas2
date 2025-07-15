import { queueTickets, rooms, type QueueTicket, type InsertQueueTicket, type Room, type InsertRoom } from "@shared/schema";

export interface IStorage {
  // Queue Ticket operations
  getQueueTicket(id: number): Promise<QueueTicket | undefined>;
  getQueueTicketsByRoom(roomNumber: number): Promise<QueueTicket[]>;
  getWaitingTicketsByRoom(roomNumber: number): Promise<QueueTicket[]>;
  getAllWaitingTickets(): Promise<QueueTicket[]>;
  createQueueTicket(ticket: InsertQueueTicket): Promise<QueueTicket>;
  updateTicketStatus(id: number, status: "waiting" | "called" | "completed", calledAt?: Date): Promise<QueueTicket | undefined>;
  getNextTicketNumber(roomNumber: number): Promise<number>;
  
  // Room operations
  getRoom(roomNumber: number): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoomCurrentTicket(roomNumber: number, currentTicket: string | null): Promise<Room | undefined>;
  initializeRooms(): Promise<void>;
}

export class MemStorage implements IStorage {
  private queueTickets: Map<number, QueueTicket>;
  private rooms: Map<number, Room>;
  private currentTicketId: number;
  private currentRoomId: number;

  constructor() {
    this.queueTickets = new Map();
    this.rooms = new Map();
    this.currentTicketId = 1;
    this.currentRoomId = 1;
  }

  async getQueueTicket(id: number): Promise<QueueTicket | undefined> {
    return this.queueTickets.get(id);
  }

  async getQueueTicketsByRoom(roomNumber: number): Promise<QueueTicket[]> {
    return Array.from(this.queueTickets.values()).filter(
      (ticket) => ticket.roomNumber === roomNumber
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getWaitingTicketsByRoom(roomNumber: number): Promise<QueueTicket[]> {
    return Array.from(this.queueTickets.values()).filter(
      (ticket) => ticket.roomNumber === roomNumber && ticket.status === "waiting"
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getAllWaitingTickets(): Promise<QueueTicket[]> {
    return Array.from(this.queueTickets.values()).filter(
      (ticket) => ticket.status === "waiting"
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createQueueTicket(insertTicket: InsertQueueTicket): Promise<QueueTicket> {
    const id = this.currentTicketId++;
    const ticketNumber = await this.getNextTicketNumber(insertTicket.roomNumber);
    
    const ticket: QueueTicket = {
      id,
      roomNumber: insertTicket.roomNumber,
      ticketNumber,
      status: "waiting",
      createdAt: new Date(),
      calledAt: null,
    };
    
    this.queueTickets.set(id, ticket);
    return ticket;
  }

  async updateTicketStatus(id: number, status: "waiting" | "called" | "completed", calledAt?: Date): Promise<QueueTicket | undefined> {
    const ticket = this.queueTickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket: QueueTicket = {
      ...ticket,
      status,
      calledAt: calledAt || (status === "called" ? new Date() : ticket.calledAt),
    };

    this.queueTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getNextTicketNumber(roomNumber: number): Promise<number> {
    const roomTickets = await this.getQueueTicketsByRoom(roomNumber);
    const maxTicketNumber = roomTickets.reduce((max, ticket) => Math.max(max, ticket.ticketNumber), 0);
    return maxTicketNumber + 1;
  }

  async getRoom(roomNumber: number): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.roomNumber === roomNumber);
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).sort((a, b) => a.roomNumber - b.roomNumber);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentRoomId++;
    const room: Room = {
      id,
      roomNumber: insertRoom.roomNumber,
      currentTicket: null,
      isActive: insertRoom.isActive ?? true,
    };
    
    this.rooms.set(id, room);
    return room;
  }

  async updateRoomCurrentTicket(roomNumber: number, currentTicket: string | null): Promise<Room | undefined> {
    const room = await this.getRoom(roomNumber);
    if (!room) return undefined;

    const updatedRoom: Room = {
      ...room,
      currentTicket,
    };

    this.rooms.set(room.id, updatedRoom);
    return updatedRoom;
  }

  async initializeRooms(): Promise<void> {
    // Initialize 10 rooms
    for (let i = 1; i <= 10; i++) {
      if (!(await this.getRoom(i))) {
        await this.createRoom({ roomNumber: i, isActive: true });
      }
    }
  }
}

export const storage = new MemStorage();
