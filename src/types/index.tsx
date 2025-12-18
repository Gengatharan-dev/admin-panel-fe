




export interface CommonAPIRes {
    isSuccess: boolean;
    error?: string;
}

export interface ErrorModelType {
    open: boolean;
    title: string;
    message: string;
}

export interface UserModelType {
    open: boolean;
    title: string;
    user: GetUserDetail | null;
}

export interface RoleModelType {
    open: boolean;
    title: string;
    role: GetRoleDetail | null;
}

// register
export interface RegisterUserReq {
    id: string;
    name: string;
    email: string;
    roleId: number;
}

export interface RegisterUserRes extends CommonAPIRes {
    data: {
        isRegistered: boolean
    },
}

// login
export interface LoginUserReq {
    email: string;
    password: string;
}

export interface LoginUserRes extends CommonAPIRes {
    data: {
        isLoggedIn: boolean;
        authorization: string;
        roleId: number;
        userId: string;
    }
}

// Roles
export enum RoleSortColumnKey {
    CreatedAt = "createdAt",
    Name = "name",
    isActive = "isActive",
}

export interface GetRoleRes extends CommonAPIRes {
    data: {
        roles: GetRoleDetail[]
    }
}


export interface GetRolesReq {
    count: number | null,
    page: number;
    search: string | null;
    sortColumn: RoleSortColumnKey;
    sortDirection: SortDirection;
}

export interface GetRoleDetail {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    isRoot: boolean;
}

export interface GetRolesRes extends CommonAPIRes {
    data: {
        roles: GetRoleDetail[];
        totalCount: number;
        totalPage: number;
    }
}

export interface DeleteRoleRes extends CommonAPIRes {
    isDeleted: boolean;
}

export interface CreateRoleReq {
    name: string;
    isActive: boolean;
}

export interface CreateRoleRes extends CommonAPIRes {
    isAdded: boolean;
}

export interface UpdateRoleReq extends CreateRoleReq {
    id: string;
}

export interface UpdateRoleRes extends CommonAPIRes {
    isUpdated: boolean;
}

// User
export enum SortColumnKey {
    CreatedAt = "createdAt",
    Name = "name",
    Email = "email",
    IsOnline = "isOnline",
}

export enum SortDirection {
    Asc = "ASC",
    Desc = "DESC",
}

export interface GetUsersReq {
    count: number | null,
    page: number;
    search: string | null;
    sortColumn: SortColumnKey;
    sortDirection: SortDirection;
}

export interface GetUserDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: GetRoleDetail[];
    createdAt: string;
    isOnline: number;
}

export interface GetUsersRes extends CommonAPIRes {
    data: {
        users: GetUserDetail[];
        totalCount: number;
        totalPage: number;
    }
}

// Profile
export interface GetProfileRes extends CommonAPIRes {
    data: GetUserDetail;
}

export interface GetProfileDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string;
    createdAt: string;
    isOnline: number;
}

export interface DeleteUserRes extends CommonAPIRes {
    isDeleted: boolean;
}

export interface CreateUserReq {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface CreateUserRes extends CommonAPIRes {
    isCreated: boolean;
}

export interface UpdateUserReq extends CreateUserReq {
    id: string;
}

export interface UpdateUserRes extends CommonAPIRes {
    isUpdated: boolean;
}
