import React, { useEffect, useState } from "react";

// API URLs - make sure these match your actual EC2 configuration
// If your EC2 instance is using a different port, update it here
const API_URL = "http://44.220.88.149:8000";

// If you're testing locally, uncomment this line
// const API_URL = "http://localhost:8000";

// For debugging, try both HTTP and HTTPS if one doesn't work
// const API_URL_HTTPS = "https://44.220.88.149:8000";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ name: "", collection: "" });
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown, online, offline

  // Fetch all movies
  const fetchMovies = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching movies from:", `${API_URL}/movies`);
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API_URL}/movies`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if fetch completes
      
      console.log("Fetch response status:", res.status);
      const data = await res.json();
      console.log("Fetch response data:", data);
      setMovies(data);
    } catch (e) {
      console.error("Fetch error:", e);
      if (e.name === 'AbortError') {
        setError("Request timed out. The server might be unreachable or too slow to respond.");
      } else if (e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
        setError("Network error: Cannot connect to the server. Please check if the server is running and accessible.");
      } else {
        setError("Failed to fetch movies: " + e.message);
      }
    }
    setLoading(false);
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      console.log("Testing connection to server:", API_URL);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await fetch(`${API_URL}/`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        console.log("Server is online!");
        setServerStatus("online");
        return true;
      } else {
        console.error("Server returned error:", res.status);
        setServerStatus("offline");
        return false;
      }
    } catch (e) {
      console.error("Server connection test failed:", e);
      setServerStatus("offline");
      return false;
    }
  };
  
  useEffect(() => {
    // First test the connection, then fetch movies if server is online
    testServerConnection().then(isOnline => {
      if (isOnline) {
        fetchMovies();
      }
    });
    
    // Set up an interval to periodically check server connection
    const intervalId = setInterval(() => {
      testServerConnection();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId); // Clean up on unmount
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
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API_URL}/movies/${encodeURIComponent(name)}`, {
        method: "DELETE",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if fetch completes
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Delete failed");
      } else {
        setSelected(null);
        fetchMovies();
      }
    } catch (e) {
      console.error("Exception in deleteMovie:", e);
      if (e.name === 'AbortError') {
        setError("Delete request timed out. The server might be unreachable.");
      } else if (e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
        setError("Network error: Cannot connect to the server. Please check if the server is running and accessible.");
      } else {
        setError("Delete failed: " + e.message);
      }
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
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if fetch completes
      
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
      if (e.name === 'AbortError') {
        setError("Request timed out. The server might be unreachable or too slow to respond.");
      } else if (e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
        setError("Network error: Cannot connect to the server. Please check if the server is running and accessible.");
      } else {
        setError("Failed to create movie: " + e.message);
      }
    }
    setLoading(false);
  };

  // Manual retry function
  const handleRetry = () => {
    setError("");
    testServerConnection().then(isOnline => {
      if (isOnline) {
        fetchMovies();
      }
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Movies List</h2>
      
      {/* Server Status Indicator */}
      <div style={{ marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div 
            style={{ 
              width: 12, 
              height: 12, 
              borderRadius: "50%", 
              backgroundColor: serverStatus === "online" ? "#28a745" : serverStatus === "offline" ? "#dc3545" : "#ffc107",
              marginRight: 8
            }} 
          />
          <span>Server Status: {serverStatus === "online" ? "Connected" : serverStatus === "offline" ? "Disconnected" : "Checking..."}</span>
          
          {serverStatus === "offline" && (
            <button 
              onClick={handleRetry}
              style={{ 
                marginLeft: 10,
                padding: "5px 10px", 
                backgroundColor: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: 3,
                cursor: "pointer"
              }}
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
      
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