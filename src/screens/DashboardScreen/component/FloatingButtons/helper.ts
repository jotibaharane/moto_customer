import { Dimensions } from 'react-native';

export const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  surface: '#FFFFFF',
  backgroundDarker: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
};

export const hp = (percentage: number) =>
  Dimensions.get('window').height * (percentage / 100);
export const wp = (percentage: number) =>
  Dimensions.get('window').width * (percentage / 100);
export type FloatingButtonTab =
  | 'load-posts'
  | 'process-trips'
  | 'Reached-trips'
  | 'Loading-trips'
  | 'active-trips'
  | 'completed-trips';

export interface DashboardButton {
  id: FloatingButtonTab;
  icon: string;
  label: string;
  color: string;
  routeName: string;
}

export const DASHBOARD_BUTTONS: DashboardButton[] = [
  {
    id: 'load-posts',
    icon: 'map-marker-path',
    label: 'Pending',
    color: colors.primary,
    routeName: 'BID_CUSTOMER_LIST',
  },
  {
    id: 'process-trips',
    icon: 'calculator',
    label: 'Progress',
    color: colors.success,
    routeName: 'ACTIVE_TRIPS',
  },
  {
    id: 'Reached-trips',
    icon: 'file-document',
    label: 'Reached',
    color: colors.success,
    routeName: 'DRIVER_OPERATIONS',
  },
  {
    id: 'Loading-trips',
    icon: 'file-document',
    label: 'Loading',
    color: colors.success,
    routeName: 'DRIVER_OPERATIONS',
  },
  {
    id: 'active-trips',
    icon: 'file-document',
    label: 'Active',
    color: colors.success,
    routeName: 'DRIVER_OPERATIONS',
  },
  {
    id: 'completed-trips',
    icon: 'headset',
    label: 'Completed Trips',
    color: colors.warning,
    routeName: 'ACTIVE_TRIPS',
  },
];
