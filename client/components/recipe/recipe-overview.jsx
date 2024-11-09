'use client'

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function RecipeOverview({ recipe, loading }) {
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
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-gray-600 mb-8">{recipe.description}</p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-6 space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* <div>
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <div className="space-y-4">
            {recipe.steps.map((step) => (
              <Link 
                key={step.number}
                href={`/recipe?id=${recipe.session_id}&step=${step.number}`}
                className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold">Step {step.number}</span>
                    <span className="font-medium text-gray-800">{step.title}</span>
                  </div>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div> */}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Servings</h2>
          <p className="text-gray-700">{recipe.servings}</p>
        </div>
      </div>
    </div>
  )
}
