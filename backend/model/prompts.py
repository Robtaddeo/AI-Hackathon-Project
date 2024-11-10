from pydantic import BaseModel
from typing import List
class Prompts(BaseModel):
    data: List[str]