import Pusher from "pusher";
import { env } from "~/env";

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  secret: env.PUSHER_SECRET,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

export { pusher };
