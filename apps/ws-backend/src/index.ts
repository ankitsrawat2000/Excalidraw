import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 }); //initialized a websocket server on this specific port

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = []; //whenever a user connects to this websocket server we push them to users array.

// const users = [{
//   userId: 1, 
//   roomId: ["room1" , "room2"],
//   ws: socket
// },{
//   userId: 2,
//   roomId: ["room1"],
//   ws: socket 
// },{
//   userId: 3,
//   roomId: [], 
//   ws: socket 
// }];

function checkUser(token: string) : string | null{

  try{
    const decoded = jwt.verify(token, JWT_SECRET); //decoded is payload
    if(typeof decoded == "string"){
      return null;
    }
    if(!decoded || !decoded.userId){
      return null;
    }
    return decoded.userId;
  
  } catch(e){
    return null;
  }
  return null;
}//1:52 pt 2



wss.on('connection', function connection(ws, request) { //whenever a new client connects on my websocket server 1:20 timestamp
  
  const url = request.url; // ws://localhost:3000?token=123123
  //["ws://localhost:3000","token=123123"]
  if(!url){
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if(userId == null){
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })
  
  ws.on('message', async function message(data) { //whenever a message comes from an end client (here data == {type: "join_room", roomId: 1})
    
    let parsedData;
    if(typeof data !== "string"){
      parsedData = JSON.parse(data.toString());
    } else{
      parsedData = JSON.parse(data);
    }

    if(parsedData.type === "join_room"){
      const user = users.find(x => x.ws === ws); //find the user in global users array
      user?.rooms.push(parsedData.roomId);//1:45 pt 2
    }

    if(parsedData.type === "leave_room"){
      const user = users.find(x => x.ws === ws); 
      if(!user){
        return;
      }
      user.rooms = user?.rooms.filter(x => x !== parsedData.roomId);
    }


    if(parsedData.type === "chat"){ //{type: "chat", message: "hi there", roomId: 123}
      const roomId = parsedData.roomId;
      const message = parsedData.message;//1:49 pt 2

      await prismaClient.chat.create({
        data: {
          roomId : Number(roomId),
          message,
          userId
        }
      }) //for a bigginer problem with this is db calls are very slow

      users.forEach(user => {
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId
          }));
        }
      })
      //room authentication logic 1:51 pt 2
    }
  });

});