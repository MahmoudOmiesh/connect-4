import { pusher } from "~/lib/pusher";
import { EventDefinitions, type EventName } from "~/lib/schemas/events";
import type { EventDataMap } from "./utils";

export async function triggerEvent<T extends EventName>(
  channelName: string,
  eventName: T,
  data: EventDataMap[T],
) {
  const event = EventDefinitions.find((event) => event.name === eventName);

  if (!event) {
    throw new Error(`Event ${eventName} not found`);
  }

  const validatedData = event.dataSchema.parse(data);
  await pusher.trigger(channelName, eventName, validatedData);
}
