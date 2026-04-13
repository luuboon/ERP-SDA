export interface User {
    id: string;
    name: string;
    email: string;
    // Permisos globales (admin del sistema, no dependen del grupo)
    globalPermissions: string[];
    // Permisos por grupo: { 'g-alpha': ['tickets:add', 'tickets:view'] }
    permissionsByGroup: Record<string, string[]>;
    avatar?: string;
}
