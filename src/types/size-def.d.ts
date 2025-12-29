export interface SizeDef {
  id: number;
  name: string;
  description: string;
  genderType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSizeDefDTO {
  name: string;
  description: string;
  genderType: string;
}

export interface UpdateSizeDefDTO {
  name?: string;
  description?: string;
  genderType?: string;
}
