'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, Mic, Send } from 'lucide-react'

const mockSteps = [
  {
    number: 1,
    title: "Preparation",
    description: "Prep and dice all vegetables",
    details: "Dice the eggplants and zucchini into 1-inch cubes. Chop the bell peppers, tomatoes and onion. Mince the garlic cloves.",
    videoUrl: "https://example.com/step1.mp4"
  },
  {
    number: 2,
    title: "Initial Sauté", 
    description: "Sauté onions and garlic in oil (5 min)",
    details: "Heat olive oil in a large pot over medium heat. Add chopped onions and minced garlic, stirring occasionally until softened and fragrant.",
    videoUrl: "https://example.com/step2.mp4"
  },
  {
    number: 3,
    title: "First Vegetables",
    description: "Cook eggplant and peppers (8-10 min)",
    details: "Add the diced eggplant and bell peppers to the pot. Cook while stirring occasionally until the vegetables begin to soften.",
    videoUrl: "https://example.com/step3.mp4"
  },
  {
    number: 4,
    title: "Remaining Ingredients",
    description: "Add remaining vegetables and seasonings",
    details: "Add the zucchini, tomatoes, bay leaves, and thyme. Season with salt and pepper to taste.",
    videoUrl: "https://example.com/step4.mp4"
  },
  {
    number: 5,
    title: "Final Cooking",
    description: "Simmer covered (30-35 min)",
    details: "Cover the pot and reduce heat to low. Let simmer for 30-35 minutes, stirring occasionally, until all vegetables are tender.",
    videoUrl: "https://example.com/step5.mp4"
  }
]

export default function RecipeStep() {
  const searchParams = useSearchParams()
  const stepNumber = parseInt(searchParams.get('step')) || 1
  const currentStep = mockSteps.find(step => step.number === stepNumber)
  
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    setMessages([...messages, {
      type: 'user',
      content: inputMessage
    }])
    // Here you would typically make an API call to get the response
    setMessages(prev => [...prev, {
      type: 'assistant',
      content: 'This is a mock response. In a real application, this would be connected to an AI service.'
    }])
    setInputMessage('')
  }

  return (
    <div className="flex relative">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Step {currentStep.number}: {currentStep.title}</h1>
            <p className="text-xl text-gray-600">{currentStep.description}</p>
          </div>

          <div className="mb-8">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video demonstration would go here</p>
            </div>
          </div>''

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Detailed Instructions</h2>
            <p className="text-gray-700">{currentStep.details}</p>
          </div>
        </div>
      </div>

      <div className={`fixed right-0 top-0 bottom-0 w-[400px] border-l bg-white transition-all duration-300 ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Step Assistant</h2>
            <p className="text-sm text-gray-500">Ask questions about this step</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.type === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t mt-auto pb-24">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-white border border-r-0 rounded-l-lg p-2 shadow-lg transition-transform duration-300 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-0'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  )
}
