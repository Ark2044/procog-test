// app/reminders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReminderStore } from "@/store/Reminder";
import { useAuthStore } from "@/store/Auth";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function EditReminderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { reminders, updateReminder, loading, error } = useReminderStore();

  const reminder = params ? reminders.find((r) => r.$id === params.id) : null;

  const [title, setTitle] = useState(reminder?.title || "");
  const [description, setDescription] = useState(reminder?.description || "");
  const [datetime, setDatetime] = useState<Date>(
    reminder ? new Date(reminder.datetime) : new Date()
  );
  const [recurrence, setRecurrence] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >(reminder?.recurrence || "none");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!reminder || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateReminder(reminder.$id, {
      title,
      description,
      datetime: datetime.toISOString(),
      recurrence,
    });

    router.push("/reminders");
  };

  return (
    <div className="container mx-auto py-8 mt-10 px-4">
      <Card className="max-w-md mx-auto ">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h1 className="text-2xl font-bold">Edit Reminder</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date and Time
              </label>
              <DatePicker
                selected={datetime}
                onChange={(date) => setDatetime(date || new Date())}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(
                    e.target.value as "none" | "daily" | "weekly" | "monthly"
                  )
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="none">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/reminders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
