import React from "react";
import { FaExclamationTriangle, FaSync } from "react-icons/fa";
import { User } from "@/types/User";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  users: User[];
  isDeleting: boolean;
  error: string;
  riskHandlingOption: string;
  reassignUserId: string;
  onRiskHandlingChange: (option: string) => void;
  onReassignUserChange: (userId: string) => void;
  onDeleteUser: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  users,
  isDeleting,
  error,
  riskHandlingOption,
  reassignUserId,
  onRiskHandlingChange,
  onReassignUserChange,
  onDeleteUser,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user will be permanently deleted
            from the system.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-4">
            {error && (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-base font-medium text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="risk-handling">
                  <AccordionTrigger className="text-sm font-medium">
                    Risk Handling Options
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 mt-2">
                      <p className="text-sm text-gray-600">
                        Choose how to handle risks created by this user:
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="anonymize"
                            name="riskHandling"
                            value="anonymize"
                            checked={riskHandlingOption === "anonymize"}
                            onChange={() => onRiskHandlingChange("anonymize")}
                            className="mr-2"
                          />
                          <label htmlFor="anonymize" className="text-sm">
                            Keep risks and mark as anonymous (recommended)
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="reassign"
                            name="riskHandling"
                            value="reassign"
                            checked={riskHandlingOption === "reassign"}
                            onChange={() => onRiskHandlingChange("reassign")}
                            className="mr-2"
                          />
                          <label htmlFor="reassign" className="text-sm">
                            Reassign risks to another user
                          </label>
                        </div>

                        {riskHandlingOption === "reassign" && (
                          <div className="ml-6 mt-2">
                            <Select
                              value={reassignUserId}
                              onValueChange={onReassignUserChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users
                                  .filter((u) => u.$id !== user.$id)
                                  .map((usr) => (
                                    <SelectItem key={usr.$id} value={usr.$id}>
                                      {usr.name} ({usr.email})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="delete"
                            name="riskHandling"
                            value="delete"
                            checked={riskHandlingOption === "delete"}
                            onChange={() => onRiskHandlingChange("delete")}
                            className="mr-2"
                          />
                          <label htmlFor="delete" className="text-sm">
                            Delete all risks created by this user
                          </label>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteUser}
                disabled={
                  isDeleting ||
                  (riskHandlingOption === "reassign" && !reassignUserId)
                }
              >
                {isDeleting ? (
                  <>
                    <FaSync className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
