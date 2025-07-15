import { QueueTicket } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface QueueDisplayProps {
  tickets: QueueTicket[];
  roomNumber: number;
}

export function QueueDisplay({ tickets, roomNumber }: QueueDisplayProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma senha aguardando</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {tickets.map((ticket, index) => {
        const ticketCode = `S${roomNumber}-${ticket.ticketNumber.toString().padStart(3, '0')}`;
        const position = index === 0 ? "Próxima" : `${index + 1}º na fila`;
        
        return (
          <Card key={ticket.id} className="bg-gray-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-lg">{ticketCode}</div>
                  <div className="text-sm text-gray-600">
                    {format(ticket.createdAt, 'HH:mm:ss')}
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  index === 0 ? "text-primary" : "text-gray-500"
                }`}>
                  {position}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
