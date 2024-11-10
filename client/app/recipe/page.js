'use client'

import RecipeOverview from '@/components/recipe/recipe-overview'
import RecipeStep from '@/components/recipe/recipe-step'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey
)

// Query functions
const fetchRecipe = async (recipeId) => {
  if (!recipeId) return null
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('session_id', recipeId)
    .single()

  if (error) throw error
  return data
}

const fetchSteps = async (recipeId) => {
  if (!recipeId) return []
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('session_id', recipeId)
    .order('step_number', { ascending: true })

  if (error) throw error
  return data
}

export default function RecipePage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')
  const stepNumber = parseInt(searchParams.get('step')) || 0

  // Queries
  const { data: recipe, isLoading: recipeLoading } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => fetchRecipe(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  })

  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['steps', recipeId],
    queryFn: () => fetchSteps(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  })
  
  return (
    <main className="flex h-full flex-col items-center w-full mx-auto">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {stepNumber === 0 && (
            <RecipeOverview 
              recipe={recipe} 
              steps={steps}
              loading={recipeLoading} 
              stepsLoading={stepsLoading} 
            />
          )}
          {stepNumber > 0 && (
            <RecipeStep 
              recipe={recipe} 
              loading={recipeLoading} 
              stepNumber={stepNumber}
              step={steps[stepNumber - 1]}
            />
          )}
        </div>
        
        <div className="p-4 bg-white border-t flex justify-between items-center sticky bottom-0 z-50">
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
          
          {steps.length > 0 && parseInt(stepNumber) < steps.length && (
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
