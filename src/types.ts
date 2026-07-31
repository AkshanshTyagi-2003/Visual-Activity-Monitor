export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  url: string;
  title: string;
  activeTime: number; // in seconds
  timestamp: string;
  createdAt: string;
}

export interface Screenshot {
  id: string;
  userId: string;
  imageUrl: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
  createdAt: string;
}

export interface DashboardStats {
  totalActivities: number;
  totalScreenshots: number;
  totalActiveTimeSeconds: number;
  mostVisitedWebsites: { domain: string; count: number; totalTimeSeconds: number }[];
  todayActivityCount: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
