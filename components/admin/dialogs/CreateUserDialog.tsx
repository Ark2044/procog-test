import { FaCheck, FaClipboard, FaSync } from "react-icons/fa";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  isCreating: boolean;
  error: string;
  tempPassword: string;
  passwordCopied: boolean;
  onCreateUser: () => void;
  onUserDataChange: (field: string, value: string) => void;
  onCopyPassword: () => void;
  userData: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  departments,
  isCreating,
  error,
  tempPassword,
  passwordCopied,
  onCreateUser,
  onUserDataChange,
  onCopyPassword,
  userData,
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
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new user in the system.
          </DialogDescription>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-medium mb-2">
                User Created Successfully!
              </h3>
              <p className="text-green-700 text-sm mb-3">
                A temporary password has been generated for this user. Make sure
                to save it or share it with the user.
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={tempPassword}
                  readOnly
                  className="w-full bg-white border border-green-300 rounded px-3 py-2 text-gray-700"
                />
                <button
                  onClick={onCopyPassword}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
                  title="Copy to clipboard"
                >
                  {passwordCopied ? <FaCheck /> : <FaClipboard />}
                </button>
              </div>

              {passwordCopied && (
                <p className="text-xs text-green-600 mt-1">
                  Copied to clipboard!
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {error && (
                <Alert className="bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => onUserDataChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => onUserDataChange("email", e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={userData.role}
                  onValueChange={(value) => onUserDataChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={userData.department}
                  onValueChange={(value) =>
                    onUserDataChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={onCreateUser}
                disabled={isCreating || !userData.name || !userData.email}
              >
                {isCreating ? (
                  <>
                    <FaSync className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
