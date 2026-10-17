
import "./Notes.css";
import { useEffect, useState } from "react";

// Railway Backend API URL
const API_URL =
  "https://notes-app-backend-production-9b45.up.railway.app/api/notes";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch all notes and show the actual error if it fails
  const fetchNotes = async () => {
    setFetching(true);

    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Server did not return a valid notes list.");
      }

      setNotes(data);
    } catch (err) {
      console.error("Fetch notes error:", err);

      setError(
        `Notes load nahi huay: ${
          err.message || "Network request failed"
        }. Please refresh the page and try again.`
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add or update a note
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setTitle("");
      setContent("");
      setEditingId(null);

      await fetchNotes();
    } catch (err) {
      console.error("Save note error:", err);

      setError(
        `Unable to save note: ${
          err.message || "Network request failed"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit a note
  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setError("");
  };

  // Delete a note
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = `Server error: ${response.status}`;

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // The response may not contain JSON
        }

        throw new Error(message);
      }

      if (editingId === id) {
        handleCancel();
      }

      await fetchNotes();
    } catch (err) {
      console.error("Delete note error:", err);

      setError(
        `Unable to delete note: ${
          err.message || "Network request failed"
        }`
      );
    }
  };

  return (
    <div className="notes-page">
      <div className="notes-container">
        {/* Header */}
        <div className="notes-header">
          <h1>
            <span>My Notes</span> ✨
          </h1>

          <p>Create, manage and organize your notes.</p>
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} className="note-form">
          <h2>
            {editingId ? "Edit Your Note" : "Create a New Note"}
          </h2>

          <input
            type="text"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-input"
            required
          />

          <textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="note-input note-textarea"
            required
          />

          {error && (
            <p className="notes-error" role="alert">
              {error}
            </p>
          )}

          <div className="note-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading
                ? "Please wait..."
                : editingId
                  ? "Update Note"
                  : "＋ Add Note"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Notes List Heading */}
        <div className="notes-list-header">
          <h2>My Collection</h2>

          <span className="note-count">
            {notes.length} {notes.length === 1 ? "Note" : "Notes"}
          </span>
        </div>

        {/* Loading State */}
        {fetching ? (
          <div className="notes-empty">
            <p>Loading your notes...</p>
          </div>
        ) : notes.length === 0 && !error ? (
          <div className="notes-empty">
            <h3>No notes yet!</h3>
            <p>
              Your thoughts deserve a beautiful place.
              Add your first note!
            </p>
          </div>
        ) : notes.length > 0 ? (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note._id} className="note-card">
                <h3 className="note-title">{note.title}</h3>

                <p className="note-content">{note.content}</p>

                <div className="note-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(note._id)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Retry Button */}
        {!fetching && error && notes.length === 0 && (
          <div className="notes-empty">
            <button
              type="button"
              onClick={fetchNotes}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
