export interface Group {
    id: string;
    name: string;
    category: string;
    level: string;
    author: string;
    memberIds: string[];
    tickets: number;
    status: 'active' | 'inactive';
}
