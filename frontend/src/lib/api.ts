const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (stored) headers["Authorization"] = `Bearer ${stored}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...fetchOptions,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // Auth
  register(data: { email: string; password: string; firstName: string; lastName: string; hometown: string; currentCity: string }) {
    return this.request<{ user: any; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) });
  }

  // Users
  getMe() {
    return this.request<any>("/users/me");
  }

  updateProfile(data: Record<string, unknown>) {
    return this.request<any>("/users/me", { method: "PUT", body: JSON.stringify(data) });
  }

  getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  searchUsers(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/users?${qs}`);
  }

  // Posts
  createPost(data: { type?: string; title?: string; body: string; city: string; tags?: string[] }) {
    return this.request<any>("/posts", { method: "POST", body: JSON.stringify(data) });
  }

  getPosts(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/posts?${qs}`);
  }

  getPost(id: string) {
    return this.request<any>(`/posts/${id}`);
  }

  deletePost(id: string) {
    return this.request<void>(`/posts/${id}`, { method: "DELETE" });
  }

  addComment(postId: string, body: string) {
    return this.request<any>(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ body }) });
  }

  // Events
  getEvents(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/events?${qs}`);
  }

  createEvent(data: Record<string, unknown>) {
    return this.request<any>("/events", { method: "POST", body: JSON.stringify(data) });
  }

  rsvpEvent(eventId: string, status: string) {
    return this.request<any>(`/events/${eventId}/rsvp`, { method: "POST", body: JSON.stringify({ status }) });
  }

  // Matching
  getMatches(limit = 20) {
    return this.request<any>(`/matching?limit=${limit}`);
  }

  generateIntro(targetUserId: string) {
    return this.request<{ message: string }>(`/matching/introduce/${targetUserId}`, { method: "POST" });
  }

  sendConnection(targetUserId: string) {
    return this.request<any>(`/matching/connect/${targetUserId}`, { method: "POST" });
  }

  endorse(targetUserId: string, category: string, message?: string) {
    return this.request<any>(`/matching/endorse/${targetUserId}`, { method: "POST", body: JSON.stringify({ category, message }) });
  }
}

export const api = new ApiClient(API_URL);
