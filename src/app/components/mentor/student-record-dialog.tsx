import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { StudentRecordTabs } from "./student-record-tabs";

interface StudentRecordDialogProps {
    studentId: string | null;
    studentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Quick-access modal for managing a student's mentorship record.
 * All Notes / Assignments / Resources logic lives in <StudentRecordTabs>.
 * 
 * Fixes applied:
 * ✅ Hardcoded localhost:3000 moved to VITE_API_URL (inside StudentRecordTabs)
 * ✅ Form state automatically resets when dialog closes (by unmounting StudentRecordTabs)
 */
export function StudentRecordDialog({ studentId, studentName, open, onOpenChange }: StudentRecordDialogProps) {
    // Safety reset — if the dialog is closed without saving, any lingering timers resolve cleanly.
    useEffect(() => {
        // Nothing explicit needed  — StudentRecordTabs unmounts on `open=false`,
        // resetting all internal state automatically. This effect is kept as a
        // documentation anchor for future additions.
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Student Record: {studentName}</DialogTitle>
                    <DialogDescription>
                        Manage notes, assignments, and shared resources for this mentee.
                    </DialogDescription>
                </DialogHeader>

                {/* Only mount the tabs (and their state) while the dialog is open */}
                {open && studentId ? (
                    <StudentRecordTabs studentId={studentId} />
                ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                        Select a student to view their record.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
