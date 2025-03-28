"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReminderStore } from "@/store/Reminder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuthStore } from "@/store/Auth";

export default function RemindersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { reminders, fetchReminders, deleteReminder, loading } =
    useReminderStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchReminders(user.$id);
  }, [user, fetchReminders, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Reminders</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Reminders</h2>
          {loading ? (
            <p>Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <p>No reminders yet</p>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card key={reminder.$id}>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-gray-600 mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      {format(new Date(reminder.datetime), "PPpp")}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {reminder.recurrence !== "none"
                          ? `Repeats ${reminder.recurrence}`
                          : "One-time"}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/reminders/${reminder.$id}`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteReminder(reminder.$id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
