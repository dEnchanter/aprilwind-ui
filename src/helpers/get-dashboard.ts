interface Dashboard {
  itemCode: string;
  requester: string;
  approver: string;
  quantity: string;
  createdAt: string;
}

export async function fetchDashboard(): Promise<Dashboard[]> {
  return Promise.resolve([
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
    {
      "itemCode": "P-001",
      "requester": "Industrial Drill",
      "approver": "John Doe",
      "quantity": "8 yards",
      "createdAt": "2025-03-20T09:30:00Z"
    },
  ]);
}