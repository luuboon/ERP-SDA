import { User } from '../models/user.model';

export abstract class AuthRepository {
    abstract login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string; token?: string }>;
    abstract register(data: { name: string; email: string; password: string }): Promise<{ success: boolean; user?: User; error?: string; token?: string }>;
}
