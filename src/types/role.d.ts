type Permission = {
  id: number;
  name: string;
  description: string;
};

type Role = {
  id: number;
  name: string;
  description: string;
  isLogin: boolean;
  permissions?: Permission[];
};