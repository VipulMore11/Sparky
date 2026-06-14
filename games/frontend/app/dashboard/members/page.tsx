"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Users,
  Mail,
  Calendar,
  Shield,
  MoreHorizontal,
  UserMinus,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { OrganizationMember, OrganizationRecord } from "@/stores/auth-store";
import pb from "@/lib/pb";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MembersPage() {
  const { getOrganization, user } = useAuthStore();
  const [organization, setOrganization] = useState<OrganizationRecord | null>(
    null
  );
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [admin, setAdmin] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const router = useRouter();

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const orgResponse = await getOrganization();
      if (orgResponse && orgResponse.items.length > 0) {
        const org = orgResponse.items[0];
        setOrganization(org);
        setMembers(org.expand.members || []);
        setAdmin(org.expand.created_by || null);
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [getOrganization]);

  // Filter members separately from admin
  const filteredMembers =
    searchTerm.trim() === ""
      ? members
      : members.filter(
          (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email &&
              member.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarUrl = (member: OrganizationMember) => {
    if (member.avatar) {
      return `https://bitnbuild.anuragpandey.codes/api/files/_pb_users_auth_/${member.id}/${member.avatar}`;
    }
    return undefined;
  };

  const isCurrentUserAdmin = () => {
    const isAdmin = admin && user && admin.id === user.id;
    console.log("Admin check:", {
      admin: admin?.id,
      user: user?.id,
      isAdmin,
    });
    return isAdmin;
  };

  const handleRemoveMember = (member: OrganizationMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !organization) return;

    try {
      const newData = {
        created_by: organization.expand.created_by.id,
        join_code: organization.join_code,
        data: organization.data,
        members: organization.members.filter(
          (memberId) => memberId !== memberToRemove.id
        ),
      };
      await pb.collection("organizations").update(organization.id, newData);
      fetchOrganization();
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMemberStatus = (member: OrganizationMember) => {
    if (member.verified) return "Verified";
    return "Pending";
  };

  const getStatusVariant = (member: OrganizationMember) => {
    if (member.verified) return "default";
    return "secondary";
  };

  const handleLeaveOrganization = async () => {
      const org = organization;
      if (!org) return;
      org.members = org?.members.filter((member) => member !== user?.id) || [];
     await pb.collection("organizations").update(org.id, org, {
       join_code: org.join_code,
     });
     await getOrganization();
     toast.success("Successfully left organization!");
     router.push("/select-organization");
  };

  if (loading) {
    return (
      <main className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading members...</div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid gap-6">
      {/* Organization Info Card */}
      {organization && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {organization.data.name}
                </CardTitle>
                {organization.data.description && (
                  <p className="text-muted-foreground">
                    {organization.data.description}
                  </p>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveOrganization}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Members:</span>
                <span className="ml-2 font-medium">{members.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Verified Members:</span>
                <span className="ml-2 font-medium">
                  {members.filter((m) => m.verified).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Join Code:</span>
                <span className="ml-2 font-medium font-mono">
                  {organization.join_code}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Section */}
      {admin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Organization Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/30">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={getAvatarUrl(admin)}
                  alt={`${admin.name} avatar`}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg truncate">
                    {admin.name}
                  </h3>
                  <Badge variant="destructive" className="text-xs">
                    Admin
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  {admin.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(admin.created)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({filteredMembers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No members found matching your search."
                : "No members found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[50px]">
                    {isCurrentUserAdmin() && "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={getAvatarUrl(member)}
                            alt={`${member.name} avatar`}
                          />
                          <AvatarFallback className="text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {member.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not provided
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(member)}>
                        {getMemberStatus(member)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(member.created)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(member.updated)}
                    </TableCell>
                    <TableCell>
                      {isCurrentUserAdmin() && member.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {isCurrentUserAdmin() && member.id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.name}</strong> from the organization?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
