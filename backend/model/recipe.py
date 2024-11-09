from pydantic import BaseModel
from typing import List
from model.step import Step

class Recipe(BaseModel):
    title: str
    description: str = ""
    ingredients: List[str]
    servings: str
    steps: List[Step]
    servings: str