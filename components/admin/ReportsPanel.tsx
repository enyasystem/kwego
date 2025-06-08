import React from "react";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";

const ReportsPanel: React.FC = () => (
  <>
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Filter:</span>
      <Button size="sm" variant="outline">Last 7 days</Button>
      <Button size="sm" variant="outline">Last 30 days</Button>
      <Button size="sm" variant="outline">All time</Button>
      <Button size="sm" variant="outline">Export</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-belfx_navy-light rounded-lg p-4">
        <h4 className="font-semibold mb-2">User Growth</h4>
        <ChartContainer config={{}}>
          <div className="text-gray-400 text-center py-8">Chart coming soon</div>
        </ChartContainer>
      </div>
      <div className="bg-belfx_navy-light rounded-lg p-4">
        <h4 className="font-semibold mb-2">Transaction Volume</h4>
        <ChartContainer config={{}}>
          <div className="text-gray-400 text-center py-8">Chart coming soon</div>
        </ChartContainer>
      </div>
    </div>
  </>
);

export default ReportsPanel;
