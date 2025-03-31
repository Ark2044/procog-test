import React, { useState } from "react";
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
import { toast } from "react-hot-toast"; // Changed import to named import
import { useReminderStore } from "@/store/Reminder";
import { reminderCollection, db } from "@/models/name";
import { ID } from "appwrite";
import { useAuthStore } from "@/store/Auth";
import { Reminder } from "@/types/Reminder";

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string;
  riskTitle: string;
  userId: string;
  email?: string;
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
}) => {
  const { addReminder } = useReminderStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (values: ReminderValues) => {
    setIsSubmitting(true);
    try {
      const reminderData = {
        title: values.title,
        description: values.description,
        datetime: new Date(values.datetime).toISOString(),
        recurrence: values.recurrence,
        userId: userId,
        riskId: riskId,
        riskTitle: riskTitle,
        status: "pending" as const, // Explicitly type status as literal
        email: user?.email,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        db,
        reminderCollection,
        ID.unique(),
        reminderData
      );

      await addReminder({
        ...response,
        ...reminderData,
        created: response.$createdAt,
        updated: response.$updatedAt,
      } as Reminder); // Type assertion to match Reminder interface

      toast.success(
        `Reminder set successfully: Your reminder has been scheduled for ${new Date(
          values.datetime
        ).toLocaleString()}`
      );

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error setting reminder:", error);
      toast.error("Failed to set reminder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Review Reminder</DialogTitle>
          <DialogDescription>
            Create a reminder to review the risk: {riskTitle}
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
                {isSubmitting ? "Setting..." : "Set Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
