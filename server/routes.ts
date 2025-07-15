import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertQueueTicketSchema, type WebSocketMessage, type QueueState } from "@shared/schema";
import { z } from "zod";

const clients = new Set<WebSocket>();

function broadcastToClients(message: WebSocketMessage) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

async function getQueueState(): Promise<QueueState> {
  const rooms = await storage.getAllRooms();
  const tickets = await storage.getAllWaitingTickets();
  const currentCalls: Record<number, string> = {};
  
  for (const room of rooms) {
    if (room.currentTicket) {
      currentCalls[room.roomNumber] = room.currentTicket;
    }
  }
  
  return { rooms, tickets, currentCalls };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize rooms
  await storage.initializeRooms();

  // Get queue state
  app.get("/api/queue/state", async (req, res) => {
    try {
      const state = await getQueueState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ message: "Failed to get queue state" });
    }
  });

  // Get queue for specific room
  app.get("/api/queue/room/:roomNumber", async (req, res) => {
    try {
      const roomNumber = parseInt(req.params.roomNumber);
      if (isNaN(roomNumber) || roomNumber < 1 || roomNumber > 10) {
        return res.status(400).json({ message: "Invalid room number" });
      }

      const tickets = await storage.getWaitingTicketsByRoom(roomNumber);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get room queue" });
    }
  });

  // Generate new ticket
  app.post("/api/queue/generate", async (req, res) => {
    try {
      const result = insertQueueTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { roomNumber } = result.data;
      if (roomNumber < 1 || roomNumber > 10) {
        return res.status(400).json({ message: "Room number must be between 1 and 10" });
      }

      const ticket = await storage.createQueueTicket({ roomNumber });
      
      // Broadcast ticket generation
      broadcastToClients({
        type: 'ticket_generated',
        data: { ticket, roomNumber }
      });

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ticket" });
    }
  });

  // Call next ticket for room
  app.post("/api/queue/call/:roomNumber", async (req, res) => {
    try {
      const roomNumber = parseInt(req.params.roomNumber);
      if (isNaN(roomNumber) || roomNumber < 1 || roomNumber > 10) {
        return res.status(400).json({ message: "Invalid room number" });
      }

      const waitingTickets = await storage.getWaitingTicketsByRoom(roomNumber);
      if (waitingTickets.length === 0) {
        return res.status(404).json({ message: "No tickets waiting for this room" });
      }

      const nextTicket = waitingTickets[0];
      const calledTicket = await storage.updateTicketStatus(nextTicket.id, "called", new Date());
      
      if (calledTicket) {
        const ticketCode = `S${roomNumber}-${calledTicket.ticketNumber.toString().padStart(3, '0')}`;
        await storage.updateRoomCurrentTicket(roomNumber, ticketCode);

        // Broadcast ticket call
        broadcastToClients({
          type: 'ticket_called',
          data: { ticket: calledTicket, roomNumber, ticketCode }
        });

        res.json({ ticket: calledTicket, ticketCode });
      } else {
        res.status(500).json({ message: "Failed to call ticket" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to call next ticket" });
    }
  });

  // Complete current ticket
  app.post("/api/queue/complete/:roomNumber", async (req, res) => {
    try {
      const roomNumber = parseInt(req.params.roomNumber);
      if (isNaN(roomNumber) || roomNumber < 1 || roomNumber > 10) {
        return res.status(400).json({ message: "Invalid room number" });
      }

      const room = await storage.getRoom(roomNumber);
      if (!room || !room.currentTicket) {
        return res.status(404).json({ message: "No active ticket for this room" });
      }

      // Find the current ticket
      const allTickets = await storage.getQueueTicketsByRoom(roomNumber);
      const currentTicket = allTickets.find(t => t.status === "called");
      
      if (currentTicket) {
        await storage.updateTicketStatus(currentTicket.id, "completed");
        await storage.updateRoomCurrentTicket(roomNumber, null);

        // Broadcast queue update
        broadcastToClients({
          type: 'queue_updated',
          data: { roomNumber }
        });

        res.json({ message: "Ticket completed successfully" });
      } else {
        res.status(404).json({ message: "No called ticket found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to complete ticket" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });

    // Send initial state
    getQueueState().then(state => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'queue_updated',
          data: state
        }));
      }
    });
  });

  return httpServer;
}
