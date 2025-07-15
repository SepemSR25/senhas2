import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAudio } from "@/hooks/use-audio";
import { Volume2, Clock, Users } from "lucide-react";

export default function TVDisplay() {
  const { queueState } = useWebSocket();
  const { playTicketCall } = useAudio();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCall, setCurrentCall] = useState<{
    ticketCode: string;
    roomNumber: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (queueState?.currentCalls) {
      const calls = Object.entries(queueState.currentCalls);
      if (calls.length > 0) {
        const [roomNumber, ticketCode] = calls[0];
        const newCall = {
          ticketCode,
          roomNumber: parseInt(roomNumber),
        };
        
        // Check if this is a new call
        if (!currentCall || currentCall.ticketCode !== newCall.ticketCode) {
          setCurrentCall(newCall);
          playTicketCall(newCall.ticketCode, newCall.roomNumber);
        }
      }
    }
  }, [queueState, currentCall, playTicketCall]);

  const totalWaiting = queueState?.tickets.length || 0;
  
  // Get next 3 tickets across all rooms
  const nextTickets = queueState?.tickets.slice(0, 3) || [];

  return (
    <div className="min-h-full bg-gradient-to-br from-primary to-blue-600 flex flex-col items-center justify-center p-8">
      {/* Logo Header for TV Display */}
      <div className="mb-8">
        <img 
          src="/attached_assets/LOGO_SEPEM-removebg-fundobranco_1752589411920.png" 
          alt="Logo SEPEM" 
          className="h-16 w-16 mx-auto rounded-full bg-white p-2"
        />
      </div>
      
      <div className="text-center w-full max-w-6xl">
        {/* Current Call Display */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-gray-600 mb-2">SENHA ATUAL</h2>
            <div className="text-8xl font-display font-bold text-primary mb-4">
              {currentCall?.ticketCode || "--"}
            </div>
            <div className="text-3xl font-medium text-gray-700">
              {currentCall ? `SALA ${currentCall.roomNumber.toString().padStart(2, '0')}` : "AGUARDANDO"}
            </div>
          </div>
          
          {/* Audio notification indicator */}
          {currentCall && (
            <div className="flex justify-center items-center space-x-4 text-success">
              <Volume2 className="text-2xl animate-pulse" />
              <span className="text-lg font-medium">Senha sendo chamada</span>
            </div>
          )}
        </div>

        {/* Next in Queue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {nextTickets.map((ticket, index) => {
            const ticketCode = `S${ticket.roomNumber}-${ticket.ticketNumber.toString().padStart(3, '0')}`;
            return (
              <div key={ticket.id} className="bg-white/90 rounded-xl p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">PRÓXIMA</div>
                <div className="text-3xl font-display font-bold text-gray-800">{ticketCode}</div>
                <div className="text-base text-gray-600">
                  SALA {ticket.roomNumber.toString().padStart(2, '0')}
                </div>
              </div>
            );
          })}
          
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 3 - nextTickets.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-white/90 rounded-xl p-6 text-center opacity-50">
              <div className="text-sm text-gray-600 mb-2">PRÓXIMA</div>
              <div className="text-3xl font-display font-bold text-gray-400">--</div>
              <div className="text-base text-gray-400">AGUARDANDO</div>
            </div>
          ))}
        </div>

        {/* Status Bar */}
        <div className="text-white/80 text-lg flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{totalWaiting} senhas aguardando</span>
          </div>
        </div>
      </div>
    </div>
  );
}
