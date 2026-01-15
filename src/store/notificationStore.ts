// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { create } from 'zustand';

type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  message: string | null;
  severity: NotificationSeverity;
  open: boolean;

  showNotification: (message: string, severity?: NotificationSeverity) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  message: null,
  severity: 'info',
  open: false,

  showNotification: (message, severity = 'info') =>
    set({
      message,
      severity,
      open: true,
    }),

  hideNotification: () =>
    set({
      open: false,
    }),
}));
