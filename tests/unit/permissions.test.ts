import { describe, it, expect } from "vitest";
import { permissionsFor, can, ROLE_LABELS } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("owner has all permissions", () => {
    const p = permissionsFor("owner");
    expect(p.canDeleteOrganization).toBe(true);
    expect(p.canManageBilling).toBe(true);
    expect(p.canManageMembers).toBe(true);
  });

  it("admin can manage members but not delete org or manage billing", () => {
    const p = permissionsFor("admin");
    expect(p.canManageMembers).toBe(true);
    expect(p.canManageBilling).toBe(false);
    expect(p.canDeleteOrganization).toBe(false);
  });

  it("member can create content but not manage org", () => {
    const p = permissionsFor("member");
    expect(p.canCreateConversation).toBe(true);
    expect(p.canCreateArtifacts).toBe(true);
    expect(p.canManageMembers).toBe(false);
  });

  it("viewer is read-only", () => {
    const p = permissionsFor("viewer");
    expect(p.canCreateConversation).toBe(false);
    expect(p.canCreateArtifacts).toBe(false);
    expect(p.canUploadFiles).toBe(false);
  });

  it("unknown role gets viewer-level permissions", () => {
    const p = permissionsFor("nobody");
    expect(p.canCreateConversation).toBe(false);
  });

  it("can() helper checks specific permission", () => {
    expect(can("owner", "canDeleteOrganization")).toBe(true);
    expect(can("member", "canDeleteOrganization")).toBe(false);
    expect(can("admin", "canManageBilling")).toBe(false);
  });

  it("all roles have labels", () => {
    expect(ROLE_LABELS.owner).toBeTruthy();
    expect(ROLE_LABELS.admin).toBeTruthy();
    expect(ROLE_LABELS.member).toBeTruthy();
    expect(ROLE_LABELS.viewer).toBeTruthy();
  });
});
