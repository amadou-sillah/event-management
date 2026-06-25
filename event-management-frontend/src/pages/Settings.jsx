import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Bell,
  Moon,
  Sun,
  Palette,
  Save,
  LogOut,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/auth-context";
import { useTheme } from "../contexts/theme-context";
import { useToast } from "../contexts/toast-context";
import { updateProfile, changePassword } from "../api/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailEvents: true,
    emailReminders: true,
    emailMarketing: false,
    pushEvents: true,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
      setOriginalProfile({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const isProfileChanged = () => {
    return (
      profile.name !== originalProfile.name ||
      profile.email !== originalProfile.email
    );
  };

  // ---- Save profile ----
  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      addToast("Name and email are required", "warning");
      return;
    }

    setSaving(true);
    try {
      console.log("🟢 Saving profile with:", { name: profile.name, email: profile.email });
      const updatedUser = await updateProfile(profile.name, profile.email);
      console.log("🟢 Profile updated:", updatedUser);
      setProfile(updatedUser);
      setOriginalProfile({ name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
      addToast("Profile updated successfully", "success");
    } catch (err) {
      console.error("🔴 Update profile error:", err);
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---- Change password ----
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("All password fields are required", "warning");
      return;
    }

    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "warning");
      return;
    }

    setSaving(true);
    try {
      console.log("🟢 Changing password...");
      await changePassword(currentPassword, newPassword);
      console.log("🟢 Password changed");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      addToast("Password changed successfully", "success");
    } catch (err) {
      console.error("🔴 Change password error:", err);
      addToast(err.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---- Toggle notification ----
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    addToast("Notification preference updated", "success");
  };

  // ---- Handle logout ----
  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
  };

  // ---- Danger zone ----
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (window.confirm("Really? All your events, attendees, and data will be permanently lost.")) {
        addToast("Account deletion not implemented yet", "warning");
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      organizer: "bg-blue-100 text-blue-700 border-blue-200",
      staff: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[role] || colors.staff;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 max-w-4xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your personal information</p>
                </div>
              </div>
              <Badge className={getRoleBadgeColor(profile.role)}>
                <Shield className="w-3 h-3 mr-1" />
                {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || "User"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={!isProfileChanged() || saving}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleChangePassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || saving}
                variant="outline"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance & Notifications (unchanged) */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Button variant="outline" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="flex-1">
                <p className="font-medium">{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</p>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Reduced eye strain in low-light environments" : "Classic bright interface for daytime use"}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "emailEvents", label: "Email notifications for events" },
              { key: "emailReminders", label: "Email reminders for upcoming events" },
              { key: "emailMarketing", label: "Marketing and promotional emails" },
              { key: "pushEvents", label: "Push notifications for event updates" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm">{item.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleNotification(item.key)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none
                    ${notifications[item.key] ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}
                  `}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${notifications[item.key] ? "translate-x-5" : "translate-x-0"}`} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-rose-200 dark:border-rose-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <p className="text-sm text-muted-foreground">Irreversible actions – proceed with caution</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
              <div>
                <p className="font-medium text-rose-700 dark:text-rose-300">Logout</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-rose-300 hover:bg-rose-100">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
              <div>
                <p className="font-medium text-rose-700 dark:text-rose-300">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} className="bg-rose-600 hover:bg-rose-700">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Account active</span>
          </div>
          <div>Last login: Today</div>
        </div>
      </motion.div>
    </motion.div>
  );
}