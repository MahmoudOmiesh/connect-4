import { redis } from "../redis";
import { roomSchema, type Room } from "../schemas/room";

function getRoomKey(roomId: string) {
  return `room:${roomId}`;
}

export const redisWrapper = {
  createRoom: async (roomId: string) => {
    const key = getRoomKey(roomId);
    const room: Room = {
      id: roomId,
      players: [],
    };

    await redis.set(key, room, {
      ex: 60 * 60 * 24, // 1 day
    });
  },

  getRoom: async (roomId: string) => {
    const key = getRoomKey(roomId);
    const room = await redis.get(key);

    if (!room) {
      return null;
    }

    const parsedRoom = roomSchema.parse(room);
    return parsedRoom;
  },

  updateRoom: async (roomId: string, room: Room) => {
    const key = getRoomKey(roomId);

    const validatedRoom = roomSchema.parse(room);
    await redis.set(key, validatedRoom, {
      ex: 60 * 60 * 24, // 1 day
    });
  },

  deleteRoom: async (roomId: string) => {
    const key = getRoomKey(roomId);
    await redis.del(key);
  },
};
