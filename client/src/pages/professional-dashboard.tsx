import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomGrid } from "@/components/room-grid";
import { QueueDisplay } from "@/components/queue-display";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAudio } from "@/hooks/use-audio";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QueueTicket } from "@shared/schema";
import { Mic, RotateCcw, Clock, Users, Wifi, WifiOff } from "lucide-react";

export default function ProfessionalDashboard() {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { queueState, isConnected } = useWebSocket();
  const { playTicketCall } = useAudio();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get queue for selected room
  const { data: roomQueue = [] } = useQuery<QueueTicket[]>({
    queryKey: ['/api/queue/room', selectedRoom],
    refetchInterval: 5000,
  });

  const callNextMutation = useMutation({
    mutationFn: async (roomNumber: number) => {
      const response = await apiRequest("POST", `/api/queue/call/${roomNumber}`);
      return response.json() as Promise<{ ticket: QueueTicket; ticketCode: string }>;
    },
    onSuccess: (data) => {
      playTicketCall(data.ticketCode, data.ticket.roomNumber);
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      toast({
        title: "Senha chamada!",
        description: `${data.ticketCode} - Sala ${data.ticket.roomNumber.toString().padStart(2, '0')}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao chamar senha",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const completeTicketMutation = useMutation({
    mutationFn: async (roomNumber: number) => {
      const response = await apiRequest("POST", `/api/queue/complete/${roomNumber}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      toast({
        title: "Atendimento concluído",
        description: `Senha da sala ${selectedRoom} foi finalizada.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao finalizar atendimento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleCallNext = () => {
    callNextMutation.mutate(selectedRoom);
  };

  const handleRepeatCall = () => {
    const currentTicket = queueState?.currentCalls[selectedRoom];
    if (currentTicket) {
      playTicketCall(currentTicket, selectedRoom);
      toast({
        title: "Chamada repetida",
        description: `${currentTicket} - Sala ${selectedRoom.toString().padStart(2, '0')}`,
      });
    } else {
      toast({
        title: "Nenhuma senha ativa",
        description: "Não há senha sendo chamada no momento.",
        variant: "destructive",
      });
    }
  };

  const totalWaiting = queueState?.tickets.length || 0;
  const nextTicket = roomQueue[0];
  const currentTicket = queueState?.currentCalls[selectedRoom];

  // Get room overview data
  const roomOverview = queueState?.rooms.map(room => {
    const roomTickets = queueState.tickets.filter(t => t.roomNumber === room.roomNumber);
    return {
      ...room,
      waitingCount: roomTickets.length,
      currentTicket: queueState.currentCalls[room.roomNumber] || null,
    };
  }) || [];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/attached_assets/LOGO_SEPEM-removebg-fundobranco_1752589411920.png" 
              alt="Logo SEPEM" 
              className="h-12 w-12 rounded-full bg-white shadow-md"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Painel Profissional</h2>
              <p className="text-gray-600">Gerenciamento de filas por sala</p>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
            </div>
            <div className="bg-success text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{totalWaiting} aguardando</span>
            </div>
            <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isConnected ? 'bg-success text-white' : 'bg-destructive text-white'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Room Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Sala</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomGrid
              selectedRoom={selectedRoom}
              onRoomSelect={setSelectedRoom}
              variant="dashboard"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Call Control */}
          <Card>
            <CardHeader>
              <CardTitle>Chamar Próxima Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-2">SALA SELECIONADA</div>
                <div className="text-3xl font-display font-bold text-primary mb-4">
                  {selectedRoom.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 mb-2">SENHA ATUAL</div>
                <div className="text-2xl font-display font-bold text-gray-800 mb-2">
                  {currentTicket || '--'}
                </div>
                <div className="text-sm text-gray-600 mb-2">PRÓXIMA SENHA</div>
                <div className="text-4xl font-display font-bold text-success mb-4">
                  {nextTicket 
                    ? `S${selectedRoom}-${nextTicket.ticketNumber.toString().padStart(3, '0')}`
                    : '--'
                  }
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleCallNext}
                  disabled={callNextMutation.isPending || !nextTicket}
                  className="w-full py-4 text-xl"
                  size="lg"
                >
                  <Mic className="mr-3 h-5 w-5" />
                  {callNextMutation.isPending ? "Chamando..." : "Chamar Próxima"}
                </Button>
                
                <Button
                  onClick={handleRepeatCall}
                  disabled={!currentTicket}
                  variant="outline"
                  className="w-full py-3"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Repetir Chamada
                </Button>

                {currentTicket && (
                  <Button
                    onClick={() => completeTicketMutation.mutate(selectedRoom)}
                    disabled={completeTicketMutation.isPending}
                    variant="secondary"
                    className="w-full py-3"
                  >
                    Finalizar Atendimento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Queue for Selected Room */}
          <Card>
            <CardHeader>
              <CardTitle>Fila da Sala {selectedRoom.toString().padStart(2, '0')}</CardTitle>
            </CardHeader>
            <CardContent>
              <QueueDisplay tickets={roomQueue} roomNumber={selectedRoom} />
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 text-center flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{roomQueue.length} pessoas aguardando</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Rooms Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral das Salas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {roomOverview.map((room) => (
                  <div
                    key={room.roomNumber}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoom === room.roomNumber
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoom(room.roomNumber)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${
                        selectedRoom === room.roomNumber
                          ? 'bg-primary text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {room.roomNumber.toString().padStart(2, '0')}
                      </div>
                      <div>
                        <div className="font-medium">Sala {room.roomNumber.toString().padStart(2, '0')}</div>
                        <div className="text-sm text-gray-600">
                          Atual: {room.currentTicket || '--'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        room.waitingCount === 0 ? 'text-gray-400' :
                        room.waitingCount <= 2 ? 'text-success' :
                        room.waitingCount <= 4 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {room.waitingCount}
                      </div>
                      <div className="text-xs text-gray-600">aguardando</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
