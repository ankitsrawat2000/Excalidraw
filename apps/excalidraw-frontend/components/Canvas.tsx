import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, Plus, Minus, Hand, Undo2, Redo2, Eraser } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "hand" | "eraser" | null;
export function Canvas({
    roomId,
    socket
}: {
    roomId: string,
    socket: WebSocket
}) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>(null);

    useEffect(() => {
        if (selectedTool) game?.setTool(selectedTool);
    }, [selectedTool, game])

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
            return () => {
                g.destroy(); //1:50 pt-4
            }// clean up funciton
            // effects run more than once when you are in dev mode.
            //when that happes we were initializing game twice, we had two set of 
            //handlers.. but on only one we were calling setTool()
        }
    }, [canvasRef]);

    return <div style={{
        height: "100vh", //current height of window
        overflow: "hidden" //to disable scrolling
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} game={game} />
        <Bottombar game={game} />
    </div>
}

function Topbar({ selectedTool, setSelectedTool, game }: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    game?: Game;
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-t">
            <IconButton
                onClick={() => setSelectedTool("hand")}
                activated={selectedTool === "hand"}
                icon={<Hand />}
            />

            <IconButton
                onClick={() => {
                    setSelectedTool("pencil")
                }}
                activated={selectedTool === "pencil"}
                icon={<Pencil />}>
            </IconButton>
            <IconButton onClick={() => {
                setSelectedTool("rect")
            }
            } activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />}></IconButton>
            <IconButton onClick={() => {
                setSelectedTool("circle")
            }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
            <IconButton onClick={() => {
                setSelectedTool("eraser")
            }} activated={selectedTool === "eraser"} icon={<Eraser />}></IconButton>
        </div>
    </div>
}

function Bottombar({ game }: {
    game?: Game;
}) {
    return <div style={{
        position: "fixed",
        bottom: 10,
        left: 10,
    }}>
        <div className="flex gap-t">
            <IconButton activated={false} onClick={() => game?.zoomIn()} icon={<Plus />} />
            <IconButton activated={false} onClick={() => game?.zoomOut()} icon={<Minus />} />
            <IconButton activated={false} onClick={() => game?.undo()} icon={<Undo2 />} />
            <IconButton activated={false} onClick={() => game?.redo()} icon={<Redo2 />} />
        </div>
    </div>
}

//it renders the canvas