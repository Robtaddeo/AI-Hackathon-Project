'use client'

import { useEffect, useState } from 'react'
import StepAssistant from './step-assistant'
import { Skeleton } from '../ui/skeleton'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey
)

const fetchStepVideo = async (sessionId, stepNum) => {
  if (!sessionId || !stepNum) return null
  
  try {
    const { data, error } = await supabase
      .from('steps')
      .select('video_url')
      .eq('session_id', sessionId)
      .eq('step_number', stepNum)
      .single()

    if (error) throw error
    return data?.video_url
  } catch (error) {
    console.error('Error fetching video:', error)
    return null
  }
}

export default function RecipeStep({ step, recipe }) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('id')
  const stepNum = parseInt(searchParams.get('step'))

  const { data: videoUrl, isLoading } = useQuery({
    queryKey: ['video-url', sessionId, stepNum],
    queryFn: () => fetchStepVideo(sessionId, stepNum),
    enabled: !!sessionId && !!stepNum && !step?.video_url,
    refetchInterval: (data) => !data ? 5000 : false, // Poll every 5s until video exists
    retry: 3
  })

  const finalVideoUrl = step?.video_url || videoUrl
  
  if (!step || !recipe) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading step...</p>
      </div>
    )
  }

  return (
    <div className="flex relative bg-background">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Step {step.step_number}: {step.title}</h1>
          </div>

          <div className="mb-8">
            {isLoading ? (
              <div className="aspect-video rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="w-full h-full absolute inset-0" />
                  <p className="text-gray-500 relative z-10">Video is being generated...</p>
                </div>
              </div>
            ) : finalVideoUrl ? (
              <video 
                src={finalVideoUrl} 
                controls 
                className="w-full aspect-video rounded-lg"
                playsInline
                autoPlay
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video is being generated...</p>
              </div>
            )}
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
