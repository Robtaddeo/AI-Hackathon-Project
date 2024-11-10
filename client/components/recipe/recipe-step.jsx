'use client'

import { useState } from 'react'
import StepAssistant from './step-assistant'

export default function RecipeStep({ step, recipe }) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  if (!step || !recipe) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading step...</p>
      </div>
    )
  }

  return (
    <div className="flex relative">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Step {step.step_number}: {step.title}</h1>
          </div>

          <div className="mb-8">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video demonstration would go here</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Detailed Instructions</h2>
            <p className="text-gray-700">{step.description}</p>
          </div>
        </div>
      </div>

      <StepAssistant 
        step={step}
        recipe={recipe}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  )
}
