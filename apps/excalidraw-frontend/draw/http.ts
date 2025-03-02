import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string){
    console.log(roomId);
    const res = await axios.get(`${HTTP_BACKEND}/api/v1/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) =>{
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}