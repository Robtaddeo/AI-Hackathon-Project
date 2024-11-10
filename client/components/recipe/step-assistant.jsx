'use client'

import { useState } from 'react'
import { Mic, Send, MessageSquare } from 'lucide-react'
import { useChat } from 'ai/react'

export default function StepAssistant({ step, recipe, isOpen, onToggle }) {
  const systemPrompt = `You are a helpful cooking assistant. You are currently helping with step ${step.step_number} of the recipe "${recipe.title}".
  
The current step instructions are: "${step.description}"

The full recipe context is:
Title: ${recipe.title}
Description: ${recipe.description}
Servings: ${recipe.servings}
Ingredients: ${recipe.ingredients.join(', ')}

Please provide specific, detailed answers about this step. If asked about other steps, politely redirect to the current step's context.`

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: systemPrompt,
      }
    ],
  })

  return (
    <>
      <div className={`fixed right-0 top-0 bottom-0 w-[400px] border-l bg-white transition-all duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <img 
              src="sue-chef.png" 
              alt="Sue Chef avatar"
              className="w-8 h-8 rounded-full"
            />
            <h2 className="text-lg font-semibold">Sue Chef</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              message.role !== 'system' && (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}>
                    {message.content}
                  </div>
                </div>
              )
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t mt-auto pb-24">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about this step..."
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-white border border-r-0 rounded-l-lg p-2 shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-0'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </>
  )
} 