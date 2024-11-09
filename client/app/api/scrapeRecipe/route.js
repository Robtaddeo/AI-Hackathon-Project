// app/api/scrapeRecipe/route.js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { recipeSchema } from '@/types/recipe-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ message: 'URL is required' }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.recipe');

    const recipeHtml = await page.evaluate(() => {
      const recipeElement = document.querySelector('.recipe');
      return recipeElement.outerHTML;
    });

    await browser.close();

    const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts recipe information from HTML. Return only valid JSON with the following structure: {title: string, ingredients: string[], instructions: string[]}"
        },
        {
          role: "user", 
          content: `Extract the recipe information from this HTML: ${recipeHtml}. Make sure the ingredients are detailed with quantity and unit of measure. The step titles should be short and relevant to the description of the step, and the descriptions should be detailed and specific to the step. It should all be relevant to the recipe itself. The recipe description should be short 1-2 attractive sentences about the recipe.`
        }
      ],
      response_format: zodResponseFormat(recipeSchema, "recipe")
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(recipeData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error scraping recipe', error: error.message }, { status: 500 });
  }
}
