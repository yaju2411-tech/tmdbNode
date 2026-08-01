export interface UserSubscription {
  status: "active" | "expired" | "none" | "cancelled" | "pending";
  plan?: "monthly" | "quarterly" | "yearly" | "none";
  startDate?: string | Date;
  expiresAt?: string | Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface UserAvatar {
  url: string;
  public_id?: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  avatar?: UserAvatar;
  isEmailVerified?: boolean;
  isCaptchaVerified?: boolean;
  subscription?: UserSubscription;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProfile {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
}
