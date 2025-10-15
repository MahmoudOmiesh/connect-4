"use client";

import type { Channel, Members } from "pusher-js";
import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusher-client";
import type { Player, RoomState } from "~/lib/schemas/room";
import { subscribeToEvent } from "~/lib/wrappers/pusher/subscribe";
import { Lobby } from "./lobby";
import { Game } from "./game";

export function RoomHandler({ roomId }: { roomId: string }) {
  const [roomChannel, setRoomChannel] = useState<Channel | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  // by default the room is in lobby state
  const [roomState, setRoomState] = useState<RoomState>("lobby");

  useEffect(() => {
    const roomChannel = pusherClient.subscribe(`presence-room-${roomId}`);
    setRoomChannel(roomChannel);

    function handleSubscriptionSucceeded(members: Members) {
      const me = members.me as { id: string };
      setPlayerId(me.id);
    }

    function handlePlayersChanged(data: { players: Player[] }) {
      setPlayers(data.players);
    }

    function handleRoomStateChanged(data: { state: RoomState }) {
      setRoomState(data.state);
    }

    roomChannel.bind(
      "pusher:subscription_succeeded",
      handleSubscriptionSucceeded,
    );

    subscribeToEvent(roomChannel, "players-changed", handlePlayersChanged);
    subscribeToEvent(roomChannel, "room-state-changed", handleRoomStateChanged);

    return () => {
      roomChannel.unbind_all();
      roomChannel.unsubscribe();
      setRoomChannel(null);
    };
  }, [roomId]);

  if (roomState === "lobby") {
    return (
      <Lobby
        players={players}
        playerId={playerId}
        roomId={roomId}
        setPlayers={setPlayers}
      />
    );
  }

  if (roomState === "playing") {
    return (
      <Game
        roomId={roomId}
        player={players.find((player) => player.id === playerId)!}
        roomChannel={roomChannel}
      />
    );
  }

  return <div>Room is in an invalid state</div>;
}
