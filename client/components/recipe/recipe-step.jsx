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

const fetchVideoStatus = async (sessionId, stepNum) => {
  const backendUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:8080/luma_status`
    : `${process.env.ORIGIN}/luma_status`;
    
  const response = await fetch(`${backendUrl}?session_id=${sessionId}&prompt_num=${stepNum}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      return { message: false }
    }
    throw new Error('Failed to fetch video status')
  }
  
  return response.json()
}

const fetchStepVideo = async (sessionId, stepNum) => {
  const { data, error } = await supabase
    .from('steps')
    .select('video_url')
    .eq('session_id', sessionId)
    .eq('step_number', stepNum)
    .single()

  if (error) throw error
  return data.video_url
}

export default function RecipeStep({ step, recipe }) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('id')
  const stepNum = parseInt(searchParams.get('step'))

  // Query for video status
  const { data: videoStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['video-status', sessionId, stepNum],
    queryFn: () => fetchVideoStatus(sessionId, stepNum),
    refetchInterval: (data) => !data?.message ? 30000 : false, // Poll every 30s until video is ready
    enabled: !!sessionId && !!stepNum,
  })

  // Query for video URL once status is true
  const { data: videoUrl, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video-url', sessionId, stepNum],
    queryFn: () => fetchStepVideo(sessionId, stepNum),
    enabled: !!videoStatus?.message && !!sessionId && !!stepNum,
  })

  const isLoading = isStatusLoading || (videoStatus?.message && isVideoLoading)
  
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
            {isLoading || !videoStatus?.message ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="w-full h-full absolute inset-0" />
                  <p className="text-gray-500 relative z-10">Video is being generated...</p>
                </div>
              </div>
            ) : videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full aspect-video rounded-lg"
                playsInline
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Failed to load video</p>
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
