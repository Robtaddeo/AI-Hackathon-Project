import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { recipeSchema } from '@/types/recipe-schema';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function POST(req) {
  const { description } = await req.json();

  if (!description) {
    return NextResponse.json({ message: 'Description is required' }, { status: 400 });
  }

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates detailed recipes from text descriptions. Generate a complete recipe with a title, ingredients list, description, servings, and detailed steps."
        },
        {
          role: "user",
          content: `Generate a comprehensive, step-by-step recipe based on this description: ${description}. Include precise quantities and measurements for each ingredient, specifying units (e.g., cups, teaspoons, grams). Break down the cooking process into distinct sections, such as "Preparation," "Cooking," and "Final Touches," with each section containing clear, numbered steps and relevant titles. Ensure each step is concise but fully detailed, guiding the reader through every action. Add notes for timing, temperature, or any special techniques, and make the recipe description engaging yet straightforward. Include any useful tips or substitutions.`
        }
      ],
      response_format: zodResponseFormat(recipeSchema, "recipe")
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    // Generate recipe image
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A professional food photography style image of ${recipeData.title}. The image should be well-lit, showing the completed dish from an appetizing angle.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = imageResponse.data[0].url;
    recipeData.image_url = imageUrl;

    // Send recipe data to backend API
    const backendUrlRecipe = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080/recipe'
      : `${process.env.ORIGIN}/recipe`;

    const backendResponseRecipe = await fetch(backendUrlRecipe, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipeData)
    });

    if (!backendResponseRecipe.ok) {
      throw new Error('Failed to save recipe');
    }

    const { message: sessionId } = await backendResponseRecipe.json();

    // Fixed URL and request body structure for Luma endpoint
    const lumaUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/luma?session_id=${sessionId}`
      : `${process.env.ORIGIN}/luma?session_id=${sessionId}`;

    const backendResponseLuma = await fetch(lumaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipeData)
    });

    if (!backendResponseLuma.ok) {
      throw new Error('Failed to start luma jobs');
    }

    return NextResponse.json({ sessionId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error generating recipe', error: error.message }, { status: 500 });
  }
}
