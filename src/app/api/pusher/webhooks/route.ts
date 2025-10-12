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

  parsedBody.events.forEach((event) => {
    const roomId = event.channel.split("-")[2]!;

    if (event.name === "member_added") {
      void tryCatch(api.room.addPlayer({ roomId, playerId: event.user_id }));
    } else if (event.name === "member_removed") {
      void tryCatch(api.room.removePlayer({ roomId, playerId: event.user_id }));
    }
  });

  return new Response("OK");
}
