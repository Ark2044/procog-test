export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  prefs: Record<string, string | number | boolean>;
  department?: string;
  role?: string;
  reputation?: number;
}
