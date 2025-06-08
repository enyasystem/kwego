import React from "react";

const MorePanel: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="bg-belfx_navy-light rounded-lg p-4">
      <h4 className="font-semibold mb-2">Transactions</h4>
      <div className="text-sm text-gray-400">Full transaction management coming soon.</div>
    </div>
    <div className="bg-belfx_navy-light rounded-lg p-4">
      <h4 className="font-semibold mb-2">Support Tickets</h4>
      <div className="text-sm text-gray-400">Support ticket handling coming soon.</div>
    </div>
    <div className="bg-belfx_navy-light rounded-lg p-4">
      <h4 className="font-semibold mb-2">System Logs</h4>
      <div className="text-sm text-gray-400">System log monitoring coming soon.</div>
    </div>
  </div>
);

export default MorePanel;
