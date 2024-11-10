from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.encoders import jsonable_encoder
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
from typing import List
import time
import json
import asyncio
tasks_status = {}

load_dotenv()
CHAT_BASE_PROMPT = "Create LUMA AI prompts in the following manner.\n\
Then generate a lumaai prompt for each step as a separate video. Each step after the first must extend from the previous.\n\
The answer you give must be just text separated by the delimiter '|||'. The step prompts in order, each prompt separated by '|||' and no headings or other extra characters. To "

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
                    "recipe_id": recipe_id,
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

async def make_gpt_call(recipe: Recipe):
    # client = OpenAI()
    
    completion = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": f"{CHAT_BASE_PROMPT}{recipe}" }
        ]
    )
    print(completion)
    return {"message": completion.choices[0].message}
async def make_single_luma_call(session_id: str, prompt_num: int, prompt: str):
    print("received request to do stuff for ", prompt_num)
    await asyncio.sleep(10)
    print("done", prompt_num)
    tasks_status[f"{session_id}_{prompt_num}"] = True

@app.get("/luma_status")
async def get_luma_job_status(session_id: str, prompt_num: int):
    if f"{session_id}_{prompt_num}" not in tasks_status:
        raise  HTTPException(status_code=404, detail="No such session id has had luma jobs started yet.")
    return {"message":  tasks_status[f"{session_id}_{prompt_num}"]}

async def send_luma_calls_at_once(session_id: str, luma_ai_prompts: List[str]):
    tasks = []
    for prompt_num in range(1, len(luma_ai_prompts) + 1):
        luma_ai_prompt = luma_ai_prompts[prompt_num - 1]
        tasks.append(make_single_luma_call(session_id, prompt_num, luma_ai_prompt))
    await asyncio.gather(*tasks)
        

@app.post("/luma")
async def make_luma_calls(session_id: str, recipe: Recipe, background_tasks: BackgroundTasks):
    res_prompts = await make_gpt_call(json.dumps(jsonable_encoder(recipe)))

    chat_prompts = res_prompts["message"].content
    luma_ai_prompts = list(map(lambda s: s.strip(), chat_prompts.split("|||")))
    if session_id not in tasks_status:
        tasks_status[session_id] = [False] * len(luma_ai_prompts)
    background_tasks.add_task(send_luma_calls_at_once, session_id, luma_ai_prompts)
    return {"message": "cooking"}
    # generation = await luma_async_client.generations.create(
    #     prompt="A teddy bear in sunglasses playing electric guitar and dancing",
    # )
    # completed = False
    # while not completed:
    #     generation = await luma_async_client.generations.get(id=generation.id)
    #     if generation.state == "completed":
    #         completed = True
    #     elif generation.state == "failed":
    #         raise RuntimeError(f"Generation failed: {generation.failure_reason}")
    #     print("Dreaming")
    #     time.sleep(3)

    # video_url = generation.assets.video
    # return { "message": video_url }
