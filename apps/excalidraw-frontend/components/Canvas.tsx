import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil" | null;
export function Canvas({
    roomId,
    socket
}: {
    roomId : string,
    socket : WebSocket
}){

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>(null);

    useEffect(() => {
        if (selectedTool) game?.setTool(selectedTool);
    }, [selectedTool, game])

    useEffect(()=>{
        if(canvasRef.current){
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
        overflow:"hidden" //to disable scrolling
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>
    </div>
}

function Topbar({selectedTool, setSelectedTool}:{
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}){
    const [gameInstance, setGameInstance] = useState<Game | null>(null);

    // optional: expose zoom controls
    useEffect(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (canvas && (canvas as any).__game__) {
        setGameInstance((canvas as any).__game__);
      }
    }, []);
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-t">
            <IconButton 
                onClick={() => {
                    setSelectedTool("pencil")
                }}
                activated={selectedTool === "pencil"}
                icon={<Pencil/>}>
            </IconButton>
            <IconButton onClick={() => {
                setSelectedTool("rect")
            }
            } activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon/>}></IconButton>
            <IconButton onClick={() => {
                setSelectedTool("circle")
            }} activated={selectedTool === "circle"} icon={<Circle/>}></IconButton>
            <IconButton activated={false} onClick={() => gameInstance?.zoomIn()} icon={<span style={{ fontSize: 20 }}>＋</span>} />
            <IconButton  activated={false} onClick={() => gameInstance?.zoomOut()} icon={<span style={{ fontSize: 20 }}>－</span>} />
        </div>
    </div>
}


//it renders the canvas