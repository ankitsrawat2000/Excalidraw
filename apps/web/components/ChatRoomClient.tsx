"use Client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
} : {
    messages: {message: string}[];
    id: string
}){
    const [chats, setChats] = useState(messages);//initial set of messages that we have
    const {socket , loading} = useSocket();
    const [currentMessage, setCurrentMessage] = useState("")

    useEffect(() =>{
        if( socket && !loading){
            //sent the message to connect to room
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            socket.onmessage = (event) =>{//whenever a new message comes
                const parsedData = JSON.parse(event.data);
                if(parsedData.type === "chat"){
                    setChats(c => [...c, {message: parsedData.message}] )
                }
            }
        }
       
    },[socket, loading, id])

    return <div>
        {chats.map(m => <div> {m.message} </div>)}

        <input type="text" value={currentMessage} onChange={e=>{
            setCurrentMessage(e.target.value);
        }}></input>
        <button onClick={() =>{
            socket?.send(JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage
            }))
            setCurrentMessage("");
        }}>Send message</button>
    </div>
}