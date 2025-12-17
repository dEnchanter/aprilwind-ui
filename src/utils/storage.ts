/* eslint-disable @typescript-eslint/no-explicit-any */
interface UserData {
  email: string;
  phoneNumber: string;
  staffName: string;
}

export const saveAccessToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const clearAccessToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const saveRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', token);
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const clearRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
  }
};

export const saveUserData = (response: { data: any }): void => {
  if (typeof window !== 'undefined') {
    const { email, phoneNumber, staffName } = response.data;

    const userData: UserData = { email, phoneNumber, staffName };

    localStorage.setItem("user", JSON.stringify(userData));
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) as UserData : null;
  }
  return null;
};

export const clearUserData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const saveUserRoleDetail = (role: Role): void => {
  const userRoleDetailString = JSON.stringify(role);
  localStorage.setItem('userRole', userRoleDetailString);
};

export const getUserRoleDetail = (): Role | null => {
  // This checks to ensure code runs only in a client-side environment
  if (typeof window === 'undefined') {
    return null;
  }

  const userRoleString = localStorage.getItem('userRole');
  if (userRoleString) {
    try {
      const userRoleData: Role = JSON.parse(userRoleString);
      return userRoleData;
    } catch (error) {
      console.error("Error parsing user role from local storage:", error);
      return null;
    }
  } else {
    return null;
  }
};

export const clearUserRoleDetail = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
  }
};
