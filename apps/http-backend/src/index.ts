import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());//json middleware
app.use(cors())

app.post("/api/v1/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);//can use parse 1:01 pt 2
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    const email = parsedData.data?.username;
    const password = parsedData.data?.password;
    const name = parsedData.data.name;

    //db call
    //creating a user
    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        const user = await prismaClient.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: name
            }
        })

        res.json({
            userId: user.id,
            message: "user signed up"
        })
    } catch (e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
});

app.post("/api/v1/signin", async (req, res) => {

    const parsedData = SignInSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    const email = parsedData.data?.username;
    const password = parsedData.data?.password;
    const user = await prismaClient.user.findFirst({
        where: {
            email: email,
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({
            userId: user?.id
        }, JWT_SECRET);

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }



});


//route to create a room & create a entry in db
app.post("/api/v1/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    //db call
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                admin: { connect: { id: userId } }
            }
        })
        res.json({
            roomId: room.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }

});


//will hit this endpoint to get all the chats of existing room
app.get("/api/v1/chats/:roomId", async (req, res) => {

    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);

        //hitting the db and getting top 1000 messages
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });
        res.json({
            messages
        })
    } catch (e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
})

app.delete("/api/v1/chats/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await prismaClient.chat.delete({
        where: { id },
      });
      res.json({ message: `deleted ${id}` });
    } catch (e) {
      res.status(500).json({ message: "Error deleting message" });
    }
  });
  

//given a slug return a roomid. when the user comes they will come to /room/chat-room-1
app.get("/api/v1/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    })
    res.json({
        room
    })
})

//get all rooms endpoint
app.get("/api/v1/rooms/:adminId", async (req, res) => {
    
    const adminId = req.params.adminId;
    console.log(adminId);
    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                adminId: adminId, // filter by adminId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                admin: {
                    select: {
                        name: true
                    }
                }
            }
        });
        res.json({ rooms });
    } catch (e : any) {
        res.status(500).json({
            message: "Error fetching rooms",
            msg: e.message
        });
    }
});

app.listen(3001);