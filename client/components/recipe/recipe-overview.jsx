'use client'

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowUp } from "lucide-react"

export default function RecipeOverview({ recipe, steps, loading, stepsLoading }) {
  const [modifyPrompt, setModifyPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleModifyRecipe = async () => {
    if (!modifyPrompt) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description: `Modify this recipe: ${recipe.title}\n\nCurrent description: ${recipe.description}\n\nModifications requested: ${modifyPrompt}` 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to modify recipe')
      }

      const data = await response.json()
      window.location.href = `/recipe?id=${data.sessionId}&step=0`
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full mb-8" />
          
          <div className="mb-8">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Recipe not found</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <img 
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        <div>
          <h2 className="text-small text-gray-500 font-semibold mb-4">Serves {recipe.servings}</h2>
        </div>
        
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="py-4">
          <h2 className="text-xl font-semibold mb-4">Modify Recipe</h2>
          <div className="relative flex items-end w-full gap-2 rounded-xl bg-gradient-to-b from-zinc-300/30 to-zinc-300/30 p-2">
            <div className="flex-1 relative">
              <Textarea
                className="w-full min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
                placeholder="Spicier? Healthier? More nutritious?"
                value={modifyPrompt}
                onChange={(e) => setModifyPrompt(e.target.value)}
                rows={1}
                onInput={(e) => {
                  const maxHeight = 200
                  e.target.style.height = 'auto'
                  const newHeight = Math.min(e.target.scrollHeight, maxHeight)
                  e.target.style.height = newHeight + 'px'
                  e.target.style.overflowY = e.target.scrollHeight > maxHeight ? 'scroll' : 'hidden'
                  e.target.style.scrollbarWidth = 'none'
                  e.target.style.msOverflowStyle = 'none'
                  e.target.style.WebkitScrollbar = {display: 'none'}
                }}
              />
            </div>
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full bg-primary"
              onClick={handleModifyRecipe}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              <span className="sr-only">Modify recipe</span>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-6 space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Steps</h2>
          {stepsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step) => (
                <a
                  key={step.id}
                  href={`/recipe?id=${recipe.session_id}&step=${step.step_number}`}
                  className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium">Step {step.step_number}</span> - {step.title}
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
