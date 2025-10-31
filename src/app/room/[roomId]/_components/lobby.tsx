"use client";

import { CheckIcon, CopyIcon, SettingsIcon, XIcon } from "lucide-react";
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
import { cn } from "~/lib/utils";
import type { Player } from "~/lib/schemas/room";

export function Lobby({
  players,
  playerId,
  roomId,
  togglePlayerReady,
}: {
  players: Player[];
  playerId: string | null;
  roomId: string;
  togglePlayerReady: () => void;
}) {
  const roomURL = `${env.NEXT_PUBLIC_APP_URL}/room/${roomId}`;
  const isReady = players.some(
    (player) => player.id === playerId && player.ready,
  );

  return (
    <div className="grid min-h-screen place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lobby</CardTitle>
          <CardDescription>
            Manage your game settings and players.
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={!playerId} onClick={togglePlayerReady}>
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
