from fastapi import FastAPI, HTTPException, BackgroundTasks
from supabase import create_client, Client
from postgrest import APIError
from openai import OpenAI, AsyncOpenAI
import os
import httpx
from model.recipe import Recipe
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI()
supabase_url = "https://prkkhhdzeudwvopniwhr.supabase.co"
client = AsyncOpenAI(api_key = os.getenv("OPENAI_API_KEY"))
supabase_key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# async def save_steps_and_luma_links()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/recipe")
async def add_recipe(recipe: Recipe):
    print(recipe.steps)
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

@app.get("/gpt")
async def make_gpt_call():
    # client = OpenAI()
    
    completion = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "give me a shakshuka recipe from ny times"}
        ]
    )
    return {"message": completion.choices[0].message}