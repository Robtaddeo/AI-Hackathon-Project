from pydantic import BaseModel
from typing import List

class Step(BaseModel):
    number: int
    title: str
    description: str