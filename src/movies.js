import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ name: "", collection: "" });

  // Fetch all movies
  const fetchMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (e) {
      setError("Failed to fetch movies");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Select a movie
  const selectMovie = (movie) => {
    setSelected(movie);
  };

  // Delete a movie by name
  const deleteMovie = async (name) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/movies/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Delete failed");
      } else {
        setSelected(null);
        fetchMovies();
      }
    } catch (e) {
      setError("Delete failed");
    }
    setLoading(false);
  };

  // Create a new movie
  const createMovie = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMovie.name,
          collection: parseInt(newMovie.collection),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to create movie");
      } else {
        setNewMovie({ name: "", collection: "" });
        setShowForm(false);
        fetchMovies();
      }
    } catch (e) {
      setError("Failed to create movie");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Movies List</h2>
      
      {/* Add Movie Button */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ 
          marginBottom: 20, 
          padding: "10px 20px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: 5,
          cursor: "pointer"
        }}
      >
        {showForm ? "Cancel" : "Add New Movie"}
      </button>

      {/* Add Movie Form */}
      {showForm && (
        <div style={{ 
          border: "1px solid #ccc", 
          padding: 20, 
          marginBottom: 20, 
          borderRadius: 5,
          backgroundColor: "#f9f9f9"
        }}>
          <h3>Add New Movie</h3>
          <form onSubmit={createMovie}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5 }}>
                Movie Name:
              </label>
              <input
                type="text"
                value={newMovie.name}
                onChange={(e) => setNewMovie({...newMovie, name: e.target.value})}
                required
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ccc", 
                  borderRadius: 4 
                }}
              />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5 }}>
                Collection (Box Office):
              </label>
              <input
                type="number"
                value={newMovie.collection}
                onChange={(e) => setNewMovie({...newMovie, collection: e.target.value})}
                required
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ccc", 
                  borderRadius: 4 
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: 5,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating..." : "Create Movie"}
            </button>
          </form>
        </div>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      
      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Collection</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {movies.length === 0 && (
            <tr><td colSpan={3}>No movies found</td></tr>
          )}
          {movies.map((movie) => (
            <tr key={movie.id} style={{ background: selected && selected.id === movie.id ? "#eef" : "" }}>
              <td style={{ cursor: "pointer" }} onClick={() => selectMovie(movie)}>{movie.name}</td>
              <td>{movie.collection}</td>
              <td>
                <button 
                  onClick={() => deleteMovie(movie.name)} 
                  disabled={loading}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 3,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selected && (
        <div style={{ border: "1px solid #ccc", padding: 16 }}>
          <h3>Movie Details</h3>
          <div><b>ID:</b> {selected.id}</div>
          <div><b>Name:</b> {selected.name}</div>
          <div><b>Collection:</b> {selected.collection}</div>
        </div>
      )}
    </div>
  );
} 