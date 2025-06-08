import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SettingsPanelProps {
  users: any[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ users }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Roles & Permissions */}
    <div>
      <h3 className="font-bold mb-2">Roles & Permissions</h3>
      <div className="bg-belfx_navy-light rounded-lg p-4">
        <div className="mb-2">Assign admin rights to users:</div>
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 mb-2">
            <span>{user.full_name || user.email}</span>
            <Button size="sm" variant={user.is_admin ? "default" : "outline"} disabled>{user.is_admin ? "Admin" : "User"}</Button>
            {/* TODO: Add toggle for admin rights */}
          </div>
        ))}
      </div>
    </div>
    {/* Branding & Notifications */}
    <div>
      <h3 className="font-bold mb-2">Branding & Notifications</h3>
      <div className="bg-belfx_navy-light rounded-lg p-4">
        <div className="mb-2">Platform branding and notification settings coming soon.</div>
        {/* TODO: Add branding/logo upload and notification config */}
      </div>
    </div>
  </div>
);

export default SettingsPanel;
