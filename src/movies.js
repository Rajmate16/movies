import React, { useEffect, useState } from "react";

// Try both HTTP and HTTPS if needed
const API_URL = "http://44.214.91.69:8000";
const API_URL_HTTPS = "https://44.214.91.69:8000";

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
      console.log("Trying to fetch movies with HTTP:", `${API_URL}/movies`);
      let res;
      let success = false;
      
      // Try HTTP first
      try {
        res = await fetch(`${API_URL}/movies`);
        success = true;
      } catch (httpError) {
        console.log("HTTP fetch failed, trying HTTPS:", httpError);
        // If HTTP fails, try HTTPS
        try {
          res = await fetch(`${API_URL_HTTPS}/movies`);
          success = true;
        } catch (httpsError) {
          console.error("Both HTTP and HTTPS fetch failed:", httpsError);
          throw new Error("Failed to connect to server via HTTP or HTTPS");
        }
      }
      
      console.log("Fetch response status:", res.status);
      const data = await res.json();
      console.log("Fetch response data:", data);
      setMovies(data);
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Failed to fetch movies: " + e.message);
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
      let res;
      let success = false;
      
      // Try HTTP first
      try {
        res = await fetch(`${API_URL}/movies/${encodeURIComponent(name)}`, {
          method: "DELETE",
        });
        success = true;
      } catch (httpError) {
        console.log("HTTP delete failed, trying HTTPS:", httpError);
        // If HTTP fails, try HTTPS
        try {
          res = await fetch(`${API_URL_HTTPS}/movies/${encodeURIComponent(name)}`, {
            method: "DELETE",
          });
          success = true;
        } catch (httpsError) {
          console.error("Both HTTP and HTTPS delete failed:", httpsError);
          throw new Error("Failed to connect to server via HTTP or HTTPS");
        }
      }
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Delete failed");
      } else {
        setSelected(null);
        fetchMovies();
      }
    } catch (e) {
      console.error("Exception in deleteMovie:", e);
      setError("Delete failed: " + e.message);
    }
    setLoading(false);
  };

  // Create a new movie
  const createMovie = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Creating movie with data:", newMovie);
      const requestBody = {
        name: newMovie.name,
        collection: parseInt(newMovie.collection),
      };
      console.log("Request body:", requestBody);
      
      let res;
      let success = false;
      
      // Try HTTP first
      try {
        res = await fetch(`${API_URL}/movies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        success = true;
      } catch (httpError) {
        console.log("HTTP create failed, trying HTTPS:", httpError);
        // If HTTP fails, try HTTPS
        try {
          res = await fetch(`${API_URL_HTTPS}/movies`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
          success = true;
        } catch (httpsError) {
          console.error("Both HTTP and HTTPS create failed:", httpsError);
          throw new Error("Failed to connect to server via HTTP or HTTPS");
        }
      }
      
      console.log("Create response status:", res.status);
      
      if (!res.ok) {
        const err = await res.json();
        console.error("Error creating movie:", err);
        setError(err.detail || "Failed to create movie");
      } else {
        const data = await res.json();
        console.log("Movie created successfully:", data);
        setNewMovie({ name: "", collection: "" });
        setShowForm(false);
        fetchMovies();
      }
    } catch (e) {
      console.error("Exception in createMovie:", e);
      setError("Failed to create movie: " + e.message);
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