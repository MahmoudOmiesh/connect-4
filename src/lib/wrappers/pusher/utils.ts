import type z from "zod";
import type { EventDefinitions } from "~/lib/schemas/events";

export type EventSchemaMap = {
  [T in (typeof EventDefinitions)[number] as T["name"]]: T["dataSchema"];
};

export type EventDataMap = {
  [T in keyof EventSchemaMap]: z.infer<EventSchemaMap[T]>;
};
