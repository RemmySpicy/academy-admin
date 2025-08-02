// Validation utilities

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value: any): string | undefined => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return undefined;
};

export const validatePhone = (phone: string): string | undefined => {
  if (!phone) return 'Phone number is required';
  if (!isValidPhone(phone)) return 'Please enter a valid Nigerian phone number';
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!isValidPassword(password)) {
    return 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number';
  }
  return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return undefined;
};

export const validateAge = (birthDate: string): string | undefined => {
  if (!birthDate) return 'Date of birth is required';
  
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    // Haven't had birthday this year yet
    const actualAge = age - 1;
    if (actualAge < 3) return 'Must be at least 3 years old';
    if (actualAge > 100) return 'Please enter a valid date of birth';
  } else {
    if (age < 3) return 'Must be at least 3 years old';
    if (age > 100) return 'Please enter a valid date of birth';
  }
  
  return undefined;
};

export const validateFileSize = (fileSize: number, maxSizeInMB: number = 5): string | undefined => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (fileSize > maxSizeInBytes) {
    return `File size must be less than ${maxSizeInMB}MB`;
  }
  return undefined;
};

export const validateImageType = (fileName: string): string | undefined => {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    return 'Only JPG, PNG, and GIF files are allowed';
  }
  return undefined;
};