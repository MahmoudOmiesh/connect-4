import type { Channel } from "pusher-js";
import type { EventDataMap } from "./utils";
import { EventDefinitions, type EventName } from "~/lib/schemas/events";

export function subscribeToEvent<T extends EventName>(
  channel: Channel,
  eventName: T,
  callback: (data: EventDataMap[T]) => void,
) {
  const event = EventDefinitions.find((event) => event.name === eventName);

  if (!event) {
    throw new Error(`Event ${eventName} not found`);
  }

  const validatedCallback = function (data: unknown) {
    const validatedData = event.dataSchema.safeParse(data);

    if (!validatedData.success) {
      console.error(
        `Invalid data for event ${eventName}:`,
        validatedData.error,
        data,
      );
      return;
    }

    callback(validatedData.data);
  };

  channel.bind(eventName, validatedCallback);
}
