import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoomGrid } from "@/components/room-grid";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QueueTicket } from "@shared/schema";
import { CheckCircle, Ticket, Users } from "lucide-react";

export default function PasswordGenerator() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<QueueTicket | null>(null);
  const { queueState } = useWebSocket();
  const { toast } = useToast();

  // Get room queues count
  const roomQueues = queueState?.tickets.reduce((acc, ticket) => {
    acc[ticket.roomNumber] = (acc[ticket.roomNumber] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  const generateTicketMutation = useMutation({
    mutationFn: async (roomNumber: number) => {
      const response = await apiRequest("POST", "/api/queue/generate", { roomNumber });
      return response.json() as Promise<QueueTicket>;
    },
    onSuccess: (ticket) => {
      setGeneratedTicket(ticket);
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      toast({
        title: "Senha gerada com sucesso!",
        description: `Sua senha: S${ticket.roomNumber}-${ticket.ticketNumber.toString().padStart(3, '0')}`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao gerar senha",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleRoomSelect = (roomNumber: number) => {
    setSelectedRoom(roomNumber);
    setGeneratedTicket(null);
  };

  const handleGenerateTicket = () => {
    if (selectedRoom) {
      generateTicketMutation.mutate(selectedRoom);
    }
  };

  const getNextTicketNumber = (roomNumber: number) => {
    if (!queueState) return 1;
    const roomTickets = queueState.tickets.filter(t => t.roomNumber === roomNumber);
    const maxTicketNumber = roomTickets.reduce((max, ticket) => Math.max(max, ticket.ticketNumber), 0);
    return maxTicketNumber + 1;
  };

  const getQueuePosition = (roomNumber: number) => {
    return roomQueues[roomNumber] || 0;
  };

  return (
    <div className="min-h-full bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src="/attached_assets/LOGO_SEPEM-removebg-fundobranco_1752589411920.png" 
              alt="Logo SEPEM" 
              className="h-20 w-20 mx-auto rounded-full bg-white shadow-lg"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Retirar Senha</h2>
          <p className="text-xl text-gray-600">Selecione sua sala para gerar uma senha de atendimento</p>
        </div>

        {/* Room Selection Grid */}
        <div className="mb-8">
          <RoomGrid
            selectedRoom={selectedRoom}
            onRoomSelect={handleRoomSelect}
            roomQueues={roomQueues}
            variant="generator"
          />
        </div>

        {/* Selected Room Display */}
        {selectedRoom && !generatedTicket && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Sala Selecionada</h3>
              <div className="text-6xl font-display font-bold text-primary mb-4">
                {selectedRoom.toString().padStart(2, '0')}
              </div>
              <div className="text-lg text-gray-600 mb-6">Sua próxima senha será:</div>
              <div className="text-4xl font-display font-bold text-success mb-6">
                S{selectedRoom}-{getNextTicketNumber(selectedRoom).toString().padStart(3, '0')}
              </div>
              
              <Button
                onClick={handleGenerateTicket}
                disabled={generateTicketMutation.isPending}
                size="lg"
                className="text-xl py-4 px-8"
              >
                <Ticket className="mr-3 h-5 w-5" />
                {generateTicketMutation.isPending ? "Gerando..." : "Gerar Minha Senha"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generated Password Display */}
        {generatedTicket && (
          <Card className="bg-success text-white">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Senha Gerada com Sucesso!</h3>
              </div>
              <div className="text-6xl font-display font-bold mb-4">
                S{generatedTicket.roomNumber}-{generatedTicket.ticketNumber.toString().padStart(3, '0')}
              </div>
              <div className="text-xl mb-6">
                SALA {generatedTicket.roomNumber.toString().padStart(2, '0')}
              </div>
              <div className="text-lg mb-6 flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{getQueuePosition(generatedTicket.roomNumber)} pessoas à sua frente</span>
              </div>
              <p className="text-lg opacity-90">Aguarde ser chamado no painel ou TV</p>
              
              <Button
                onClick={() => {
                  setGeneratedTicket(null);
                  setSelectedRoom(null);
                }}
                variant="secondary"
                className="mt-6"
              >
                Gerar Nova Senha
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
