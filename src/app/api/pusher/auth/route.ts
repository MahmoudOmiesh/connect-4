import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import type { PresenceChannelData } from "pusher";
import { pusher } from "~/lib/pusher";

export async function POST(request: NextRequest) {
  const body = Object.fromEntries(await request.formData()) as {
    socket_id: string;
    channel_name: string;
  };

  const { socket_id, channel_name } = body;

  const presenceData: PresenceChannelData = {
    user_id: nanoid(),
  };

  const authResponse = pusher.authorizeChannel(
    socket_id,
    channel_name,
    presenceData,
  );

  return Response.json(authResponse);
}
