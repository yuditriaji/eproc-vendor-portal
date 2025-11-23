'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Lock, User } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Edit Profile</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive email updates</div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Approval Alerts</div>
                <div className="text-sm text-muted-foreground">Get notified of pending approvals</div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Password and authentication settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-muted-foreground">Update your password</div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">Add extra security</div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
