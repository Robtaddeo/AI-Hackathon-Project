import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { recipiesSchema } from '@/types/recipies-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { image } = await req.json();

  if (!image) {
    return NextResponse.json({ message: 'Image is required' }, { status: 400 });
  }

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes images of food ingredients and suggests possible recipes that can be made with them. Return a list of recipes with titles and brief descriptions."
        },
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: "Look at this image of ingredients and suggest possible recipes that can be made with them. Keep the suggestions realistic based on what you can see."
            },
            {
              type: "image_url",
              image_url: { url: image }
            }
          ]
        }
      ],
      response_format: zodResponseFormat(recipiesSchema, "recipes"),
      max_tokens: 4096
    });

    const recipesData = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(recipesData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error analyzing image', error: error.message }, { status: 500 });
  }
}
