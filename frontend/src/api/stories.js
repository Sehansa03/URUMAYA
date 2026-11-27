
import api, { publicApi } from "./client";

// PUBLIC

export const getStories = async (params = {}) => {
  const response = await publicApi.get("/stories", { params });
  return response.data;
};

export const getStoryBySlug = async (slug) => {
  const response = await publicApi.get(
    `/stories/${encodeURIComponent(slug)}`
  );
  return response.data;
};

// STAFF / ADMIN

export const getManagedStories = async (params = {}) => {
  const response = await api.get("/stories/manage", {
    params,
  });
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await api.post("/stories", storyData);
  return response.data;
};

export const updateStory = async (storyId, storyData) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}`,
    storyData
  );
  return response.data;
};

export const submitStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/submit`
  );
  return response.data;
};

export const approveStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/approve`
  );
  return response.data;
};

export const rejectStory = async (storyId) => {
  const response = await api.patch(
    `/stories/${encodeURIComponent(storyId)}/reject`
  );
  return response.data;
};

// CLOUDINARY IMAGE UPLOAD

export const uploadStoryImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    "/stories/uploads",
    formData
  );

  return response.data;
};
