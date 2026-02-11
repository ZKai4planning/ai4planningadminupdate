'use client';

interface StatusBadgeProps {
  status: string;
  type?: 'project' | 'payment' | 'client' | 'document' | 'council' | 'team';
}

const statusColors: Record<string, Record<string, string>> = {
  project: {
    pending: 'bg-gray-100 text-gray-800',
    registered: 'bg-blue-100 text-blue-800',
    docs_received: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    architect_assigned: 'bg-blue-100 text-blue-800',
    measurements_done: 'bg-blue-100 text-blue-800',
    drawings_in_progress: 'bg-purple-100 text-purple-800',
    drawings_received: 'bg-purple-100 text-purple-800',
    submitted_to_council: 'bg-indigo-100 text-indigo-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  },
  payment: {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
  },
  client: {
    registered: 'bg-blue-100 text-blue-800',
    docs_uploaded: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  },
  document: {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    requesting_update: 'bg-orange-100 text-orange-800',
  },
  council: {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    validated: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    appeal_pending: 'bg-orange-100 text-orange-800',
  },
  team: {
    active: 'bg-green-100 text-green-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
  },
};

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function StatusBadge({ status, type = 'project' }: StatusBadgeProps) {
  const colors = statusColors[type]?.[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {formatStatus(status)}
    </span>
  );
}
