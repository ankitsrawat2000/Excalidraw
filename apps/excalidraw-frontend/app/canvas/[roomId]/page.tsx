import { RoomCanvas } from "@/components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = params.roomId;
    return <RoomCanvas roomId={roomId} />
}

//simply extracts the roomId from canvas/[roomId]