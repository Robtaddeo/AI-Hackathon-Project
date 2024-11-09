from fastapi import FastAPI
from openai import OpenAI, AsyncOpenAI
import os
import httpx

app = FastAPI()
client = AsyncOpenAI(
    api_key = os.environ.get("OPENAI_API_KEY")
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

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