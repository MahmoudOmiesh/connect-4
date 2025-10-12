import Pusher from "pusher-js";
import { env } from "~/env";

const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  channelAuthorization: {
    endpoint: "/api/pusher/auth",
    transport: "ajax",
  },
});

export { pusherClient };
