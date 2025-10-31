"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

import { useRouter } from "next/navigation";
import { generateRoomId } from "~/lib/utils";

export function NewGameCard() {
  const router = useRouter();

  function createRoom() {
    const roomId = generateRoomId();
    router.push(`/room/${roomId}`);
  }

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
        <Button size="lg" className="w-full" onClick={createRoom}>
          New Game{" "}
        </Button>
      </CardContent>
    </Card>
  );
}
