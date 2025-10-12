"use client";

import { CheckIcon, CopyIcon, SettingsIcon, XIcon } from "lucide-react";
import type { Members } from "pusher-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { env } from "~/env";
import { pusherClient } from "~/lib/pusher-client";
import { cn } from "~/lib/utils";
import type { Player } from "~/server/api/routers/room";
import { api } from "~/trpc/react";

export function Lobby({ roomId }: { roomId: string }) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const roomURL = `${env.NEXT_PUBLIC_APP_URL}/room/${roomId}`;
  const isReady = players.some(
    (player) => player.id === playerId && player.ready,
  );

  const togglePlayerReady = api.room.togglePlayerReady.useMutation({
    onMutate: (data) => {
      setPlayers((players) =>
        players.map((player) =>
          player.id === data.playerId
            ? { ...player, ready: !player.ready }
            : player,
        ),
      );

      return { oldPlayers: players };
    },
    onError: (error, _, ctx) => {
      setPlayers(ctx?.oldPlayers ?? []);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    const roomChannel = pusherClient.subscribe(`presence-room-${roomId}`);

    function handleSubscriptionSucceeded(members: Members) {
      const me = members.me as { id: string };
      setPlayerId(me.id);
    }

    function handlePlayersChanged(data: { players: Player[] }) {
      setPlayers(data.players);
    }

    roomChannel.bind(
      "pusher:subscription_succeeded",
      handleSubscriptionSucceeded,
    );

    roomChannel.bind("players-changed", handlePlayersChanged);

    return () => {
      roomChannel.unbind_all();
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  return (
    <div className="grid min-h-screen place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lobby</CardTitle>
          <CardDescription>
            Manage your game settings and players.
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                if (togglePlayerReady.isPending) return;
                togglePlayerReady.mutate({ roomId, playerId: playerId ?? "" });
              }}
            >
              {isReady ? "Not Ready" : "Ready"}{" "}
              {isReady ? <XIcon /> : <CheckIcon />}
            </Button>
            <Button>
              Options <SettingsIcon />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="mb-3 text-sm font-medium">Players</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  "bg-muted flex items-center justify-between gap-2 rounded-md p-2 font-mono text-sm",
                  player.id === playerId && "border-primary border",
                )}
              >
                {player.id}
                <span
                  className={cn(
                    "rounded-full p-1 [&_svg]:size-3",
                    player.ready ? "bg-green-500/20" : "bg-destructive/20",
                  )}
                >
                  {player.ready ? <CheckIcon /> : <XIcon />}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="bg-muted grid w-full gap-4 rounded-md p-2">
            <p className="truncate text-sm select-all">{roomURL}</p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => {
                void navigator.clipboard.writeText(roomURL);
                toast.success("Copied to clipboard");
              }}
            >
              Copy <CopyIcon />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
