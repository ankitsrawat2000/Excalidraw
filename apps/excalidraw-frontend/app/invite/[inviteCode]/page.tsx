"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function InvitePage(props: {
  params: Promise<{ inviteCode: string }>;
}) {
  const router = useRouter();
  const { inviteCode } = use(props.params);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(`/signin?next=/invite/${inviteCode}`);
      return;
    }

    async function joinRoom() {
      const res = await fetch(`http://localhost:3001/api/v1/room/join/${inviteCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/canvas/${data.roomId}`);
      } else {
        alert(data.message);
      }
    }

    joinRoom();
  }, [inviteCode, router]);

  return <div>Joining room...</div>;
}
