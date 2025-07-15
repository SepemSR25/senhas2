import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoomGridProps {
  selectedRoom: number | null;
  onRoomSelect: (roomNumber: number) => void;
  roomQueues?: Record<number, number>;
  variant?: 'generator' | 'dashboard';
}

export function RoomGrid({ selectedRoom, onRoomSelect, roomQueues = {}, variant = 'generator' }: RoomGridProps) {
  const rooms = Array.from({ length: 10 }, (_, i) => i + 1);

  if (variant === 'dashboard') {
    return (
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {rooms.map((roomNumber) => (
          <Button
            key={roomNumber}
            onClick={() => onRoomSelect(roomNumber)}
            variant={selectedRoom === roomNumber ? "default" : "secondary"}
            className={cn(
              "h-12 font-medium transition-all duration-200",
              selectedRoom === roomNumber
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            {roomNumber.toString().padStart(2, '0')}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {rooms.map((roomNumber) => {
        const queueCount = roomQueues[roomNumber] || 0;
        const isSelected = selectedRoom === roomNumber;
        
        return (
          <Button
            key={roomNumber}
            onClick={() => onRoomSelect(roomNumber)}
            variant="outline"
            className={cn(
              "h-24 flex flex-col items-center justify-center border-2 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary text-white hover:bg-primary"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-primary"
            )}
          >
            <div className="text-2xl font-display font-bold mb-1">
              {roomNumber.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">SALA</div>
            <div className={cn(
              "text-xs mt-1 font-medium",
              isSelected ? "text-white" : "text-primary"
            )}>
              {queueCount} aguardando
            </div>
          </Button>
        );
      })}
    </div>
  );
}
