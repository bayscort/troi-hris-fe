export interface Permission {
  id: string;
  operation: string;
}

export interface MenuPermission {
  menuId: string;
  permissionIds: string[];
}

export interface Menu {
  id: string;
  name: string;
  permissionList: Permission[];
}

export interface AllMenu {
  id: string;
  name: string;
}

export interface AllPermission {
  id: string;
  operation: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface RoleWithMenus {
  role: Role;
  menuList: Menu[];
}

export interface RoleUpdatePayload {
  roleId: string;
  menuPermissions: MenuPermission[];
}