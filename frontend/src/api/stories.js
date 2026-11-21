
import api from "./client";

// ==========================================
// PUBLIC HERITAGE STORIES
// ==========================================

// Get published stories with optional filters
export const getStories = async (params = {}) => {
  const response = await api.get("/stories", {
    params,
  });

  return response.data;
};

// Get one published story by slug
export const getStoryBySlug = async (slug) => {
  const response = await api.get(
    `/stories/${encodeURIComponent(slug)}`
  );

  return response.data;
};

// ==========================================
// STAFF & ADMIN STORY MANAGEMENT
// ==========================================

// Staff: own stories
// Admin: all stories
export const getManagedStories = async (params = {}) => {
  const response = await api.get("/stories/manage", {
    params,
  });

  return response.data;
};

// Create a new story draft
export const createStory = async (storyData) => {
  const response = await api.post(
    "/stories",
    storyData
  );

  return response.data;
};

// Update an existing story
export const updateStory = async (storyId, storyData) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}`,
    storyData
  );

  return response.data;
};

// Submit a draft or rejected story for approval
export const submitStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/submit`
  );

  return response.data;
};

// Admin: approve a pending story
export const approveStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/approve`
  );

  return response.data;
};

// Admin: reject a pending story
export const rejectStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/reject`
  );

  return response.data;
};
