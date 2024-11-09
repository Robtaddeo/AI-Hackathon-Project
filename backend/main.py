from fastapi import FastAPI, HTTPException, BackgroundTasks
from supabase import create_client, Client
from postgrest import APIError
from openai import OpenAI, AsyncOpenAI
import os
import httpx
from model.recipe import Recipe
from dotenv import load_dotenv
import uuid
import os
from lumaai import AsyncLumaAI
import time

load_dotenv()
CHAT_BASE_PROMPT = "Create LUMA AI prompts in the following manner.\nThe first video must be a display of all the ingredients in the json with text labels pointing to each ingredient.\n\
Then generate a lumaai prompt for each step as a separate video. Each step after the first must extend from the previous.\n\
The answer you give must adhere to the following JSON format.\n\
{ "

app = FastAPI()
supabase_url = "https://prkkhhdzeudwvopniwhr.supabase.co"
client = AsyncOpenAI(api_key = os.getenv("OPENAI_API_KEY"))
supabase_key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

luma_async_client = AsyncLumaAI(
    auth_token=os.getenv("LUMAAI_API_KEY"),
)

# async def save_steps_and_luma_links():


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/recipe")
async def add_recipe(recipe: Recipe):
    # print(recipe.steps)
    session_id: str = uuid.uuid4()
    try:
        response = supabase.table("recipes").insert(
            {
                "title": recipe.title,
                "description": recipe.description,
                "ingredients": recipe.ingredients,
                "servings": recipe.servings,
                "session_id": str(session_id),
            }
        ).execute()
        recipe_id: int = response.data[0]['id']
        print(len(recipe.steps), recipe_id)
        for step_num, step in enumerate(recipe.steps):
            print(step_num)
            step_response = supabase.table("steps").insert(
                {
                    "step_number": step_num,
                    "description": step.description,
                    "session_id": str(session_id),
                    "title": step.title
                }
            ).execute()
            print(step_response)
        return { "message": str(session_id), "status": "SUCCESS"}
    except APIError as e:
        print(f"API Error occured: {e}")
        raise HTTPException(status_code=409, detail="Item already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=e.args[0])



@app.get("/recipe")
async def get_recipe(session_id: str):
    try:
        res = supabase.table("recipes").select("*").eq("session_id", session_id).execute()
        if res.data:
            single_recipe = res.data[0]
            return single_recipe
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Item not found")

async def make_gpt_call(prompt: str):
    # client = OpenAI()
    
    completion = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": prompt }
        ]
    )
    return {"message": completion.choices[0].message}

@app.get("/luma")
async def make_luma_call(recipe: Recipe):

    generation = await luma_async_client.generations.create(
        prompt="A teddy bear in sunglasses playing electric guitar and dancing",
    )
    completed = False
    while not completed:
        generation = await luma_async_client.generations.get(id=generation.id)
        if generation.state == "completed":
            completed = True
        elif generation.state == "failed":
            raise RuntimeError(f"Generation failed: {generation.failure_reason}")
        print("Dreaming")
        time.sleep(3)

    video_url = generation.assets.video
    return { "message": video_url }