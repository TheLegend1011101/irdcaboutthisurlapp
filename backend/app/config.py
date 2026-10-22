import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
CONSTANT = int(os.getenv("CONSTANT", "0"))
DATABASE_URL = os.getenv("DATABASE_URL")
raw_origin = os.getenv("CORS_ORIGINS", "http://localhost:5173")
ORIGIN = raw_origin

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing")
if not CONSTANT or CONSTANT % 2 == 0:
    raise RuntimeError("CONSTANT must be a non-zero odd integer")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30