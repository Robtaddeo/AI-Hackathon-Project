'use client'

import RecipeOverview from '@/components/recipe/recipe-overview'
import RecipeStep from '@/components/recipe/recipe-step'
import { useSearchParams } from 'next/navigation'

export default function RecipePage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')
  const stepNumber = parseInt(searchParams.get('step')) || 0
  
  console.log(recipeId, stepNumber)
  return (
    <main className="flex h-full flex-col items-center w-full mx-auto">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {stepNumber === 0 && <RecipeOverview />}
          {stepNumber > 0 && <RecipeStep />}
        </div>
        <div className="p-4 bg-white border-t flex justify-between items-center sticky bottom-0">
          {stepNumber > 0 && (
            <button
              onClick={() => {
                const prevStep = parseInt(stepNumber) - 1;
                window.location.href = `/recipe?id=${recipeId}&step=${prevStep}`;
              }}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              Previous Step
            </button>
          )}
          
          {parseInt(stepNumber) < 5 && (
            <button
              onClick={() => {
                const nextStep = parseInt(stepNumber) + 1;
                window.location.href = `/recipe?id=${recipeId}&step=${nextStep}`;
              }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors ml-auto"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
