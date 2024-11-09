'use client'

import { useState } from 'react'
import ChatInput from '../inputs/ChatInput'

export default function RatatouilleRecipeInput() {
  const [url, setUrl] = useState('')
  const [recipe, setRecipe] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url && !recipe) {
      setError("Oops! Don't forget to share a recipe or URL with us.")
      return
    }
    setError('')
    console.log('Magnifique! We received:', { url, recipe })
    setUrl('')
    setRecipe('')
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-blue-600 mb-8 flex items-center">
         Lets make something delicious.
      </h1>
      <ChatInput />
    </div>
  )
}