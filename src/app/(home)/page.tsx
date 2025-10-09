import { NewGameCard } from "./_components/new-game-card";

export default async function Home() {
  return (
    <div className="grid h-screen place-items-center">
      <NewGameCard />
    </div>
  );
}
