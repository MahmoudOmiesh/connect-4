import { RoomHandler } from "./_components/room-handler";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  // const { data: canJoinRoom, error } = await tryCatch(
  //   api.room.canJoin({ roomId }),
  // );

  // if (error || !canJoinRoom) {
  //   return (
  //     <div className="grid h-screen place-items-center">
  //       <Empty className="bg-card border p-8 md:p-8">
  //         <EmptyHeader>
  //           <EmptyMedia variant="icon">
  //             <AlertTriangleIcon />
  //           </EmptyMedia>
  //           <EmptyTitle>Room Not Found</EmptyTitle>
  //           <EmptyDescription>
  //             The room you are looking for does not exist. Or is already full.
  //             Make sure you have the correct link.
  //           </EmptyDescription>
  //         </EmptyHeader>
  //         <EmptyContent>
  //           <Button asChild variant="outline">
  //             <Link href="/">Go Home</Link>
  //           </Button>
  //         </EmptyContent>
  //       </Empty>
  //     </div>
  //   );
  // }

  return <RoomHandler roomId={roomId} />;
}
