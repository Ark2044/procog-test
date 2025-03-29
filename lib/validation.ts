// Common validation constants and functions
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

// Department and role constants
export const VALID_DEPARTMENTS = ['general', 'engineering', 'sales', 'marketing', 'hr'] as const;
export const VALID_ROLES = ['user', 'admin'] as const;
export const VALID_IMPACTS = ['low', 'medium', 'high'] as const;
export const VALID_ACTIONS = ['mitigate', 'accept', 'transfer', 'avoid'] as const;

// Validation types
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// Validation functions
export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: false, error: "Email is required" };
  if (!EMAIL_REGEX.test(email)) return { isValid: false, error: "Invalid email format" };
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) return { isValid: false, error: "Name is required" };
  if (!NAME_REGEX.test(name)) return { 
    isValid: false, 
    error: "Name must be 2-50 characters and contain only letters, spaces, hyphens and apostrophes" 
  };
  return { isValid: true };
};

export const validateDepartment = (department: string): ValidationResult => {
  if (!department) return { isValid: false, error: "Department is required" };
  if (!VALID_DEPARTMENTS.includes(department as any)) {
    return { isValid: false, error: "Invalid department" };
  }
  return { isValid: true };
};

export const validateRole = (role: string): ValidationResult => {
  if (!role) return { isValid: false, error: "Role is required" };
  if (!VALID_ROLES.includes(role as any)) {
    return { isValid: false, error: "Invalid role" };
  }
  return { isValid: true };
};

// Risk validation
export interface RiskValidationInput {
  title: string;
  content: string;
  impact: string;
  probability: number;
  action: string;
  mitigation?: string;
  department?: string;
  isConfidential?: boolean;
  authorizedViewers?: string[];
}

export const validateRisk = (risk: RiskValidationInput): ValidationResult => {
  if (!risk.title?.trim()) {
    return { isValid: false, error: "Title is required" };
  }
  if (risk.title.length > 100) {
    return { isValid: false, error: "Title must be 100 characters or less" };
  }
  if (!risk.content?.trim()) {
    return { isValid: false, error: "Content is required" };
  }
  if (risk.content.length > 1000) {
    return { isValid: false, error: "Content must be 1000 characters or less" };
  }
  if (!VALID_IMPACTS.includes(risk.impact as any)) {
    return { isValid: false, error: "Invalid impact value" };
  }
  if (typeof risk.probability !== 'number' || risk.probability < 0 || risk.probability > 5) {
    return { isValid: false, error: "Probability must be between 0 and 5" };
  }
  if (!VALID_ACTIONS.includes(risk.action as any)) {
    return { isValid: false, error: "Invalid action value" };
  }
  if (risk.action === 'mitigate' && !risk.mitigation?.trim()) {
    return { isValid: false, error: "Mitigation strategy is required when action is mitigate" };
  }
  if (risk.isConfidential && (!risk.authorizedViewers || risk.authorizedViewers.length === 0)) {
    return { isValid: false, error: "Authorized viewers are required for confidential risks" };
  }
  return { isValid: true };
};

// Risk detail validation
export interface RiskDetailValidationInput {
  title: string;
  content: string;
  tags?: string[];
  impact: string;
  probability: number;
  action: string;
  mitigation?: string;
  attachmentId?: string;
}

export const validateRiskDetail = (risk: RiskDetailValidationInput): ValidationResult => {
  if (!risk.title?.trim()) {
    return { isValid: false, error: "Title is required" };
  }
  if (risk.title.length > 100) {
    return { isValid: false, error: "Title must be 100 characters or less" };
  }
  if (!risk.content?.trim()) {
    return { isValid: false, error: "Content is required" };
  }
  if (risk.content.length > 1000) {
    return { isValid: false, error: "Content must be 1000 characters or less" };
  }
  if (!VALID_IMPACTS.includes(risk.impact as any)) {
    return { isValid: false, error: "Invalid impact value" };
  }
  if (typeof risk.probability !== 'number' || risk.probability < 0 || risk.probability > 5) {
    return { isValid: false, error: "Probability must be between 0 and 5" };
  }
  if (!VALID_ACTIONS.includes(risk.action as any)) {
    return { isValid: false, error: "Invalid action value" };
  }
  if (risk.action === 'mitigate' && !risk.mitigation?.trim()) {
    return { isValid: false, error: "Mitigation strategy is required when action is mitigate" };
  }
  if (risk.tags) {
    for (const tag of risk.tags) {
      if (tag.length > 50) {
        return { isValid: false, error: "Tags must be 50 characters or less" };
      }
    }
  }
  return { isValid: true };
};

// Attachment validation
export interface AttachmentValidationInput {
  file: File;
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'application/pdf']
}

export const validateAttachment = (
  input: AttachmentValidationInput,
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): ValidationResult => {
  if (!input.file) {
    return { isValid: false, error: "File is required" };
  }

  if (input.file.size > (input.maxSize || maxSize)) {
    return { 
      isValid: false, 
      error: `File size must be less than ${Math.round((input.maxSize || maxSize) / (1024 * 1024))}MB` 
    };
  }

  const types = input.allowedTypes || allowedTypes;
  if (!types.includes(input.file.type)) {
    return { 
      isValid: false, 
      error: `File type must be one of: ${types.join(', ')}` 
    };
  }

  return { isValid: true };
};

// Comment validation
export interface CommentValidationInput {
  content: string;
  type: 'answer' | 'question';
  typeId: string;
}

export const validateComment = (comment: CommentValidationInput): ValidationResult => {
  if (!comment.content?.trim()) {
    return { isValid: false, error: "Comment content is required" };
  }
  if (comment.content.length > 10000) {
    return { isValid: false, error: "Comment must be 10000 characters or less" };
  }
  if (!['answer', 'question'].includes(comment.type)) {
    return { isValid: false, error: "Invalid comment type" };
  }
  if (!comment.typeId) {
    return { isValid: false, error: "Type ID is required" };
  }
  return { isValid: true };
};

// Solution validation
export interface SolutionValidationInput {
  content: string;
  riskId: string;
}

export const validateSolution = (solution: SolutionValidationInput): ValidationResult => {
  if (!solution.content?.trim()) {
    return { isValid: false, error: "Solution content is required" };
  }
  if (solution.content.length > 10000) {
    return { isValid: false, error: "Solution must be 10000 characters or less" };
  }
  if (!solution.riskId) {
    return { isValid: false, error: "Risk ID is required" };
  }
  return { isValid: true };
};

// Profile validation
export interface ProfileValidationInput {
  name: string;
  email: string;
  department?: string;
  role?: string;
}

export const validateProfile = (profile: ProfileValidationInput): ValidationResult => {
  const nameValidation = validateName(profile.name);
  if (!nameValidation.isValid) return nameValidation;

  const emailValidation = validateEmail(profile.email);
  if (!emailValidation.isValid) return emailValidation;

  if (profile.department) {
    const deptValidation = validateDepartment(profile.department);
    if (!deptValidation.isValid) return deptValidation;
  }

  if (profile.role) {
    const roleValidation = validateRole(profile.role);
    if (!roleValidation.isValid) return roleValidation;
  }

  return { isValid: true };
};

// Admin user update validation
export interface AdminUpdateValidationInput {
  userId: string;
  role?: string;
  department?: string;
}

export const validateAdminUpdate = (update: AdminUpdateValidationInput): ValidationResult => {
  if (!update.userId) {
    return { isValid: false, error: "User ID is required" };
  }

  if (update.role) {
    const roleValidation = validateRole(update.role);
    if (!roleValidation.isValid) return roleValidation;
  }

  if (update.department) {
    const deptValidation = validateDepartment(update.department);
    if (!deptValidation.isValid) return deptValidation;
  }

  if (!update.role && !update.department) {
    return { isValid: false, error: "At least one field (role or department) must be updated" };
  }

  return { isValid: true };
};

// Auth validation
export interface AuthValidationInput {
  email: string;
  password: string;
  name?: string;
}

export const validateAuth = (auth: AuthValidationInput): ValidationResult => {
  if (auth.name !== undefined) {
    const nameValidation = validateName(auth.name);
    if (!nameValidation.isValid) return nameValidation;
  }

  const emailValidation = validateEmail(auth.email);
  if (!emailValidation.isValid) return emailValidation;

  if (!auth.password) {
    return { isValid: false, error: "Password is required" };
  }
  if (auth.password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  // Add more password requirements if needed
  const hasUpperCase = /[A-Z]/.test(auth.password);
  const hasLowerCase = /[a-z]/.test(auth.password);
  const hasNumbers = /\d/.test(auth.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(auth.password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return { 
      isValid: false, 
      error: "Password must contain uppercase, lowercase, numbers, and special characters" 
    };
  }

  return { isValid: true };
};