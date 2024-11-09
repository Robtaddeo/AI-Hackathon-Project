import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { recipeSchema } from '@/types/recipe-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
          content: `Generate a detailed recipe based on this description: ${description}. Include specific quantities and measurements for ingredients. Create clear, detailed steps with relevant titles and descriptions. Make the recipe description engaging but concise.`
        }
      ],
      response_format: zodResponseFormat(recipeSchema, "recipe")
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(recipeData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error generating recipe', error: error.message }, { status: 500 });
  }
}
