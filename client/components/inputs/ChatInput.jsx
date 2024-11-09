import { Paperclip, Globe, ArrowUp, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";

export default function ChatInput() {
  const [searchPrompt, setSearchPrompt] = useState('')
  const [recipes, setRecipes] = useState({ recipies: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isRecipiesLoading, setIsRecipiesLoading] = useState(false);

  const handleSubmit = async () => {
    if (!searchPrompt) return;

    setRecipes({ recipies: [] });

    try {
      if (searchPrompt.startsWith('data:image')) {
        setIsRecipiesLoading(true);
        // Handle image submission
        const response = await fetch('/api/analyzeImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: searchPrompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze image');
        }

        const data = await response.json();
        setIsRecipiesLoading(false);
        window.location.href = `/recipe?id=${data.sessionId}&step=0`;
      } else if (searchPrompt.includes('http')) {
        // Handle URL submission
        setIsLoading(true);
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
        setIsLoading(false);
        window.location.href = `/recipe?id=${data.sessionId}&step=0`;
      } else {
        // Handle text description submission
        setIsLoading(true);
        const response = await fetch('/api/generateRecipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: searchPrompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate recipe');
        }

        const data = await response.json();
        setIsLoading(false);
        window.location.href = `/recipe?id=${data.sessionId}&step=0`;
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setIsRecipiesLoading(false);
    }
  };
  
  const handleTitleDescriptionSubmit = async (title, description) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: `Title: ${title}\n${description}` }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      window.location.href = `/recipe?id=${data.sessionId}&step=0`;
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full mx-auto">
      <div className="relative flex items-end w-full gap-2 rounded-xl bg-gradient-to-b from-zinc-300/30 to-zinc-300/30 p-2">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setSearchPrompt(e.target.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => document.getElementById('imageInput').click()}
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
        <div className="flex-1 relative">
          {searchPrompt && searchPrompt.startsWith('data:image') ? (
            <div className="relative w-32 h-32">
              <img 
                src={searchPrompt} 
                alt="Uploaded content"
                className="object-cover rounded-lg"
              />
              <Button
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200"
                onClick={() => setSearchPrompt('')}
              >
                <X className="h-3 w-3 text-slate-800" />
              </Button>
            </div>
          ) : (
            <Textarea
              className="w-full min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
              placeholder="Enter a link, a recipe or a picture of your fridge..."
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              rows={1}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                for (let item of items) {
                  if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setSearchPrompt(e.target.result);
                    };
                    reader.readAsDataURL(file);
                    break;
                  }
                }
              }}
              onInput={(e) => {
                const maxHeight = 200;
                e.target.style.height = 'auto';
                const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                e.target.style.height = newHeight + 'px';
                e.target.style.overflowY = e.target.scrollHeight > maxHeight ? 'scroll' : 'hidden';
                e.target.style.scrollbarWidth = 'none';
                e.target.style.msOverflowStyle = 'none';
                e.target.style.WebkitScrollbar = {display: 'none'};
              }}
            />
          )}
        </div>
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-primary"
          onClick={handleSubmit}
        >
          {isLoading || isRecipiesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
    {isRecipiesLoading && <div className="flex justify-center items-center h-full">
      <p>Sit tight while we generate some recipies...</p>
    </div>}
    {recipes.recipies.length > 0 && (
      <div className="flex flex-col gap-4 animate-in fade-in duration-500">
        <p>Here's some ideas based on what you have:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
          {recipes.recipies.map((recipe) => (
            <button
              key={recipe.title}
              onClick={() => {
                handleTitleDescriptionSubmit(recipe.title, recipe.description);
              }}
              className="p-4 border rounded-lg hover:bg-slate-100 transition-colors text-left"
            >
              <h3 className="font-medium mb-2">{recipe.title}</h3>
              <p className="text-sm text-gray-600">{recipe.description}</p>
            </button>
          ))}
        </div>
      </div>
    )}
    {isLoading && <div className="flex justify-center items-center h-full mt-4">
      <p>Sit tight while we generate the recipe...</p>
    </div>}
    </div>
  )
}