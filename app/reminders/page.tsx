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
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">
          My Reminders
        </h1>
        <Button
          onClick={() => router.push("/reminders/new")}
          className="w-full sm:w-auto mb-4 sm:mb-0"
        >
          Create New Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Upcoming Reminders
          </h2>
          {loading ? (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <p>Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <p className="text-gray-500">You don&apos;t have any reminders yet</p>
              <Button
                onClick={() => router.push("/reminders/new")}
                className="mt-4"
                variant="outline"
              >
                Create Your First Reminder
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card
                  key={reminder.$id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-gray-600 mt-2 p-2 bg-gray-50 rounded-md text-sm sm:text-base">
                        {reminder.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs sm:text-sm text-gray-500">
                      {format(new Date(reminder.datetime), "PPpp")}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {reminder.recurrence !== "none"
                          ? `Repeats ${reminder.recurrence}`
                          : "One-time"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/reminders/${reminder.$id}`)
                        }
                        className="w-full sm:w-auto"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteReminder(reminder.$id)}
                        className="w-full sm:w-auto"
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

        <div className="hidden md:block">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Completed Reminders
          </h2>
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">
              Completed reminders will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
