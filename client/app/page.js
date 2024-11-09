"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signout } from "./actions";
import RatatouilleRecipeInput from "@/components/home/RecipeInputLayout";

export default function Home() {
  return (
    <div className="flex flex-col h-full flex-1">
      <div className="w-full p-4 sticky top-0 bg z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Remy</h1>
            <form action="/api/auth/signout" method="POST">
            <Button variant="ghost">Sign Out</Button>
          </form>
        </div>
      </div>
    <main className="flex h-full overflow-y-auto flex-1 flex-grow flex-col items-center justify-center p-4 w-full">
      <RatatouilleRecipeInput />
    </main>
    </div>
  );
}
