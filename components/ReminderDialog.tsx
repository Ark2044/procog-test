import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReminderStore } from '@/store/Reminder';

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string;
  riskTitle: string;
  userId: string;
}

export function ReminderDialog({
  isOpen,
  onClose,
  riskId,
  riskTitle,
  userId,
}: ReminderDialogProps) {
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [dateError, setDateError] = useState<string>('');
  const { createReminder, loading } = useReminderStore();

  const validateDate = (date: Date) => {
    if (date < new Date()) {
      setDateError('Please select a future date and time');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDatetime(date);
      validateDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDate(datetime)) {
      return;
    }

    await createReminder({
      title: `Risk Review: ${riskTitle}`,
      description: `Time to review risk: ${riskTitle}`,
      datetime: datetime.toISOString(),
      userId,
      riskId,
      recurrence,
      status: 'pending'
    });

    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set Reminder for Risk Review</AlertDialogTitle>
          <AlertDialogDescription>
            Choose when you want to be reminded about this risk.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date and Time</label>
            <DatePicker
              selected={datetime}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded-md"
              minDate={new Date()}
            />
            {dateError && (
              <p className="text-sm text-red-500 mt-1">{dateError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recurrence</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
              className="w-full p-2 border rounded-md"
            >
              <option value="none">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? 'Setting...' : 'Set Reminder'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}