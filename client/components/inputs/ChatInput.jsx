import { Paperclip, Globe, ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link";
import { useState } from "react";

export default function ChatInput() {
  const [searchPrompt, setSearchPrompt] = useState('')
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrapeRecipe = async () => {
    if (!searchPrompt) return;
    if (searchPrompt.includes('http')) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/scrapeRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: searchPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
        setRecipe(data);
        console.log(data)
      } catch (error) {
        console.error('Error:', error);
        alert('Error fetching recipe');
      } finally {
        setIsLoading(false);
      }
    }
    console.log(searchPrompt)
  };

  return (
    <div>
    <div className="w-full mx-auto p-4">
      <div className="relative flex items-end w-full gap-2 rounded-xl bg-gradient-to-b from-zinc-300/30 to-zinc-300/30 p-2">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
        <Textarea
          className="min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
          placeholder="Enter a link, a recipie or a picture of your fridge..."
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          rows={1}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        {/* <Link href={`/recipe?id=test&step=0`}> */}
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-primary"
          onClick={scrapeRecipe}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          <span className="sr-only">Send message</span>
        </Button>
        {/* </Link> */}
      </div>
    </div>
    {isLoading && <div className="flex justify-center items-center h-full">
      <p>Sit tight while we generate the recipe...</p>
    </div>}
    </div>
  )
}