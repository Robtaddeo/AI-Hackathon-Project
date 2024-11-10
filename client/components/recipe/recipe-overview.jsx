'use client'

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function RecipeOverview({ recipe, steps, loading, stepsLoading }) {
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
        <p className="text-gray-600 mb-8">{recipe.description}</p>
        
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
