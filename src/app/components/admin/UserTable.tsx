import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { Trash2, Search, MoreVertical, Shield, BadgeCheck } from "lucide-react";

import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export function UserTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await apiRequest<any[]>('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    // ... existing fetchUsers ...

    const toggleSelectAll = () => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u._id)));
        }
    };

    const toggleSelectUser = (id: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkDelete = async () => {
        try {
            await apiRequest('/admin/users/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ userIds: Array.from(selectedUsers) })
            });
            toast.success(`Deleted ${selectedUsers.size} users`);
            setUsers(users.filter(u => !selectedUsers.has(u._id)));
            setSelectedUsers(new Set());
            setShowBulkDelete(false);
        } catch (error) {
            console.error(error);
            toast.error("Bulk delete failed");
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            await apiRequest(`/admin/users/${userToDelete}`, { method: 'DELETE' });
            toast.success("User deleted");
            setUsers(users.filter(u => u._id !== userToDelete));
            setUserToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        }
    };

    const handleToggleAdmin = async (id: string) => {
        try {
            const updatedUser = await apiRequest<any>(`/admin/users/${id}/make-admin`, { method: 'PUT' });
            setUsers(users.map(u => u._id === id ? { ...u, isAdmin: updatedUser.isAdmin } : u));
            toast.success(updatedUser.isAdmin ? "User promoted to Admin" : "User revoked from Admin");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user role");
        }
    };

    const handleVerifyUser = async (id: string) => {
        try {
            await apiRequest(`/admin/users/${id}/verify`, { method: 'PUT' });
            toast.success("User verified successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to verify user");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-border w-full max-w-sm">
                <Search className="size-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bulk Action Toolbar */}
            {selectedUsers.size > 0 && (
                <div className="bg-primary text-primary-foreground p-3 rounded-lg flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-medium text-sm px-2">{selectedUsers.size} users selected</span>
                    <button
                        onClick={() => setShowBulkDelete(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="size-3" />
                        Delete Selected
                    </button>
                </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary text-muted-foreground font-medium">
                        <tr>
                            <th className="p-4 w-[50px]">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedUsers.size === users.length && users.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} className={`border-t border-border hover:bg-secondary/20 transition-colors ${selectedUsers.has(user._id) ? "bg-primary/5" : ""}`}>
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedUsers.has(user._id)}
                                        onChange={() => toggleSelectUser(user._id)}
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isAdmin ? "bg-purple-100 text-purple-700" :
                                            user.role === 'mentor' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {user.isAdmin ? <span className="flex items-center gap-1"><Shield className="size-3" /> Admin</span> : user.role}
                                        </span>
                                        {user.role === 'mentor' && (
                                            user.isVerifiedMentor ? (
                                                <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-green-200 dark:border-green-800">
                                                    <BadgeCheck className="size-3" /> Verified Mentor
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                                                    Pending Approval
                                                </span>
                                            )
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => navigator.clipboard.writeText(user._id)}
                                            >
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleToggleAdmin(user._id)}>
                                                <Shield className="mr-2 h-4 w-4" />
                                                {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                                            </DropdownMenuItem>
                                            {(!user.isVerified || (user.role === 'mentor' && !user.isVerifiedMentor)) && (
                                                <DropdownMenuItem onClick={() => handleVerifyUser(user._id)}>
                                                    <BadgeCheck className="mr-2 h-4 w-4 text-blue-500" />
                                                    Verify User
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setUserToDelete(user._id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user and their associated roadmaps. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUsers.size} users? This will permanently delete them and their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete {selectedUsers.size} Users
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
