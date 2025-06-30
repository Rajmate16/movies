from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

# Initialize FastAPI app
app = FastAPI(title="Movies API", description="A REST API for managing movies", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow specific origins including localhost and common Amplify domains
    # Using ["*"] would be simpler but may cause issues with credentials
    allow_origins=[
        "http://localhost:3000",
        "https://localhost:3000",
        "http://44.214.91.69:8000",
        "https://44.214.91.69:8000",
        "https://main.d1234abcdef.amplifyapp.com",  # Replace with your actual Amplify domain if known
        "http://main.d1234abcdef.amplifyapp.com",   # Replace with your actual Amplify domain if known
        "*"  # As a fallback, allow all origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Movie model
class Movie(BaseModel):
    id: str
    name: str
    collection: int

# Movie input model (without ID for creation)
class MovieCreate(BaseModel):
    name: str
    collection: int

# In-memory storage for movies (in a real app, you'd use a database)
movies_db = []

@app.get("/")
async def root():
    return {"message": "Welcome to Movies API"}

@app.get("/movies", response_model=List[Movie])
async def getMovies():
    """
    Get all movies from the database
    """
    return movies_db

@app.post("/movies", response_model=Movie)
async def createMovie(movie: MovieCreate):
    """
    Create a new movie
    """
    # Generate a unique ID and create Movie object
    movie_id = str(uuid.uuid4())
    new_movie = Movie(id=movie_id, name=movie.name, collection=movie.collection)
    
    # Check if movie with same ID already exists
    for existing_movie in movies_db:
        if existing_movie.id == new_movie.id:
            raise HTTPException(status_code=400, detail="Movie with this ID already exists")
    
    # Add movie to database
    movies_db.append(new_movie)
    return new_movie

@app.delete("/movies/{movie_name}")
async def deleteMovie(movie_name: str):
    """
    Delete a movie by name
    """
    for i, movie in enumerate(movies_db):
        if movie.name.lower() == movie_name.lower():
            deleted_movie = movies_db.pop(i)
            return {"message": f"Movie '{deleted_movie.name}' deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Movie not found")

@app.get("/movies/{movie_id}", response_model=Movie)
async def getMovie(movie_id: str):
    """
    Get a specific movie by ID
    """
    for movie in movies_db:
        if movie.id == movie_id:
            return movie
    
    raise HTTPException(status_code=404, detail="Movie not found")

@app.delete("/clear-movies")
async def clearMovies():
    """
    Clear all movies from the database
    """
    global movies_db
    movies_db.clear()
    return {"message": "All movies cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 