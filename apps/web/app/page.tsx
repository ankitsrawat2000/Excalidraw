"use client";
//Marking the component with "use client"; ensures React hooks (useState, useRouter) work properly.
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";




export default function Home() {

  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className={styles.page}>
      <input value={roomId} onChange={(e) =>{
        setRoomId(e.target.value);
      }} type="text" placeholder="Room id">
      
      </input>
      <button onClick={() =>{router.push(`/room/${roomId}`);}}> 
        join room
      </button> 
    </div>
  ); //when the user comes to frontend they go to specific room e.g. /room/123
}
