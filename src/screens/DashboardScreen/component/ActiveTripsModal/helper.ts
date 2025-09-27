export const getStatusColor = (status: string | null) => {
  if (!status) return '#6C757D';

  switch (status.toLowerCase()) {
    case 'pending':
    case 'waiting':
      return '#FFA500';
    case 'confirmed':
    case 'accepted':
      return '#28A745';
    case 'in progress':
    case 'ongoing':
    case 'active':
      return '#007BFF';
    case 'completed':
    case 'delivered':
      return '#6C757D';
    case 'cancelled':
    case 'rejected':
      return '#DC3545';
    case 'assigned':
      return '#17A2B8';
    case 'picked up':
      return '#6F42C1';
    default:
      return '#6C757D';
  }
};

export const getTimeElapsed = (acceptDate: string) => {
  try {
    const accepted = new Date(acceptDate);
    const now = new Date();
    const diffMs = now.getTime() - accepted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHrs > 0) {
      return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
  } catch {
    return 'Unknown time';
  }
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};
