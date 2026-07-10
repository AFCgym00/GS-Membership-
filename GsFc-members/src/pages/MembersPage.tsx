import { useMemo, useState, type FormEvent } from 'react';
import { Search, Filter, UserPlus, Phone, Mail, Trash2, Loader2, MessageCircle, CalendarDays, CalendarClock, Hash, Clock3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMembers } from '@/hooks/use-members';
import type { Member } from '@/lib/api';

function getStatusBadge(status: Member['status']) {
  switch (status) {
    case 'Active':
      return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">{status}</Badge>;
    case 'Expired':
      return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">{status}</Badge>;
    case 'Expiring Soon':
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{status}</Badge>;
  }
}

const PLAN_OPTIONS = ['Regular Plan', 'Semi Advance Plan', 'Personal Training'];
const DURATION_OPTIONS = ['1 Month', '3 Months', '6 Months', '12 Months'];

function addDuration(startDate: string, duration: string): string {
  const months = { '1 Month': 1, '3 Months': 3, '6 Months': 6, '12 Months': 12 }[duration] ?? 1;
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Positive = days left, negative = days since expiry, null = no end date on file. */
function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function initialsOf(name: string): string {
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function waLink(number: string): string {
  const digits = number.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

export default function MembersPage() {
  const { members, loading, error, addMember, removeMember } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [profileTarget, setProfileTarget] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const q = search.toLowerCase();
      const matchesSearch =
        member.name.toLowerCase().includes(q) ||
        (member.phone ?? '').includes(search) ||
        (member.email ?? '').toLowerCase().includes(q) ||
        (member.member_id ?? '').toLowerCase().includes(q) ||
        (member.wing_flat ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesPlan = planFilter === 'all' || member.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [members, search, statusFilter, planFilter]);

  const totalActive = members.filter((m) => m.status === 'Active').length;
  const totalExpiringSoon = members.filter((m) => m.status === 'Expiring Soon').length;
  const totalExpired = members.filter((m) => m.status === 'Expired').length;

  async function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const plan = String(form.get('plan') ?? '');
    const duration = String(form.get('duration') ?? '');
    const paid = Number(form.get('paid') ?? 0);

    if (!name || !plan || !duration) {
      setFormError('Name, plan, and duration are required.');
      return;
    }

    const startDate = new Date().toISOString().slice(0, 10);

    setSaving(true);
    try {
      await addMember({
        member_id: String(form.get('member_id') ?? '').trim() || null,
        name,
        gender: String(form.get('gender') ?? '') || null,
        wing_flat: String(form.get('wing_flat') ?? '').trim() || null,
        phone: String(form.get('phone') ?? '') || null,
        whatsapp: String(form.get('whatsapp') ?? '') || null,
        photo_url: String(form.get('photo_url') ?? '') || null,
        email: String(form.get('email') ?? '') || null,
        ownership: String(form.get('ownership') ?? '') || null,
        preferred_timing: String(form.get('preferred_timing') ?? '') || null,
        plan,
        duration,
        paid,
        payment_type: String(form.get('payment_type') ?? '') || null,
        remark: String(form.get('remark') ?? '').trim() || null,
        status: 'Active',
        start_date: startDate,
        end_date: addDuration(startDate, duration),
      });
      setAddOpen(false);
      e.currentTarget.reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeMember(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{totalActive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-500">{totalExpiringSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-red-500">{totalExpired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Members</CardTitle>
              <CardDescription>{filteredMembers.length} of {members.length} members</CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-fit">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Member</DialogTitle>
                  <DialogDescription>Creates a real row in the members table.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="member_id">Member ID</Label>
                      <Input id="member_id" name="member_id" placeholder="GSFC99" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wing_flat">Wing/Flat</Label>
                      <Input id="wing_flat" name="wing_flat" placeholder="D4/2001" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp No.</Label>
                      <Input id="whatsapp" name="whatsapp" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photo_url">Photo URL</Label>
                      <Input id="photo_url" name="photo_url" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select name="gender">
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownership">Ownership</Label>
                      <Select name="ownership">
                        <SelectTrigger id="ownership">
                          <SelectValue placeholder="Select ownership" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="TENANT">Tenant</SelectItem>
                          <SelectItem value="RENT">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plan</Label>
                      <Select name="plan" required>
                        <SelectTrigger id="plan">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAN_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select name="duration" required>
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_timing">Preferred Timing</Label>
                      <Input id="preferred_timing" name="preferred_timing" placeholder="MORNING" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_type">Payment Type</Label>
                      <Select name="payment_type">
                        <SelectTrigger id="payment_type">
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid">Amount Paid (₹)</Label>
                    <Input id="paid" name="paid" type="number" min="0" defaultValue={0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remark">Remark</Label>
                    <Input id="remark" name="remark" placeholder="e.g. Aadhaar xerox pending" />
                  </div>
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <DialogFooter>
                    <Button type="submit" disabled={saving} className="gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Add Member
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading members…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Wing/Flat</TableHead>
                    <TableHead className="hidden lg:table-cell">Ownership</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden sm:table-cell">Duration</TableHead>
                    <TableHead className="hidden lg:table-cell">End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Paid</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden xl:table-cell">Timing</TableHead>
                    <TableHead className="hidden xl:table-cell">Remark</TableHead>
                    <TableHead className="w-9" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer"
                      onClick={() => setProfileTarget(member)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name} />}
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {initialsOf(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{member.name}</span>
                            {member.member_id && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {member.member_id}{member.gender ? ` · ${member.gender}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {member.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {member.phone}
                            </span>
                          )}
                          {member.email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" /> {member.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{member.wing_flat}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{member.ownership}</TableCell>
                      <TableCell className="text-sm">{member.plan}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{member.duration}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{member.end_date}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-sm font-medium">₹{Number(member.paid).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{member.payment_type}</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{member.preferred_timing}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[160px] truncate" title={member.remark ?? undefined}>{member.remark}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(member);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No members found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the member row from the database. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Profile */}
      <Sheet open={!!profileTarget} onOpenChange={(open) => !open && setProfileTarget(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {profileTarget && (() => {
            const remaining = daysRemaining(profileTarget.end_date);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="sr-only">{profileTarget.name}</SheetTitle>
                  <SheetDescription className="sr-only">Member profile details</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6 space-y-6">
                  {/* Header: photo, name, id, status */}
                  <div className="flex flex-col items-center text-center gap-3 pt-2">
                    <Avatar className="w-24 h-24 border-2 border-border">
                      {profileTarget.photo_url && (
                        <AvatarImage src={profileTarget.photo_url} alt={profileTarget.name} />
                      )}
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {initialsOf(profileTarget.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">{profileTarget.name}</h2>
                      {profileTarget.gender && (
                        <p className="text-sm text-muted-foreground">{profileTarget.gender}</p>
                      )}
                    </div>
                    {getStatusBadge(profileTarget.status)}
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="w-4 h-4" /> Member ID
                      </span>
                      <span className="font-mono font-medium">{profileTarget.member_id ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" /> Phone
                      </span>
                      <span className="font-medium">{profileTarget.phone ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </span>
                      {profileTarget.whatsapp ? (
                        <a
                          href={waLink(profileTarget.whatsapp)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-green-500 hover:underline"
                        >
                          {profileTarget.whatsapp}
                        </a>
                      ) : (
                        <span className="font-medium">—</span>
                      )}
                    </div>

                    {profileTarget.email && (
                      <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" /> Email
                        </span>
                        <span className="font-medium truncate max-w-[200px]">{profileTarget.email}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium">{profileTarget.plan ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" /> Date of Joining
                      </span>
                      <span className="font-medium">{formatDate(profileTarget.start_date)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarClock className="w-4 h-4" /> Date of Expiry
                      </span>
                      <span className="font-medium">{formatDate(profileTarget.end_date)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm pb-1">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="w-4 h-4" /> Days Remaining
                      </span>
                      {remaining === null ? (
                        <span className="font-medium">—</span>
                      ) : remaining < 0 ? (
                        <span className="font-semibold text-red-500">Expired {Math.abs(remaining)}d ago</span>
                      ) : remaining === 0 ? (
                        <span className="font-semibold text-yellow-500">Expires today</span>
                      ) : (
                        <span className={`font-semibold ${remaining <= 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {remaining} day{remaining === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>

                  {profileTarget.remark && (
                    <div className="text-sm bg-muted/50 rounded-md p-3">
                      <p className="text-muted-foreground mb-1">Remark</p>
                      <p>{profileTarget.remark}</p>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
