import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import "./CreatePollStyles.css";

const CreatePoll = ({ user }) => {
  const [formData, setFormData] = useState({
    title: "",
    options: [{ text: "", image: null }, { text: "", image: null }],
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [optionImagePreviews, setOptionImagePreviews] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title }));
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: "" }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData((prev) => ({ ...prev, options: newOptions }));
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleOptionImageChange = (index, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          [`optionImage${index}`]: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [`optionImage${index}`]: "Image size must be less than 5MB",
        }));
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], image: base64String };
        setFormData((prev) => ({ ...prev, options: newOptions }));
        setOptionImagePreviews((prev) => ({
          ...prev,
          [index]: base64String,
        }));
        if (errors[`optionImage${index}`]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`optionImage${index}`];
            return newErrors;
          });
        }
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          [`optionImage${index}`]: "Failed to read image file",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (index) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], image: null };
    setFormData((prev) => ({ ...prev, options: newOptions }));
    setOptionImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    // Reset file input
    const fileInput = document.getElementById(`option-image-${index}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", image: null }],
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, options: newOptions }));
      setOptionImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        // Reindex remaining previews
        const reindexed = {};
        Object.keys(newPreviews).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            reindexed[keyIndex - 1] = newPreviews[key];
          } else if (keyIndex < index) {
            reindexed[keyIndex] = newPreviews[key];
          }
        });
        return reindexed;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: "" }));
        }
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          image: "Failed to read image file",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Poll title is required";
    }

    const validOptions = formData.options.filter(
      (opt) => opt.text && opt.text.trim().length > 0
    );

    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    // Check for duplicate option texts
    const optionTexts = validOptions.map((opt) => opt.text.trim());
    const uniqueTexts = [...new Set(optionTexts)];
    if (uniqueTexts.length !== optionTexts.length) {
      newErrors.options = "Poll options must be unique";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/polls`,
        {
          title: formData.title.trim(),
          options: formData.options
            .filter((opt) => opt.text && opt.text.trim().length > 0)
            .map((opt) => ({
              text: opt.text.trim(),
              image: opt.image || null,
            })),
          image: formData.image,
        },
        { withCredentials: true }
      );

      setSuccessMessage("Poll created successfully!");
      setFormData({
        title: "",
        options: [{ text: "", image: null }, { text: "", image: null }],
        image: null,
      });
      setImagePreview(null);
      setOptionImagePreviews({});

      // Optionally redirect to a poll management page or show success
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: "An error occurred while creating the poll" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-poll-container">
      <div className="create-poll-form">
        <h2>Create a New Poll</h2>

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Poll Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g., What should we have for lunch?"
              className={errors.title ? "error" : ""}
            />
            {errors.title && (
              <span className="error-text">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="image-upload">Poll Image (Optional):</label>
            <div className="image-upload-section">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
              {imagePreview && (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-btn"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              {errors.image && (
                <span className="error-text">{errors.image}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Poll Options:</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-container">
                <div className="option-input-group">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={errors.options ? "error" : ""}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="remove-option-btn"
                      aria-label="Remove option"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="option-image-section">
                  <input
                    type="file"
                    id={`option-image-${index}`}
                    accept="image/*"
                    onChange={(e) =>
                      handleOptionImageChange(index, e.target.files[0])
                    }
                    className="option-image-input"
                  />
                  {optionImagePreviews[index] && (
                    <div className="option-image-preview-container">
                      <img
                        src={optionImagePreviews[index]}
                        alt={`Option ${index + 1} preview`}
                        className="option-image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionImage(index)}
                        className="remove-option-image-btn"
                        aria-label="Remove option image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {errors[`optionImage${index}`] && (
                    <span className="error-text">
                      {errors[`optionImage${index}`]}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {errors.options && (
              <span className="error-text">{errors.options}</span>
            )}
            <button
              type="button"
              onClick={addOption}
              className="add-option-btn"
            >
              + Add Option
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Poll"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;

