import { useState } from "react";
import { User, Bell, Lock, Globe, Palette, HelpCircle, Mail, Phone, MessageSquare, FileText, LogOut } from "lucide-react";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Support</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "profile" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <User className="size-5" />
              <span className="font-medium">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "notifications" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Bell className="size-5" />
              <span className="font-medium">Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "privacy" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Lock className="size-5" />
              <span className="font-medium">Privacy & Security</span>
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "preferences" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Palette className="size-5" />
              <span className="font-medium">Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "support" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <HelpCircle className="size-5" />
              <span className="font-medium">Help & Support</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "preferences" && <PreferencesSettings />}
          {activeTab === "support" && <SupportSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="size-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            JD
          </div>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Change Photo
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                defaultValue="John"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Career Goal</label>
            <input
              type="text"
              defaultValue="Full Stack Developer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              rows={4}
              defaultValue="Passionate about building modern web applications"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 flex gap-3">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const settings = [
    { label: "Email Notifications", description: "Receive email updates about your progress", enabled: true },
    { label: "Course Reminders", description: "Get reminded about incomplete courses", enabled: true },
    { label: "Job Alerts", description: "Notifications for matching job opportunities", enabled: true },
    { label: "Mentor Messages", description: "Alerts when mentors send you messages", enabled: true },
    { label: "Community Activity", description: "Updates on community discussions you follow", enabled: false },
    { label: "Achievement Unlocked", description: "Celebrate when you earn new badges", enabled: true },
    { label: "Weekly Summary", description: "Weekly progress report via email", enabled: true },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        {settings.map((setting, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-gray-900">{setting.label}</p>
              <p className="text-sm text-gray-600">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>

        {/* Change Password */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Update Password
            </button>
          </div>
        </div>

        {/* Privacy Options */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Privacy Options</h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Profile Visibility</p>
              <p className="text-sm text-gray-600">Allow others to view your profile</p>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Public</option>
              <option>Private</option>
              <option>Connections Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Show Progress</p>
              <p className="text-sm text-gray-600">Display your learning progress publicly</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center gap-2">
              <LogOut className="size-5" />
              Log Out
            </button>
            <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
            <option>Central Time (CT)</option>
            <option>Eastern Time (ET)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button className="px-4 py-3 border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-lg font-medium">
              Light
            </button>
            <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Dark
            </button>
            <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Auto
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportSection() {
  const faqs = [
    { question: "How do I reset my password?", answer: "Go to Settings > Privacy & Security > Change Password" },
    { question: "How are skill recommendations generated?", answer: "Our AI analyzes your current skills, career goals, and market trends to suggest relevant skills" },
    { question: "Can I change my career goal?", answer: "Yes, you can update your career goal anytime in Profile Settings" },
    { question: "How do mentor sessions work?", answer: "Book a session with a mentor, and you'll receive a video call link via email" },
  ];

  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            <Mail className="size-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-600">support@the-setu.com</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            <Phone className="size-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Phone</p>
            <p className="text-sm text-gray-600">1-800-CAREER</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            <MessageSquare className="size-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Live Chat</p>
            <p className="text-sm text-gray-600">Available 24/7</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={4}
              placeholder="Describe your issue or question..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Send Message
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
              <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Help Resources</h2>
        <div className="space-y-3">
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="size-5 text-blue-600" />
            <span className="text-gray-900">Documentation</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <HelpCircle className="size-5 text-green-600" />
            <span className="text-gray-900">User Guide</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare className="size-5 text-purple-600" />
            <span className="text-gray-900">Community Forums</span>
          </a>
        </div>
      </div>
    </div>
  );
}
