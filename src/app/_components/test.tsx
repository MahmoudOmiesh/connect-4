"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusher-client";
import { api } from "~/trpc/react";

export default function Test() {
  const [latestMessage, setLatestMessage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const sendMessageMutation = api.message.sendMessage.useMutation();

  useEffect(() => {
    const channel = pusherClient.subscribe("message-channel");

    channel.bind("message", (data: string) => {
      setLatestMessage(data);
    });

    return () => {
      pusherClient.unsubscribe("message-channel");
    };
  }, []);

  function handleSendMessage() {
    sendMessageMutation.mutate({ message });
  }

  return (
    <div>
      <p>Latest message: {latestMessage}</p>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
          className="rounded-md border border-gray-300 p-2"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
