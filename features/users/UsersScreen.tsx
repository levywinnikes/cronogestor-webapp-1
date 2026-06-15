"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus, Edit2, Trash2, Mail, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import {
  userService,
  OrganizationMembershipDto,
  MembershipRole,
  MembershipStatus,
} from "@/app/services/user.service";
import { authService, User as AuthUser } from "@/app/services/auth.service";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AppButton } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersScreen() {
  const { t } = useTranslation();

  // State lists & user session
  const [members, setMembers] = useState<OrganizationMembershipDto[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal controls
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<OrganizationMembershipDto | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MembershipRole>("EDITOR");
  const [isSavingInvite, setIsSavingInvite] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Edit form state
  const [editRole, setEditRole] = useState<MembershipRole>("EDITOR");
  const [editStatus, setEditStatus] = useState<MembershipStatus>("ACTIVE");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Deleting indicator
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load members and session on mount
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [membersData, sessionData] = await Promise.all([
        userService.getUsers(),
        authService.session(),
      ]);
      setMembers(membersData);
      setCurrentUser(sessionData.user);
    } catch (error: unknown) {
      console.error("Error loading users page data:", error);
      setErrorMsg(error instanceof Error ? error.message : t("users.states.loadingError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show message briefly
  const showFeedback = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  // Actions: Invite
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError(t("holidays.errors.requiredFields"));
      return;
    }

    setIsSavingInvite(true);
    setInviteError("");
    try {
      await userService.inviteUser({
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });

      // Reload
      const membersData = await userService.getUsers();
      setMembers(membersData);

      setIsInviteOpen(false);
      // Reset form
      setInviteName("");
      setInviteEmail("");
      setInviteRole("EDITOR");

      showFeedback(t("users.messages.inviteSuccess"));
    } catch (error: unknown) {
      setInviteError(error instanceof Error ? error.message : t("users.messages.inviteError"));
    } finally {
      setIsSavingInvite(false);
    }
  };

  // Actions: Open Edit Modal
  const handleOpenEdit = (membership: OrganizationMembershipDto) => {
    if (currentUser && membership.userAccountId === currentUser.id) {
      showFeedback(t("users.messages.selfEditError"), false);
      return;
    }
    setSelectedMembership(membership);
    setEditRole(membership.role);
    setEditStatus(membership.status);
    setEditError("");
    setIsEditOpen(true);
  };

  // Actions: Save Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership) return;

    setIsSavingEdit(true);
    setEditError("");
    try {
      await userService.updateUser({
        membershipId: selectedMembership.id,
        role: editRole,
        status: editStatus,
      });

      // Reload
      const membersData = await userService.getUsers();
      setMembers(membersData);

      setIsEditOpen(false);
      setSelectedMembership(null);

      showFeedback(t("users.messages.updateSuccess"));
    } catch (error: unknown) {
      setEditError(error instanceof Error ? error.message : t("users.messages.updateError"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Actions: Remove / Delete Member
  const handleDeleteMember = async (membership: OrganizationMembershipDto) => {
    if (currentUser && membership.userAccountId === currentUser.id) {
      showFeedback(t("users.messages.selfDeleteError"), false);
      return;
    }

    if (!confirm(t("users.messages.deleteConfirm"))) {
      return;
    }

    setDeletingId(membership.id);
    try {
      await userService.deleteUser(membership.id);
      setMembers((prev) => prev.filter((m) => m.id !== membership.id));
      showFeedback(t("users.messages.deleteSuccess"));
    } catch (error: unknown) {
      showFeedback(error instanceof Error ? error.message : t("users.messages.deleteError"), false);
    } finally {
      setDeletingId(null);
    }
  };

  // Role translating options
  const roleOptions = [
    { value: "ADMIN", label: t("users.roles.admin") },
    { value: "EDITOR", label: t("users.roles.editor") },
    { value: "VIEWER", label: t("users.roles.viewer") },
  ];

  const editStatusOptions = [
    { value: "ACTIVE", label: t("users.status.active") },
    { value: "DISABLED", label: t("users.status.disabled") },
  ];

  // Render role badges
  const getRoleBadgeVariant = (role: MembershipRole) => {
    switch (role) {
      case "OWNER":
      case "ADMIN":
        return "warning";
      case "EDITOR":
        return "info";
      case "VIEWER":
      default:
        return "neutral";
    }
  };

  const getStatusBadgeVariant = (status: MembershipStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INVITED":
        return "warning";
      case "DISABLED":
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedbacks */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm animate-fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardHeader
          title={t("users.page.title")}
          icon={<Users className="w-5 h-5" />}
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsInviteOpen(true)}
            >
              {t("users.buttons.invite")}
            </AppButton>
          }
        />
        <div className="px-6 py-3.5 bg-gray-50/50 border-b border-border-light">
          <p className="text-xs text-text-secondary">
            {t("users.page.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <CardContent className="divide-y divide-border-light p-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1 animate-pulse">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        ) : members.length === 0 ? (
          <CardContent>
            <p className="text-sm text-text-secondary text-center py-6">
              {t("users.states.empty")}
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-gray-50/50 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">{t("users.fields.name")}</th>
                  <th className="px-6 py-4">{t("users.fields.email")}</th>
                  <th className="px-6 py-4">{t("users.fields.role")}</th>
                  <th className="px-6 py-4">{t("users.fields.status")}</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {members.map((member) => {
                  const isSelf = currentUser && member.userAccountId === currentUser.id;
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isSelf ? "bg-primary/5 font-medium" : ""
                      }`}
                    >
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary">{member.userAccount.name}</span>
                          {isSelf && (
                            <Badge variant="info" className="text-[10px] py-0.5 px-1.5">
                              Você
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-text-secondary">
                        {member.userAccount.email}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {t(`users.roles.${member.role.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {t(`users.status.${member.status.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-right space-x-2">
                        <AppButton
                          variant="outline"
                          size="sm"
                          disabled={!!isSelf}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(member)}
                          title={isSelf ? t("users.messages.selfEditError") : t("users.buttons.edit")}
                        />
                        <AppButton
                          variant="danger-outline"
                          size="sm"
                          disabled={!!isSelf}
                          loading={deletingId === member.id}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleDeleteMember(member)}
                          title={isSelf ? t("users.messages.selfDeleteError") : t("users.buttons.remove")}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setInviteError("");
        }}
        title={t("users.page.inviteTitle")}
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <TextField
            label={t("users.fields.name")}
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Nome Completo"
          />
          <TextField
            type="email"
            label={t("users.fields.email")}
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@empresa.com"
            icon={<Mail className="w-4 h-4 text-text-muted" />}
          />
          <SelectField
            label={t("users.fields.role")}
            required
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as MembershipRole)}
            options={roleOptions}
            icon={<Shield className="w-4 h-4 text-text-muted" />}
          />

          {inviteError && (
            <div className="p-3 bg-danger-100 border border-red-200 rounded-lg text-danger text-xs font-semibold">
              {inviteError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <AppButton
              type="button"
              variant="outline"
              onClick={() => {
                setIsInviteOpen(false);
                setInviteError("");
              }}
            >
              {t("users.buttons.cancel")}
            </AppButton>
            <AppButton type="submit" variant="primary" loading={isSavingInvite}>
              {t("users.buttons.invite")}
            </AppButton>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditError("");
        }}
        title={t("users.page.editTitle")}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {selectedMembership && (
            <div className="p-3 bg-gray-50 border border-border rounded-lg mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Colaborador
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {selectedMembership.userAccount.name}
              </p>
              <p className="text-xs text-text-secondary">
                {selectedMembership.userAccount.email}
              </p>
            </div>
          )}

          <SelectField
            label={t("users.fields.role")}
            required
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as MembershipRole)}
            options={roleOptions}
            icon={<Shield className="w-4 h-4 text-text-muted" />}
          />

          <SelectField
            label={t("users.fields.status")}
            required
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as MembershipStatus)}
            options={editStatusOptions}
          />

          {editError && (
            <div className="p-3 bg-danger-100 border border-red-200 rounded-lg text-danger text-xs font-semibold">
              {editError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <AppButton
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditError("");
              }}
            >
              {t("users.buttons.cancel")}
            </AppButton>
            <AppButton type="submit" variant="primary" loading={isSavingEdit}>
              {t("users.buttons.save")}
            </AppButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
