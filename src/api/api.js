import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({ 
  baseURL: BASE_URL,
  withCredentials: true
});

// Convert technical API errors into human-readable messages
const humanizeError = (error) => {
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  const status = error.response?.status;
  const serverMsg = error.response?.data?.message || error.response?.data;

  const knownMessages = {
    400: serverMsg || "Some of the information you entered doesn't look right. Please review and try again.",
    401: "Your session has expired or your login details are incorrect. Please sign in again.",
    403: serverMsg === "PAYMENT_REQUIRED" ? "PAYMENT_REQUIRED" : "You don't have permission to do that. If you think this is a mistake, contact support.",
    404: "We couldn't find what you were looking for. It may have been removed or the link is incorrect.",
    409: serverMsg || "This item already exists. Please check for duplicates before submitting.",
    422: serverMsg || "Some required fields are missing or have invalid values. Please review your input.",
    429: "Too many requests. Please wait a moment before trying again.",
    500: "Something went wrong on our end. Please try again in a few minutes.",
    503: "The service is temporarily unavailable. Please try again shortly.",
  };

  return knownMessages[status] || serverMsg || "An unexpected error occurred. Please try again.";
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = async (data) => {
  try {
    const res = await api.post("/api/auth/register", data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post("/api/auth/login", data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/api/cookies/clear");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

// ─── Posts ────────────────────────────────────────────────────────────────────
export const getActivePosts = async (university, category) => {
  try {
    const res = await api.get(`/api/posts/active/${encodeURIComponent(university)}`);
    let data = res.data || [];
    if (category) {
      data = data.filter(p => p.category === category);
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getPendingPosts = async (university) => {
  try {
    const res = await api.get(`/api/posts/pending/${encodeURIComponent(university)}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const createPost = async (data) => {
  try {
    const res = await api.post("/api/posts/create", data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const uploadPostImages = async (formData) => {
  try {
    const res = await api.post("/api/posts/upload-images", formData);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const updatePostStatus = async (id, status) => {
  try {
    const res = await api.put(`/api/posts/${id}/status`, { status });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const reportPost = async (id, data) => {
  try {
    const res = await api.post(`/api/reports/${id}`, data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getAdminReports = async (university) => {
  try {
    const res = await api.get(`/api/reports/university/${encodeURIComponent(university)}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const resolveReport = async (id, status) => {
  try {
    const res = await api.put(`/api/reports/${id}/status`, { status });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const deletePost = async (id) => {
  try {
    const res = await api.delete(`/api/posts/${id}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const addReview = async (postId, data) => {
  try {
    const res = await api.post(`/api/posts/${postId}/reviews`, data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getReviews = async (postId) => {
  try {
    const res = await api.get(`/api/posts/${postId}/reviews`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};


// ─── Master Admin ─────────────────────────────────────────────────────────────
export const getAdminRequests = async () => {
  try {
    const res = await api.get("/api/admin/requests");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const approveAdminRequest = async (id) => {
  try {
    const res = await api.put(`/api/admin/requests/${id}/approve`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const submitAdminRequest = async (formData) => {
  try {
    const res = await api.post("/api/admin/requests", formData);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getMyAdminRequestStatus = async () => {
  try {
    const res = await api.get("/api/admin/requests/my-status");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getPlatformStats = async () => {
  try {
    const res = await api.get("/api/admin/stats");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getActiveAdmins = async () => {
  try {
    const res = await api.get("/api/master/admins");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const downgradeAdmin = async (id) => {
  try {
    const res = await api.put(`/api/master/admins/${id}/downgrade`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const deleteAdmin = async (id) => {
  try {
    const res = await api.delete(`/api/master/admins/${id}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};

export const getAdminActivities = async (id) => {
  try {
    const res = await api.get(`/api/master/admins/${id}/activities`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: humanizeError(err) };
  }
};
