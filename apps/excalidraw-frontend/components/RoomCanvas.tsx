"use client"

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId} : {roomId: string}) {
    
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect(() =>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGVjOWRmOC04ZDQ5LTQ2MzAtYmNlOS0wY2I0ZjUzNTNhZWMiLCJpYXQiOjE3NTg2NTU1OTN9.TgAM4Naz96UyEskh9sES4yCCkENxtMHUMx8EjX6W9aM`);//when the user signs in they will get a token in local storage. 
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    },[])

    if(!socket){
        return <div>
            connecting to server...
        </div>
    }

    return <div>
        <Canvas roomId = {roomId} socket={socket}/>
    </div>
}

//creates a socket connection to our websocket server.
//until the websocket connection is made it renders the connecting to server... on the screen.
//after it is made it renders the canvas component.