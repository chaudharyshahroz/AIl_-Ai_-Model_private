/**
 * Permission helpers for the four-tier role system:
 *   owner  - full control of org, including billing & deletion
 *   admin  - manage members, skills, connectors; cannot delete org
 *   member - default; can chat, use skills, upload files
 *   viewer - read-only access to shared artifacts
 */

export type Role = "owner" | "admin" | "member" | "viewer";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full control of the organization, including billing and deletion.",
  admin: "Manage members, skills, connectors, and integrations.",
  member: "Chat, use skills, upload files, and create artifacts.",
  viewer: "Read-only access to shared artifacts and projects.",
};

export interface Permissions {
  // Conversations
  canCreateConversation: boolean;
  canDeleteAnyConversation: boolean;
  // Skills
  canInstallSkills: boolean;
  canCreateSkills: boolean;
  // Connectors
  canConnectApps: boolean;
  // Files
  canUploadFiles: boolean;
  canDeleteAnyFile: boolean;
  // MCP
  canAddMCPServers: boolean;
  // Artifacts
  canCreateArtifacts: boolean;
  canEditAnyArtifact: boolean;
  // Org management
  canManageMembers: boolean;
  canManageBilling: boolean;
  canDeleteOrganization: boolean;
}

const PERMISSIONS: Record<Role, Permissions> = {
  owner: {
    canCreateConversation: true,
    canDeleteAnyConversation: true,
    canInstallSkills: true,
    canCreateSkills: true,
    canConnectApps: true,
    canUploadFiles: true,
    canDeleteAnyFile: true,
    canAddMCPServers: true,
    canCreateArtifacts: true,
    canEditAnyArtifact: true,
    canManageMembers: true,
    canManageBilling: true,
    canDeleteOrganization: true,
  },
  admin: {
    canCreateConversation: true,
    canDeleteAnyConversation: true,
    canInstallSkills: true,
    canCreateSkills: true,
    canConnectApps: true,
    canUploadFiles: true,
    canDeleteAnyFile: true,
    canAddMCPServers: true,
    canCreateArtifacts: true,
    canEditAnyArtifact: true,
    canManageMembers: true,
    canManageBilling: false,
    canDeleteOrganization: false,
  },
  member: {
    canCreateConversation: true,
    canDeleteAnyConversation: false,
    canInstallSkills: true,
    canCreateSkills: true,
    canConnectApps: true,
    canUploadFiles: true,
    canDeleteAnyFile: false,
    canAddMCPServers: true,
    canCreateArtifacts: true,
    canEditAnyArtifact: false,
    canManageMembers: false,
    canManageBilling: false,
    canDeleteOrganization: false,
  },
  viewer: {
    canCreateConversation: false,
    canDeleteAnyConversation: false,
    canInstallSkills: false,
    canCreateSkills: false,
    canConnectApps: false,
    canUploadFiles: false,
    canDeleteAnyFile: false,
    canAddMCPServers: false,
    canCreateArtifacts: false,
    canEditAnyArtifact: false,
    canManageMembers: false,
    canManageBilling: false,
    canDeleteOrganization: false,
  },
};

export function permissionsFor(role: string | null | undefined): Permissions {
  if (role === "owner" || role === "admin" || role === "member" || role === "viewer") {
    return PERMISSIONS[role];
  }
  return PERMISSIONS.viewer;
}

export function can(role: string | null | undefined, permission: keyof Permissions): boolean {
  return permissionsFor(role)[permission];
}
