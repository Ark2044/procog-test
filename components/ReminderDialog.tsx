import React, { useState, useEffect } from "react";
import { databases } from "@/models/client/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useReminderStore } from "@/store/Reminder";
import { reminderCollection, db } from "@/models/name";
import { ID } from "appwrite";
import { useAuthStore } from "@/store/Auth";
import { Reminder } from "@/types/Reminder";
import { useViewedItemsStore } from "@/store/ViewedItems";
import { Query } from "appwrite";
import { validateString } from "@/lib/validation";

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string;
  riskTitle: string;
  userId: string;
  email?: string;
  editingReminder?: Reminder | null;
  onUpdate?: (reminderId: string, data: Partial<Reminder>) => Promise<void>;
  riskStatus?: string;
}

const reminderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  datetime: z.string().min(1, "Please select a date and time"),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
});

type ReminderValues = z.infer<typeof reminderSchema>;

export const ReminderDialog: React.FC<ReminderDialogProps> = ({
  isOpen,
  onClose,
  riskId,
  riskTitle,
  userId,
  editingReminder,
  onUpdate,
  riskStatus = "active",
}) => {
  const { addReminder } = useReminderStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { markRemindersViewed } = useViewedItemsStore();

  const form = useForm<ReminderValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      description: "",
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      recurrence: "none",
    },
  });

  useEffect(() => {
    if (editingReminder) {
      form.reset({
        title: editingReminder.title,
        description: editingReminder.description || "",
        datetime: new Date(editingReminder.datetime).toISOString().slice(0, 16),
        recurrence: editingReminder.recurrence || "none",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        recurrence: "none",
      });
    }
  }, [editingReminder, form]);

  useEffect(() => {
    if (isOpen && userId && riskId) {
      const fetchAndMarkReminders = async () => {
        try {
          const response = await databases.listDocuments(
            db,
            reminderCollection,
            [Query.equal("riskId", riskId), Query.equal("userId", userId)]
          );

          if (response && response.total > 0) {
            markRemindersViewed(userId, riskId, response.total);
          }
        } catch (error) {
          console.error("Error fetching reminders:", error);
        }
      };

      fetchAndMarkReminders();
    }
  }, [isOpen, riskId, userId, markRemindersViewed]);

  if (riskStatus === "closed") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Risk Closed</DialogTitle>
            <DialogDescription>
              This risk has been closed. You cannot set new reminders for closed
              risks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async (values: ReminderValues) => {
    setIsSubmitting(true);
    try {
      // Perform additional validation with our validateString function
      const titleValidation = validateString(values.title, "Title", {
        required: true,
        minLength: 3,
        maxLength: 100,
      });

      if (!titleValidation.isValid) {
        toast.error(titleValidation.error || "Invalid title");
        setIsSubmitting(false);
        return;
      }

      const descriptionValidation = validateString(
        values.description,
        "Description",
        {
          required: true,
          minLength: 5,
          maxLength: 500,
        }
      );

      if (!descriptionValidation.isValid) {
        toast.error(descriptionValidation.error || "Invalid description");
        setIsSubmitting(false);
        return;
      }

      // Validate date
      const selectedDate = new Date(values.datetime);
      if (isNaN(selectedDate.getTime())) {
        toast.error("Please select a valid date and time");
        setIsSubmitting(false);
        return;
      }

      // Check that date is not in the past
      if (selectedDate < new Date()) {
        toast.error("Reminder date must be in the future");
        setIsSubmitting(false);
        return;
      }

      const reminderData = {
        title: values.title.trim(),
        description: values.description.trim(),
        datetime: new Date(values.datetime).toISOString(),
        recurrence: values.recurrence,
        userId: userId,
        riskId: riskId,
        status: "pending" as const,
        email: user?.email,
        updated: new Date().toISOString(),
      };

      if (editingReminder && onUpdate) {
        await onUpdate(editingReminder.$id, reminderData);
        toast.success("Reminder updated successfully");
      } else {
        const response = await databases.createDocument(
          db,
          reminderCollection,
          ID.unique(),
          {
            ...reminderData,
            created: new Date().toISOString(),
          }
        );

        await addReminder({
          ...reminderData,
          $id: response.$id,
          created: response.$createdAt,
          updated: response.$updatedAt,
        } as Reminder);

        toast.success(
          `Reminder set successfully: Your reminder has been scheduled for ${new Date(
            values.datetime
          ).toLocaleString()}`
        );
      }

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error setting reminder:", error);
      toast.error("Failed to set reminder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingReminder ? "Edit Review Reminder" : "Set Review Reminder"}
          </DialogTitle>
          <DialogDescription>
            {editingReminder
              ? "Update your reminder for the risk"
              : `Create a reminder to review the risk: ${riskTitle}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Quarterly Review, Risk Assessment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What should be reviewed or addressed?"
                      rows={3}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No recurrence</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingReminder
                  ? "Update Reminder"
                  : "Set Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
