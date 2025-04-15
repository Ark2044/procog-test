// Common validation constants and functions
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;
export const DEPARTMENT_REGEX = /^[a-zA-Z0-9\s'-]{2,50}$/;
export const TEXT_WITH_NO_SPECIAL_CHARS_REGEX = /^[a-zA-Z0-9\s'-]+$/;

// Department and role constants
export const DEFAULT_DEPARTMENTS = [
  "general",
  "engineering",
  "sales",
  "marketing",
  "hr",
  "it",
  "finance",
  "operations",
] as const;

// Instead of VALID_DEPARTMENTS, we'll use getDepartments() function that can be updated dynamically
export let CUSTOM_DEPARTMENTS: string[] = [];

// Function to add a custom department
export const addCustomDepartment = (department: string): void => {
  if (!CUSTOM_DEPARTMENTS.includes(department)) {
    CUSTOM_DEPARTMENTS.push(department);
  }
};

// Function to remove a custom department
export const removeCustomDepartment = (department: string): void => {
  CUSTOM_DEPARTMENTS = CUSTOM_DEPARTMENTS.filter((dept) => dept !== department);
};

// Function to get all valid departments
export const getAllDepartments = (): string[] => {
  return [...DEFAULT_DEPARTMENTS, ...CUSTOM_DEPARTMENTS];
};

export const VALID_ROLES = ["user", "admin"] as const;
export const VALID_IMPACTS = ["low", "medium", "high"] as const;
export const VALID_ACTIONS = [
  "mitigate",
  "accept",
  "transfer",
  "avoid",
] as const;
const VALID_STATUSES = ["active", "closed", "resolved"] as const;

// Validation types
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// Validation functions
export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: false, error: "Email is required" };
  const trimmedEmail = email.trim();
  if (!trimmedEmail)
    return {
      isValid: false,
      error: "Email cannot be empty or whitespace only",
    };
  if (!STRICT_EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: "Invalid email format" };
  }
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) return { isValid: false, error: "Name is required" };
  const trimmedName = name.trim();
  if (!trimmedName)
    return { isValid: false, error: "Name cannot be empty or whitespace only" };
  if (!NAME_REGEX.test(trimmedName))
    return {
      isValid: false,
      error:
        "Name must be 2-50 characters and contain only letters, spaces, hyphens and apostrophes",
    };
  return { isValid: true };
};

// Generic string validation function
export const validateString = (
  value: string,
  fieldName: string,
  {
    required = true,
    minLength = 1,
    maxLength = 500,
    regex = null,
    errorMessage = null,
    minMeaningfulChars = 3,
    blockSingleChar = true,
  }: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    regex?: RegExp | null;
    errorMessage?: string | null;
    minMeaningfulChars?: number;
    blockSingleChar?: boolean;
  } = {}
): ValidationResult => {
  // Check if value exists when required
  if (required && !value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  // If optional and empty, it's valid
  if (!required && !value) {
    return { isValid: true };
  }

  const trimmed = value.trim();

  // Check for whitespace-only
  if (required && !trimmed) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty or whitespace only`,
    };
  }

  // Block inputs that are just a single character like "." or "-"
  if (blockSingleChar && trimmed.length === 1) {
    return {
      isValid: false,
      error: `${fieldName} cannot be a single character`,
    };
  }

  // Check minimum length
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} character${
        minLength !== 1 ? "s" : ""
      }`,
    };
  }

  // Check maximum length
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    };
  }

  // Ensure the input has enough meaningful characters (not just repeated chars or punctuation)
  const meaningfulChars = trimmed.replace(
    /\s+|[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
    ""
  );
  if (meaningfulChars.length < minMeaningfulChars) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least ${minMeaningfulChars} meaningful characters`,
    };
  }

  // Check regex pattern if provided
  if (regex && !regex.test(trimmed)) {
    return {
      isValid: false,
      error: errorMessage || `${fieldName} contains invalid characters`,
    };
  }

  return { isValid: true };
};

export const validateDepartment = (department: string): ValidationResult => {
  if (!department) return { isValid: false, error: "Department is required" };
  const trimmedDepartment = department.trim();
  if (!trimmedDepartment)
    return {
      isValid: false,
      error: "Department cannot be empty or whitespace only",
    };

  // Check if department is in the list of valid departments
  if (!getAllDepartments().includes(trimmedDepartment)) {
    return { isValid: false, error: "Invalid department" };
  }

  return { isValid: true };
};

export const validateNewDepartment = (department: string): ValidationResult => {
  if (!department)
    return { isValid: false, error: "Department name is required" };

  const trimmedDepartment = department.trim();
  if (!trimmedDepartment)
    return {
      isValid: false,
      error: "Department name cannot be empty or whitespace only",
    };

  if (!DEPARTMENT_REGEX.test(trimmedDepartment))
    return {
      isValid: false,
      error:
        "Department name must be 2-50 characters and contain only letters, numbers, spaces, hyphens and apostrophes",
    };

  if (getAllDepartments().includes(trimmedDepartment)) {
    return { isValid: false, error: "Department already exists" };
  }

  return { isValid: true };
};

export const validateRole = (role: string): ValidationResult => {
  if (!role) return { isValid: false, error: "Role is required" };
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
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
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  department?: string;
  isConfidential?: boolean;
  authorizedViewers?: string[];
  dueDate?: string;
  status?: string;
  resolution?: string;
}

export const validateDate = (dateString?: string): ValidationResult => {
  if (!dateString) return { isValid: true };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }
  return { isValid: true };
};

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
  if (!VALID_IMPACTS.includes(risk.impact as (typeof VALID_IMPACTS)[number])) {
    return { isValid: false, error: "Invalid impact value" };
  }
  if (
    typeof risk.probability !== "number" ||
    risk.probability < 0 ||
    risk.probability > 5
  ) {
    return { isValid: false, error: "Probability must be between 0 and 5" };
  }
  if (!VALID_ACTIONS.includes(risk.action as (typeof VALID_ACTIONS)[number])) {
    return { isValid: false, error: "Invalid action value" };
  }

  // Validate strategy based on action type
  if (risk.action === "mitigate" && !risk.mitigation?.trim()) {
    return {
      isValid: false,
      error: "Mitigation strategy is required when action is mitigate",
    };
  }
  if (risk.action === "accept" && !risk.acceptance?.trim()) {
    return {
      isValid: false,
      error: "Acceptance strategy is required when action is accept",
    };
  }
  if (risk.action === "transfer" && !risk.transfer?.trim()) {
    return {
      isValid: false,
      error: "Transfer strategy is required when action is transfer",
    };
  }
  if (risk.action === "avoid" && !risk.avoidance?.trim()) {
    return {
      isValid: false,
      error: "Avoidance strategy is required when action is avoid",
    };
  }

  if (
    risk.isConfidential &&
    (!risk.authorizedViewers || risk.authorizedViewers.length === 0)
  ) {
    return {
      isValid: false,
      error: "Authorized viewers are required for confidential risks",
    };
  }
  if (
    risk.status &&
    !VALID_STATUSES.includes(risk.status as (typeof VALID_STATUSES)[number])
  ) {
    return { isValid: false, error: "Invalid status value" };
  }
  if (risk.status === "closed" && !risk.resolution?.trim()) {
    return {
      isValid: false,
      error: "Resolution is required when closing a risk",
    };
  }

  // Validate due date format if provided
  if (risk.dueDate) {
    const dateValidation = validateDate(risk.dueDate);
    if (!dateValidation.isValid) return dateValidation;
  }

  if (risk.status === "closed") {
    if (!risk.resolution?.trim()) {
      return {
        isValid: false,
        error: "Resolution is required when closing a risk",
      };
    }
    // Validate that dueDate is updated when closing early
    if (risk.dueDate) {
      const dueDate = new Date(risk.dueDate);
      const now = new Date();
      if (dueDate > now) {
        return {
          isValid: false,
          error: "Due date must be updated to current date when closing early",
        };
      }
    }
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
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  attachmentId?: string;
  dueDate?: string;
  status?: string;
  resolution?: string;
}

export const validateRiskDetail = (
  risk: RiskDetailValidationInput
): ValidationResult => {
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
  if (!VALID_IMPACTS.includes(risk.impact as (typeof VALID_IMPACTS)[number])) {
    return { isValid: false, error: "Invalid impact value" };
  }
  if (
    typeof risk.probability !== "number" ||
    risk.probability < 0 ||
    risk.probability > 5
  ) {
    return { isValid: false, error: "Probability must be between 0 and 5" };
  }
  if (!VALID_ACTIONS.includes(risk.action as (typeof VALID_ACTIONS)[number])) {
    return { isValid: false, error: "Invalid action value" };
  }

  // Validate strategy based on action type
  if (risk.action === "mitigate" && !risk.mitigation?.trim()) {
    return {
      isValid: false,
      error: "Mitigation strategy is required when action is mitigate",
    };
  }
  if (risk.action === "accept" && !risk.acceptance?.trim()) {
    return {
      isValid: false,
      error: "Acceptance strategy is required when action is accept",
    };
  }
  if (risk.action === "transfer" && !risk.transfer?.trim()) {
    return {
      isValid: false,
      error: "Transfer strategy is required when action is transfer",
    };
  }
  if (risk.action === "avoid" && !risk.avoidance?.trim()) {
    return {
      isValid: false,
      error: "Avoidance strategy is required when action is avoid",
    };
  }

  if (risk.tags) {
    for (const tag of risk.tags) {
      if (tag.length > 50) {
        return { isValid: false, error: "Tags must be 50 characters or less" };
      }
    }
  }
  if (
    risk.status &&
    !VALID_STATUSES.includes(risk.status as (typeof VALID_STATUSES)[number])
  ) {
    return { isValid: false, error: "Invalid status value" };
  }
  if (risk.status === "closed" && !risk.resolution?.trim()) {
    return {
      isValid: false,
      error: "Resolution is required when closing a risk",
    };
  }
  return { isValid: true };
};

// Attachment validation
export interface AttachmentValidationInput {
  file: File | Blob;
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'application/pdf']
}

export const validateAttachment = (
  input: AttachmentValidationInput,
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
): ValidationResult => {
  if (!input.file) {
    return { isValid: false, error: "File is required" };
  }

  if (input.file.size > (input.maxSize || maxSize)) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(
        (input.maxSize || maxSize) / (1024 * 1024)
      )}MB`,
    };
  }

  const types = input.allowedTypes || allowedTypes;
  if (!types.includes(input.file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${types.join(", ")}`,
    };
  }

  return { isValid: true };
};

// Comment validation
export interface CommentValidationInput {
  content: string;
  type: "answer" | "question";
  typeId: string;
}

export const validateComment = (
  comment: CommentValidationInput
): ValidationResult => {
  if (!comment.content?.trim()) {
    return { isValid: false, error: "Comment content is required" };
  }
  if (comment.content.length > 10000) {
    return {
      isValid: false,
      error: "Comment must be 10000 characters or less",
    };
  }
  if (!["answer", "question"].includes(comment.type)) {
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

export const validateSolution = (
  solution: SolutionValidationInput
): ValidationResult => {
  if (!solution.content?.trim()) {
    return { isValid: false, error: "Solution content is required" };
  }
  if (solution.content.length > 10000) {
    return {
      isValid: false,
      error: "Solution must be 10000 characters or less",
    };
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

export const validateProfile = (
  profile: ProfileValidationInput
): ValidationResult => {
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

export const validateAdminUpdate = (
  update: AdminUpdateValidationInput
): ValidationResult => {
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
    return {
      isValid: false,
      error: "At least one field (role or department) must be updated",
    };
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
      error:
        "Password must contain uppercase, lowercase, numbers, and special characters",
    };
  }

  return { isValid: true };
};
