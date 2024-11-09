'use client'

import RecipeOverview from '@/components/recipe/recipe-overview'
import RecipeStep from '@/components/recipe/recipe-step'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey
)

export default function RecipePage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')
  const stepNumber = parseInt(searchParams.get('step')) || 0
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('session_id', recipeId)
          .single()

        if (error) {
          throw error
        }

        setRecipe(data)
      } catch (error) {
        console.error('Error fetching recipe:', error)
      } finally {
        setLoading(false)
      }
    }

    if (recipeId) {
      fetchRecipe()
    }
  }, [recipeId])
  
  return (
    <main className="flex h-full flex-col items-center w-full mx-auto">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {stepNumber === 0 && <RecipeOverview recipe={recipe} loading={loading} />}
          {stepNumber > 0 && <RecipeStep recipe={recipe} loading={loading} stepNumber={stepNumber} />}
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
