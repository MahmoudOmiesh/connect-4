"use client";

import type { Members } from "pusher-js";
import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusher-client";
import type { Player, Room } from "~/lib/schemas/room";
import { Lobby } from "./lobby";
import { Game } from "./game";
import { createBoard } from "~/lib/connect-4/board";
import { BOARD_SIZES } from "~/lib/schemas/board";

function initialRoom(roomId: string): Room {
  return {
    id: roomId,
    roomChannel: null,
    players: [],
    state: "lobby",
    turn: "",
    board: createBoard(BOARD_SIZES[0]),
  };
}

export function RoomHandler({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<Room>(initialRoom(roomId));
  const [playerId, setPlayerId] = useState<string | null>(null);

  const isReady = room?.players.some(
    (player) => player.id === playerId && player.ready,
  );

  function assignColors(players: Omit<Player, "color">[]) {
    const orderedIds = [...players]
      .map((player) => player.id)
      .sort((a, b) => a.localeCompare(b));

    return players.map((player) => ({
      ...player,
      color: orderedIds[0] === player.id ? ("red" as const) : ("blue" as const),
    }));
  }

  function togglePlayerReady() {
    const updatedPlayers = room.players.map((player) =>
      player.id === playerId ? { ...player, ready: !isReady } : player,
    );

    setRoom((prev) => ({ ...prev, players: updatedPlayers }));
    room.roomChannel?.trigger("client-toggle-player-ready", {
      playerId,
      isReady: !isReady,
    });
  }

  useEffect(() => {
    const roomChannel = pusherClient.subscribe(`presence-room-${roomId}`);

    function handleSubscriptionSucceeded(members: Members) {
      const me = members.me as { id: string };
      const playersWithoutColors: Omit<Player, "color">[] = [];
      members.each((member: { id: string }) => {
        playersWithoutColors.push({ id: member.id, ready: false });
      });

      const playersWithColors = assignColors(playersWithoutColors);

      setPlayerId(me.id);
      setRoom((prev) => ({ ...prev, players: playersWithColors, roomChannel }));
    }

    function handlePlayerAdded(member: { id: string }) {
      setRoom((prev) => {
        const players = assignColors([
          ...prev.players.map(({ id, ready }) => ({ id, ready })),
          { id: member.id, ready: false },
        ]);

        return { ...prev, players };
      });
    }

    function handlePlayerRemoved(member: { id: string }) {
      setRoom((prev) => ({
        ...prev,
        players: prev.players.filter((player) => player.id !== member.id),
      }));
    }

    function handlePlayerReadyToggled(data: {
      playerId: string;
      isReady: boolean;
    }) {
      setRoom((prev) => ({
        ...prev,
        players: prev.players.map((player) =>
          player.id === data.playerId
            ? { ...player, ready: data.isReady }
            : player,
        ),
      }));
    }

    function handleStartGame(data: { turn: string }) {
      setRoom((prev) => ({ ...prev, state: "playing", turn: data.turn }));
    }

    roomChannel.bind(
      "pusher:subscription_succeeded",
      handleSubscriptionSucceeded,
    );
    roomChannel.bind("pusher:member_added", handlePlayerAdded);
    roomChannel.bind("pusher:member_removed", handlePlayerRemoved);
    roomChannel.bind("client-toggle-player-ready", handlePlayerReadyToggled);
    roomChannel.bind("client-start-game", handleStartGame);

    return () => {
      roomChannel.unbind_all();
      roomChannel.unsubscribe();
      setRoom(initialRoom(roomId));
    };
  }, [roomId]);

  useEffect(() => {
    const isRoomReady =
      room.players.length === 2 && room.players.every((player) => player.ready);
    const hostId = [...room.players].sort((a, b) => a.id.localeCompare(b.id))[0]
      ?.id;
    const amHost = playerId === hostId;

    if (!isRoomReady || !amHost || !room.roomChannel) {
      return;
    }

    room.roomChannel.trigger("client-start-game", { turn: hostId });
    setRoom((prev) => ({ ...prev, state: "playing", turn: hostId }));
  }, [room.players, playerId, room.roomChannel]);

  if (room.state === "lobby") {
    return (
      <Lobby
        players={room.players}
        playerId={playerId}
        roomId={roomId}
        togglePlayerReady={togglePlayerReady}
      />
    );
  }

  if (room.state === "playing") {
    return <Game room={room} setRoom={setRoom} playerId={playerId ?? ""} />;
  }

  return <div>Room is in an invalid state</div>;
}
