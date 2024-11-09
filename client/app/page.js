"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signout } from "./actions";
import RatatouilleRecipeInput from "@/components/home/RecipeInputLayout";

export default function Home() {
  return (
    <div className="flex flex-col h-full flex-1">
      <header className="w-full p-4 sticky top-0 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/remy-logo.png" 
              alt="Remy Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remy
            </h1>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button 
              variant="ghost" 
              className="hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex h-full overflow-y-auto flex-1 flex-grow flex-col items-center justify-center p-4 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <RatatouilleRecipeInput />
        </div>
      </main>
    </div>
  );
}
