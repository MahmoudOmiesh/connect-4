import { env } from "~/env";

import crypto from "crypto";
import { api } from "~/trpc/server";
import { tryCatch } from "~/lib/utils";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("X-Pusher-Signature");

  const hmac = crypto
    .createHmac("sha256", env.PUSHER_SECRET)
    .update(body)
    .digest("hex");

  if (!sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hmac))) {
    console.log("Invalid signature", sig, hmac);
    return new Response("Invalid signature", { status: 401 });
  }

  const parsedBody = JSON.parse(body) as {
    events: {
      name: "member_added" | "member_removed";
      channel: string;
      user_id: string;
    }[];
  };

  await Promise.all(
    parsedBody.events.map(async (event) => {
      const channelParts = event.channel.split("-");

      if (
        channelParts.length !== 3 ||
        channelParts[0] !== "presence" ||
        channelParts[1] !== "room"
      ) {
        console.error("Invalid channel format:", event.channel);
        return;
      }

      const roomId = channelParts[2]!;

      switch (event.name) {
        case "member_added":
          console.log("MEMBER ADDED", event.user_id);
          const { error } = await tryCatch(
            api.room.addPlayer({ roomId, playerId: event.user_id }),
          );
          if (error) {
            console.error("Failed to add player:", error);
          }
          break;
        case "member_removed":
          console.log("MEMBER REMOVED", event.user_id);
          const { error: removeError } = await tryCatch(
            api.room.removePlayer({ roomId, playerId: event.user_id }),
          );
          if (removeError) {
            console.error("Failed to remove player:", removeError);
          }
          break;
      }
    }),
  );

  return new Response("OK");
}
