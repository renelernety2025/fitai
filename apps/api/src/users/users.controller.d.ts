import { ProgressService } from '../progress/progress.service';
export declare class UsersController {
    private progressService;
    constructor(progressService: ProgressService);
    getReminderStatus(req: any): Promise<{
        shouldRemind: boolean;
        daysSinceLastWorkout: null;
        message: string;
    } | {
        shouldRemind: boolean;
        daysSinceLastWorkout: number;
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map