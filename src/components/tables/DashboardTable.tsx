"use client"

import React from 'react';
import { dashboardColumns } from '@/app/(dashboard)/dashboard-overview/columns';
import Template from '../utils/template';
import { DataTable2 } from './utils/data-table2';

const DashboardTable = () => {
  // TODO: Connect to proper data source
  const items: Dashboard[] = [];

  return (
    <Template>
      <DataTable2
        columns={dashboardColumns}
        data={items || []}
        title='Dashboard Overview'
        stats={[
          { label: "Items", value: 236 },
          { label: "Quantity", value: 87 },
          { label: "QTY Requested", value: 198 },
          { label: "QTY Approved", value: 300 }
        ]}
      />
    </Template>
  );
};

export default DashboardTable;
