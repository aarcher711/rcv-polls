import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import "./ProfileStyles.css";

const Profile = ({ user: currentUser, setUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", avatar: null });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/api/users/${username}`);
      setProfileUser(response.data.user);
      setPolls(response.data.user.polls || []);
      setEditForm({
        bio: response.data.user.bio || "",
        avatar: null,
      });
      setAvatarPreview(response.data.user.avatar);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      bio: profileUser?.bio || "",
      avatar: null,
    });
    setAvatarPreview(profileUser?.avatar || null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setEditForm((prev) => ({ ...prev, avatar: base64String }));
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/users/me/profile`,
        {
          bio: editForm.bio,
          avatar: editForm.avatar || profileUser?.avatar,
        },
        { withCredentials: true }
      );

      setProfileUser(response.data.user);
      setAvatarPreview(response.data.user.avatar);
      setIsEditing(false);
      
      // Update current user state if it's the logged-in user's profile
      if (isOwnProfile && setUser) {
        setUser((prev) => ({
          ...prev,
          avatar: response.data.user.avatar,
          bio: response.data.user.bio,
        }));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <Link to="/" className="back-link">
          Go back home
        </Link>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          {isEditing ? (
            <div className="avatar-edit">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt={profileUser.username}
                className="profile-avatar-large"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="avatar-upload-label">
                Change Avatar
              </label>
            </div>
          ) : (
            <img
              src={profileUser.avatar || "/default-avatar.png"}
              alt={profileUser.username}
              className="profile-avatar-large"
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234ECDC4'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E" +
                  (profileUser.username?.[0]?.toUpperCase() || "U") +
                  "%3C/text%3E%3C/svg%3E";
              }}
            />
          )}
        </div>

        <div className="profile-info">
          <h1>{profileUser.username}</h1>
          {isOwnProfile && !isEditing && (
            <button onClick={handleEdit} className="edit-profile-btn">
              Edit Profile
            </button>
          )}
          {isEditing && (
            <div className="edit-actions">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="save-btn"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          )}
          <p className="profile-joined">
            Joined {formatDate(profileUser.createdAt)}
          </p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-bio-section">
          <h2>About</h2>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              className="bio-textarea"
              rows="4"
            />
          ) : (
            <p className="profile-bio">
              {profileUser.bio || "No bio yet."}
            </p>
          )}
        </div>

        <div className="profile-polls-section">
          <h2>Polls Created ({polls.length})</h2>
          {polls.length === 0 ? (
            <p className="no-polls">No polls created yet.</p>
          ) : (
            <div className="polls-grid">
              {polls.map((poll) => (
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
                  <div className="poll-card-content">
                    <h3>{poll.title}</h3>
                    <div className="poll-meta">
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          poll.status
                        )}`}
                      >
                        {getStatusLabel(poll.status)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

