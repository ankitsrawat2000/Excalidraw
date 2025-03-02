"use client"

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId} : {roomId: string}) {
    
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect(() =>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNDUzNDQ0OC1mNzE2LTRkODMtYjNlYi0yNWZjYmNlZjY3NmEiLCJpYXQiOjE3NDA3MDYyMTd9.3aXWJWpnyT_eHjgx3O2INxhOUr_8ApZVfWK_bk3z5FE`);//when the user signs in they will get a token in local storage. 
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