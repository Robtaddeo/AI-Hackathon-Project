from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from supabase import create_client, Client
from postgrest import APIError
from openai import OpenAI, AsyncOpenAI
import requests
import os
import httpx
from model.recipe import Recipe
from model.prompts import Prompts
from dotenv import load_dotenv
import uuid
import os
from lumaai import AsyncLumaAI
from typing import List
import time
import json
import asyncio
tasks_status = {}
task_to_luma_job_ids = {}
load_dotenv()
# TODO: should we add to the prompt: Try to show the end result of each step.
# TODO: do we want final frame to match the image of the recipe.
CHAT_BASE_PROMPT = "Create LUMA AI prompts in the following manner.\n\
Generate a lumaai prompt for each step in the recipe as a separate video and the number of prompts must match the number of steps in the recipe. Keep in mind that luma ai can only generate video for 5s at a time. So leave out the details of the amount of time each step needs and prompt it to show the most important part of each step. All videos must be from a birds eye  view, i.e., from the top of the items being shown. Each step must extend from the previous, so give each prompt some detail about the visual of last step's prompt if relevant."

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

async def update_step(session_id: str, step_num: int, video_url: str):
    print("trying to update", session_id, step_num, video_url)
    step_response = supabase.table("steps").update(
        {
            "video_url": video_url
        }
    ).eq("step_number", step_num).eq("session_id", session_id).execute()
    return step_response
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
                "image_url": recipe.image_url
            }
        ).execute()
        recipe_id: int = response.data[0]['id']
        print(len(recipe.steps), recipe_id)
        for step_num, step in enumerate(recipe.steps):
            print(step_num)
            step_response = supabase.table("steps").insert(
                {
                    "step_number": step_num + 1,
                    "description": step.description,
                    "session_id": str(session_id),
                    "title": step.title,
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
    
    completion = await client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Guide the Luma AI model prompt by prompt in order of the steps."},
            {"role": "user", "content": f"{CHAT_BASE_PROMPT}{recipe}" }
        ],
        response_format=Prompts
    )
    return {"message": completion.choices[0].message}
async def make_single_luma_call(session_id: str, prompt_num: int, prompt: str, last_frame: str = ""):
    print("received request to do stuff for ", prompt_num)
    mykey = f"{session_id}_{prompt_num}"
    tasks_status[mykey] = False
    try:
        if last_frame == "":
            generation = await luma_async_client.generations.create(
                prompt=prompt,
            )
        else:
            generation = await luma_async_client.generations.create(
                prompt=prompt,
                keyframes={
                "frame1": {
                    "type": "image",
                    "url": last_frame
                }
    }
            )
        task_to_luma_job_ids[f"{session_id}_{prompt_num}"] = generation.id
        completed = False
        # TODO : maybe extend the videos?
        while not completed:
            generation = await luma_async_client.generations.get(id=generation.id)
            if generation.state == "completed":
                completed = True
            elif generation.state == "failed":
                raise RuntimeError(f"Generation failed: {generation.failure_reason}")
            print("Dreaming")
            await asyncio.sleep(3)
        print("done", prompt_num)
        tasks_status[mykey] = True 
        video_url = generation.assets.video
        res = await update_step(session_id, prompt_num, video_url)
        return res
    except Exception as e:
        tasks_status.pop(mykey, None)
        raise HTTPException(status_code=500, detail=f"Error when generating luma videos{e.args[0]}")

# async def get_luma_job_status(session_id: str, prompt_num: int):
#     mykey = f"{session_id}_{prompt_num}"
#     if mykey not in task_to_luma_job_ids:
#         raise  HTTPException(status_code=404, detail="No such session id has had luma jobs started yet.")
#     generation = await luma_async_client.generations.get(id=generation.id)
#     if generation.state == "completed":
#         return {"message": True}
#     elif generation.state == "failed":
#         raise RuntimeError(f"Generation failed: {generation.failure_reason}")
#     return {"message":  False}

@app.get("/luma_status")
async def get_luma_job_status(session_id: str, prompt_num: int):
    if f"{session_id}_{prompt_num}" not in tasks_status:
        raise  HTTPException(status_code=404, detail="No such session id has had luma jobs started yet.")
    return {"message":  tasks_status[f"{session_id}_{prompt_num}"]}

async def send_luma_calls_at_once(session_id: str, luma_ai_prompts: List[str], last_frame_url: str = None):
    tasks = []
    for prompt_num in range(1, len(luma_ai_prompts) + 1):
        luma_ai_prompt = luma_ai_prompts[prompt_num - 1]
        if prompt_num == len(luma_ai_prompts) and last_frame_url:
            tasks.append(make_single_luma_call(session_id, prompt_num, luma_ai_prompt, last_frame_url))
        else:
            tasks.append(make_single_luma_call(session_id, prompt_num, luma_ai_prompt))
    step_responses = await asyncio.gather(*tasks)
    print(step_responses)
        
def check_url(url):
    """Checks the status of a URL and returns the status code."""

    try:
        response = requests.get(url)
        return response.status_code == 200 or response.status_code == 304
    except requests.exceptions.RequestException as e:
        return False


async def kickoff_luma_pipeline(session_id: str, recipe: Recipe):
    res_prompts = await make_gpt_call(json.dumps(jsonable_encoder(recipe)))

    chat_prompts: List[str] = json.loads(res_prompts["message"].content)["data"]
    luma_ai_prompts = list(map(lambda s: s.strip(), chat_prompts))
    print(luma_ai_prompts)
    if session_id not in tasks_status:
        tasks_status[session_id] = [False] * len(luma_ai_prompts)
    last_frame_url = recipe.image_url
    if check_url(last_frame_url):
        await send_luma_calls_at_once(session_id, luma_ai_prompts, last_frame_url)
    else:
        await send_luma_calls_at_once(session_id, luma_ai_prompts)

@app.post("/luma")
async def make_luma_calls(session_id: str, recipe: Recipe, background_tasks: BackgroundTasks):
    background_tasks.add_task(kickoff_luma_pipeline, session_id, recipe)
    # res_prompts = await make_gpt_call(json.dumps(jsonable_encoder(recipe)))

    # chat_prompts: List[str] = json.loads(res_prompts["message"].content)["data"]
    # luma_ai_prompts = list(map(lambda s: s.strip(), chat_prompts))
    # print(luma_ai_prompts)
    # if session_id not in tasks_status:
    #     tasks_status[session_id] = [False] * len(luma_ai_prompts)
    # last_frame_url = recipe.image_url
    # if check_url(last_frame_url):
    #     background_tasks.add_task(send_luma_calls_at_once, session_id, luma_ai_prompts, last_frame_url)
    # else:
    #     background_tasks.add_task(send_luma_calls_at_once, session_id, luma_ai_prompts)
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
