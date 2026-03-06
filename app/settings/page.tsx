"use client"

import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { getSettings, saveSettings, subscribeToDataChanges, type AppSettings } from "@/lib/app-data"

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadSettings = async () => {
    setLoading(true)
    try {
      setSettings(await getSettings())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
    const unsubscribe = subscribeToDataChanges(() => {
      void loadSettings()
    })
    return unsubscribe
  }, [])

  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current))
  }

  const handleSaveGeneral = async () => {
    if (!settings) return

    setSaving(true)
    try {
      await saveSettings({
        clinicName: settings.clinicName.trim(),
        workerName: settings.workerName.trim(),
      })
      toast.success("Settings updated")
    } catch {
      toast.error("Unable to save settings")
    } finally {
      setSaving(false)
    }
  }

  const toggleNotifications = async () => {
    if (!settings) return

    const nextValue = !settings.notificationsEnabled
    updateField("notificationsEnabled", nextValue)

    try {
      await saveSettings({ notificationsEnabled: nextValue })
      toast.success("Settings updated")
    } catch {
      updateField("notificationsEnabled", !nextValue)
      toast.error("Unable to update notifications")
    }
  }

  const toggleAutoSync = async () => {
    if (!settings) return

    const nextValue = !settings.autoSync
    updateField("autoSync", nextValue)

    try {
      await saveSettings({ autoSync: nextValue })
      toast.success("Settings updated")
    } catch {
      updateField("autoSync", !nextValue)
      toast.error("Unable to update sync setting")
    }
  }

  const changeLanguage = async (language: AppSettings["language"]) => {
    if (!settings) return
    updateField("language", language)

    try {
      await saveSettings({ language })
      toast.success("Settings updated")
    } catch {
      toast.error("Unable to update language")
    }
  }

  if (loading || !settings) {
    return <p className="text-muted-foreground">Loading settings...</p>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage clinic preferences and offline sync behavior.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Saved in IndexedDB for offline startup restore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clinic Name</label>
                <Input
                  value={settings.clinicName}
                  onChange={(event) => updateField("clinicName", event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Worker Name</label>
                <Input
                  value={settings.workerName}
                  onChange={(event) => updateField("workerName", event.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={() => void handleSaveGeneral()} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Enable or disable notifications</p>
                <Button variant={settings.notificationsEnabled ? "default" : "outline"} onClick={() => void toggleNotifications()}>
                  {settings.notificationsEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>Select app language preference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { code: "english", label: "English" },
                { code: "telugu", label: "Telugu" },
                { code: "hindi", label: "Hindi" },
              ].map((item) => (
                <Button
                  key={item.code}
                  variant={settings.language === item.code ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => void changeLanguage(item.code as AppSettings["language"])}
                >
                  {item.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync</CardTitle>
              <CardDescription>Offline and queue behavior controls.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Automatic sync when online</p>
              <Button variant={settings.autoSync ? "default" : "outline"} onClick={() => void toggleAutoSync()}>
                {settings.autoSync ? "Enabled" : "Disabled"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Mana Aarogyam Rural Healthcare System</p>
              <p>Offline-first, IndexedDB-backed, Vercel-ready demo build.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
