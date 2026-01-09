import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import "./BrowsePollsStyles.css";

const BrowsePolls = () => {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPolls(polls);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = polls.filter(
        (poll) =>
          poll.title.toLowerCase().includes(query) ||
          poll.options.some((option) => {
            // Handle both old format (string) and new format (object)
            const optionText =
              typeof option === "string" ? option : option.text || "";
            return optionText.toLowerCase().includes(query);
          })
      );
      setFilteredPolls(filtered);
    }
  }, [searchQuery, polls]);

  const fetchPolls = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/api/polls/all`);
      setPolls(response.data.polls);
      setFilteredPolls(response.data.polls);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("Failed to load polls. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "open":
        return "status-open";
      case "closed":
        return "status-closed";
      default:
        return "status-draft";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      default:
        return "Draft";
    }
  };

  return (
    <div className="browse-polls-container">
      <div className="browse-polls-header">
        <h1>Browse Polls</h1>
        <p>Search and explore all available polls</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search polls by title or options..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading polls...</div>
      ) : (
        <>
          <div className="polls-stats">
            {filteredPolls.length === 0 ? (
              <p>No polls found</p>
            ) : (
              <p>
                {filteredPolls.length} poll{filteredPolls.length !== 1 ? "s" : ""}{" "}
                {searchQuery && `matching "${searchQuery}"`}
              </p>
            )}
          </div>

          {filteredPolls.length > 0 ? (
            <div className="polls-grid">
              {filteredPolls.map((poll) => (
                <div key={poll.id} className="poll-card">
                  {poll.image && (
                    <div className="poll-image-container">
                      <img
                        src={poll.image}
                        alt={poll.title}
                        className="poll-image"
                      />
                    </div>
                  )}
                  <div className="poll-card-header">
                    <h3>{poll.title}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(poll.status)}`}>
                      {getStatusLabel(poll.status)}
                    </span>
                  </div>

                  <div className="poll-options-preview">
                    <p className="options-label">Options:</p>
                    <ul>
                      {poll.options.slice(0, 3).map((option, index) => {
                        // Handle both old format (string) and new format (object)
                        const optionText =
                          typeof option === "string" ? option : option.text;
                        const optionImage =
                          typeof option === "object" ? option.image : null;
                        return (
                          <li key={index} className="option-item">
                            {optionImage && (
                              <img
                                src={optionImage}
                                alt={optionText}
                                className="option-preview-image"
                              />
                            )}
                            <span>{optionText}</span>
                          </li>
                        );
                      })}
                      {poll.options.length > 3 && (
                        <li className="more-options">
                          +{poll.options.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="poll-card-footer">
                    <div className="poll-meta">
                      <span className="poll-creator">
                        {poll.creator
                          ? `Created by ${poll.creator.username}`
                          : "Anonymous"}
                      </span>
                      <span className="poll-date">
                        {formatDate(poll.createdAt)}
                      </span>
                    </div>
                    <Link
                      to={`/poll/${poll.shareLink}`}
                      className="view-poll-btn"
                    >
                      View Poll
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="no-polls">
                <p>No polls match your search.</p>
                <Link to="/create-poll" className="create-poll-link">
                  Create a new poll
                </Link>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePolls;

