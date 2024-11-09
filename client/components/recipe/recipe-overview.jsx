'use client'

import Link from "next/link"

const mockRecipe = {
  title: "Classic French Ratatouille",
  description: "A traditional French Provençal stewed vegetable dish, originating in Nice. This colorful and flavorful vegetarian dish combines summer vegetables, herbs, and olive oil.",
  ingredients: [
    "2 large eggplants, diced",
    "4 medium zucchini, diced", 
    "2 red bell peppers, diced",
    "4 large tomatoes, chopped",
    "1 large onion, chopped",
    "4 cloves garlic, minced",
    "1/4 cup olive oil",
    "2 bay leaves",
    "1 tsp fresh thyme",
    "Salt and pepper to taste"
  ],
  steps: [
    {
      number: 1,
      description: "Prep and dice all vegetables"
    },
    {
      number: 2, 
      description: "Sauté onions and garlic in oil (5 min)"
    },
    {
      number: 3,
      description: "Cook eggplant and peppers (8-10 min)"
    },
    {
      number: 4,
      description: "Add remaining vegetables and seasonings"
    },
    {
      number: 5,
      description: "Simmer covered (30-35 min)"
    }
  ]
}

export default function RecipeOverview() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{mockRecipe.title}</h1>
        <p className="text-gray-600 mb-8">{mockRecipe.description}</p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-6 space-y-2">
            {mockRecipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <div className="space-y-4">
            {mockRecipe.steps.map((step) => (
              <Link 
                key={step.number}
                href={`/recipe?id=test&step=${step.number}`}
                className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-semibold">Step {step.number}</span>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
