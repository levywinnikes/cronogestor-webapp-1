"use client";

import { Dialog } from "@/components/ui/dialog";
import {
  TimeSheetEntryForm,
  TimeSheetEntryFormSkeleton,
  type TimeSheetEntryFormProps,
} from "./TimeSheetEntryForm";

export type TimeSheetEntryDialogProps = Omit<TimeSheetEntryFormProps, "onCancel"> & {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
};

export function TimeSheetEntryDialog({
  isOpen,
  onClose,
  title,
  isLoading = false,
  ...formProps
}: TimeSheetEntryDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {isLoading ? (
          <TimeSheetEntryFormSkeleton />
        ) : (
          <TimeSheetEntryForm {...formProps} onCancel={onClose} />
        )}
      </div>
    </Dialog>
  );
}
