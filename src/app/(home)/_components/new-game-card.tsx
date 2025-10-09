"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

import { GamepadIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewGameCard() {
  const router = useRouter();
  const createRoomMutation = api.room.create.useMutation({
    onSuccess: (room) => {
      router.push(`/room/${room.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Hey There!</CardTitle>
        <CardDescription>
          Wanna play Connect 4 with a pal? This is the place. No sign up
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="lg"
          className="w-full"
          onClick={() => createRoomMutation.mutate()}
          disabled={createRoomMutation.isPending}
        >
          New Game{" "}
          {createRoomMutation.isPending ? <Spinner /> : <GamepadIcon />}
        </Button>
      </CardContent>
    </Card>
  );
}
