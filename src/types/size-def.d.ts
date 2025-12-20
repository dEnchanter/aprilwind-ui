export interface SizeDef {
  id: number;
  size: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSizeDefDTO {
  size: number;
  name?: string;
  description?: string;
}

export interface UpdateSizeDefDTO {
  size?: number;
  name?: string;
  description?: string;
}
