import { useEffect, useState } from "react";
import { WS_URL} from "../app/config";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() =>{
        const ws = new WebSocket(`${WS_URL}?token=`);//2:41 pt 2
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, [] );

    return {
        socket,
        loading
    }
}

//can put all this logic inside client component ChatRoomClient.tsx
//generally a good idea what can be encapsulated in a hook 
//you put it in a separate hook