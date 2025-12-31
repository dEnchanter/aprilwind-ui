/* eslint-disable @typescript-eslint/no-explicit-any */

// Production stages
type ProductionStage =
  | 'bidding'
  | 'in_production'
  | 'await_qa'
  | 'rejected'
  | 'completed';

// Production entity
interface Production {
  id: number;
  productionCode: string;
  productForProductionId: number;
  tailorId: number | null;
  currentStage: ProductionStage;
  dateStarted: string;
  dateCompleted: string | null;
  productDefId: number;
  quantity: Array<{
    size: number;
    quantity: number;
  }>;
  isCompleted: boolean;
  movedToStock: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  productForProduction?: any;
  tailor?: {
    id: number;
    staffName: string;
    email: string;
    phoneNumber: string;
  };
  productDef?: {
    id: number;
    name: string;
    code: string;
    cost: number;
  };
  stageHistory?: Array<{
    id: number;
    stage: ProductionStage;
    notes: string | null;
    createdAt: string;
  }>;
}

// Production stage history
interface ProductionStageHistory {
  id: number;
  productionId: number;
  stage: ProductionStage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Production timeline item
interface ProductionTimelineItem {
  id: number;
  event: string;
  description: string;
  createdAt: string;
  performedBy?: {
    id: number;
    staffName: string;
  };
}

// Production analytics
interface ProductionAnalytics {
  totalProductions: number;
  completedProductions: number;
  inProgressProductions: number;
  averageCompletionTime: number;
  byStage: {
    bidding: number;
    in_production: number;
    await_qa: number;
    rejected: number;
    completed: number;
  };
  byTailor: Array<{
    tailorId: number;
    tailorName: string;
    productionCount: number;
    completedCount: number;
  }>;
}

// API Request/Response types
interface CreateProductionRequest {
  code: string;
  prodRequestedId: number; // Product for Production ID
  quantity?: number; // Quantity for the selected size
  productInfo: {
    name: string;
    size: number;
    details: string;
  };
  tailorId?: number; // Optional - if not provided, stage = "Bidding"
  stage?: string; // Auto-set based on tailorId
}

interface AssignTailorRequest {
  tailorId: number;
  notes?: string;
}

interface UpdateProductionRequest {
  tailorId?: number;
  currentStage?: ProductionStage;
  notes?: string;
}

interface MoveToStageRequest {
  stage: string; // Backend expects: 'in production', 'Bidding', 'Await QA', 'Rejected', 'Completed'
  staffId: number;
  notes?: string;
  images?: string[];
}

interface QAReviewRequest {
  qaStaffId: number;
  status: 'approved' | 'rejected';
  notes?: string;
  defects?: string[]; // For rejected items
}

interface MoveToStockRequest {
  pushedBy: number;
  receivedBy: number;
  location?: string;
  notes?: string;
}

interface ReworkProductionRequest {
  staffId: number;
  notes?: string;
}
