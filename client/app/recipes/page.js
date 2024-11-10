'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from "next/image"

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey
)

const RECIPES_PER_PAGE = 20

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecipes, setTotalRecipes] = useState(0)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        // First get total count
        const { count, error: countError } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true })

        if (countError) throw countError
        setTotalRecipes(count)

        // Then get paginated data
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .range((currentPage - 1) * RECIPES_PER_PAGE, currentPage * RECIPES_PER_PAGE - 1)
          .order('id', { ascending: false })
        
        if (error) throw error
        setRecipes(data)
      } catch (err) {
        setError('Failed to fetch recipes')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [currentPage])

  const totalPages = Math.ceil(totalRecipes / RECIPES_PER_PAGE)

  if (loading) return (
    <>
      <header className="w-full p-4 sticky top-0 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/remy-logo.png" 
              alt="Remy Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remy
            </h1>
          </Link>
        </nav>
      </header>
      <div className="container mx-auto px-8 py-8 pb-32">
        <h1 className="text-3xl font-bold mb-8">All Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="bg-gradient-to-b from-zinc-300/30 to-zinc-300/30 hover:bg-gray-200 rounded-lg p-6 h-full transition-all duration-200">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
  
  if (error) return (
    <>
      <header className="w-full p-4 sticky top-0 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/remy-logo.png" 
              alt="Remy Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remy
            </h1>
          </Link>
        </nav>
      </header>
      <div className="flex flex-col gap-2 justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </>
  )

  return (
    <>
      <header className="w-full p-4 sticky top-0 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/remy-logo.png" 
              alt="Remy Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remy
            </h1>
          </Link>
        </nav>
      </header>
      <div className="container mx-auto px-8 py-8 pb-32">
        <h1 className="text-3xl font-bold mb-8">All Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link 
              key={recipe.session_id}
              href={`/recipe?id=${recipe.session_id}&step=0`}
              className="h-full block"
            >
              <div className="p-4 border rounded-lg hover:bg-slate-100 transition-colors text-left flex flex-col h-full">
                <img 
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-36 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold mb-2 text-gray-800 hover:text-blue-600 transition-colors">{recipe.title}</h2>
                <p className="text-gray-600 line-clamp-3">{recipe.description}</p>
              </div>
            </Link>
          ))}
        </div>
        {recipes.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No recipes found. Start by adding your first recipe!
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 fixed bottom-0 w-full bg-white py-4 border-t">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  )
}
