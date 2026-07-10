import { useCallback, useEffect, useState } from 'react';
import { api, type Member, type NewMember } from '@/lib/api';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { members } = await api.members.list();
      setMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback(async (member: NewMember) => {
    const { member: created } = await api.members.create(member);
    setMembers((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await api.members.remove(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMember = useCallback(async (id: string, updates: Partial<Member>) => {
    const { member: updated } = await api.members.update(id, updates);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  }, []);

  return { members, loading, error, refresh, addMember, removeMember, updateMember };
}
