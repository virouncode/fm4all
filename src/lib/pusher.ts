import { env } from "@/lib/env";
import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: env.PUSHER_SECRET!,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  },
);
