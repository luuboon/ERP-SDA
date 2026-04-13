import { Group } from '../models/group.model';

export abstract class GroupRepository {
    abstract getGroups(): Promise<Group[]>;
    abstract getById(id: string): Promise<Group | undefined>;
    abstract create(data: Omit<Group, 'id' | 'status'>): Promise<Group>;
    abstract update(id: string, changes: Partial<Omit<Group, 'id'>>): Promise<Group | undefined>;
    abstract delete(id: string): Promise<boolean>;
    abstract addMember(groupId: string, userId: string): Promise<boolean>;
    abstract removeMember(groupId: string, userId: string): Promise<void>;
}
