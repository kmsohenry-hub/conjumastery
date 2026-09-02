import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState, mockShowToast } = vi.hoisted(() => ({
  mockState: {
    getReviewQueue: vi.fn().mockReturnValue([]),
    data: { lastActiveDate: null },
  },
  mockShowToast: vi.fn(),
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/utils/toast.js', () => ({
  showToast: mockShowToast,
}));

import { NotificationManager } from '../../../../src/ui/utils/notifications.js';

const setNotificationApi = (permission = 'default') => {
  const NotificationMock = vi.fn();
  NotificationMock.permission = permission;
  NotificationMock.requestPermission = vi.fn().mockResolvedValue(permission);
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    value: NotificationMock,
  });
  global.Notification = NotificationMock;
  return NotificationMock;
};

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<button id="notificationToggleBtn"></button>';
  mockState.getReviewQueue.mockReset();
  mockState.getReviewQueue.mockReturnValue([]);
  mockState.data = { lastActiveDate: null };
  mockShowToast.mockReset();
  NotificationManager.lastNotificationTime = 0;
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  delete window.Notification;
  document.body.innerHTML = '';
});

describe('NotificationManager.updateUI', () => {
  it('disables the toggle when notifications are unsupported', () => {
    delete window.Notification;

    NotificationManager.updateUI();

    const button = document.getElementById('notificationToggleBtn');
    expect(button.textContent).toBe('Non supporté par votre navigateur');
    expect(button.disabled).toBe(true);
  });

  it('shows the active state when permission is granted', () => {
    setNotificationApi('granted');

    NotificationManager.updateUI();

    const button = document.getElementById('notificationToggleBtn');
    expect(button.textContent).toBe('Désactiver les notifications (via navigateur)');
    expect(button.disabled).toBe(false);
    expect(button.classList.contains('active')).toBe(true);
  });

  it('blocks the toggle when permission is denied', () => {
    setNotificationApi('denied');

    NotificationManager.updateUI();

    const button = document.getElementById('notificationToggleBtn');
    expect(button.textContent).toBe('Notifications bloquées (voir réglages navigateur)');
    expect(button.disabled).toBe(true);
  });

  it('shows the activation state when permission is still undecided', () => {
    setNotificationApi('default');

    NotificationManager.updateUI();

    const button = document.getElementById('notificationToggleBtn');
    expect(button.textContent).toBe('Activer les notifications');
    expect(button.disabled).toBe(false);
    expect(button.classList.contains('active')).toBe(false);
  });
});

describe('NotificationManager.init', () => {
  it('updates the UI immediately and schedules periodic checks', () => {
    setNotificationApi('default');
    const checkSpy = vi.spyOn(NotificationManager, 'checkAndNotify');

    NotificationManager.init();
    expect(checkSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 1000);
    expect(checkSpy).toHaveBeenCalledTimes(1);

    checkSpy.mockRestore();
  });
});

describe('NotificationManager.toggle', () => {
  it('does nothing when notifications are unsupported', () => {
    delete window.Notification;

    NotificationManager.toggle();

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('requests permission and confirms activation when granted', async () => {
    const NotificationMock = setNotificationApi('default');
    NotificationMock.requestPermission.mockResolvedValue('granted');

    NotificationManager.toggle();
    await Promise.resolve();

    expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith('✅ Notifications activées', 'success');
    expect(document.getElementById('notificationToggleBtn').textContent).toBe(
      'Activer les notifications',
    );
  });

  it('does not show an activation toast when permission is denied', async () => {
    const NotificationMock = setNotificationApi('default');
    NotificationMock.requestPermission.mockResolvedValue('denied');

    NotificationManager.toggle();
    await Promise.resolve();

    expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1);
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('explains how to disable notifications when already granted', () => {
    setNotificationApi('granted');

    NotificationManager.toggle();

    expect(mockShowToast).toHaveBeenCalledWith(
      'ℹ️ Désactivez-les depuis les paramètres de votre navigateur',
      'info',
    );
  });
});

describe('NotificationManager.checkAndNotify', () => {
  it('does nothing without notification permission', () => {
    const NotificationMock = setNotificationApi('default');

    NotificationManager.checkAndNotify();

    expect(NotificationMock).not.toHaveBeenCalled();
  });

  it('notifies when the review queue is non-empty and respects the cooldown', () => {
    const NotificationMock = setNotificationApi('granted');
    mockState.getReviewQueue.mockReturnValue([{ tenseId: 'present_simple' }, {}]);

    vi.setSystemTime(new Date('2026-09-02T10:00:00'));
    NotificationManager.checkAndNotify();

    expect(NotificationMock).toHaveBeenCalledWith(
      'Temps de réviser !',
      expect.objectContaining({ body: 'Vous avez 2 leçon(s) en attente de révision.' }),
    );
    expect(NotificationManager.lastNotificationTime).toBe(Date.now());

    vi.advanceTimersByTime(NotificationManager.minInterval - 1);
    NotificationManager.checkAndNotify();
    expect(NotificationMock).toHaveBeenCalledTimes(1);
  });

  it('reminds the user to practice after an inactive day', () => {
    const NotificationMock = setNotificationApi('granted');
    mockState.getReviewQueue.mockReturnValue([]);
    mockState.data = { lastActiveDate: 'Mon Aug 31 2026' };

    vi.setSystemTime(new Date('Wed Sep 2 2026 10:00:00'));
    NotificationManager.lastNotificationTime = Date.now() - NotificationManager.minInterval * 4 - 1;

    NotificationManager.checkAndNotify();

    expect(NotificationMock).toHaveBeenCalledWith(
      "N'oubliez pas l'anglais !",
      expect.objectContaining({
        body: "Gardez votre série d'apprentissage active en faisant un exercice aujourd'hui.",
      }),
    );
    expect(NotificationManager.lastNotificationTime).toBe(Date.now());
  });

  it('does not remind again when the last activity is today', () => {
    const NotificationMock = setNotificationApi('granted');
    mockState.getReviewQueue.mockReturnValue([]);
    mockState.data = { lastActiveDate: new Date().toDateString() };
    NotificationManager.lastNotificationTime = Date.now() - NotificationManager.minInterval * 4 - 1;

    NotificationManager.checkAndNotify();

    expect(NotificationMock).not.toHaveBeenCalled();
  });
});

describe('NotificationManager.sendNotification', () => {
  it('creates a browser notification with the expected payload', () => {
    const NotificationMock = setNotificationApi('granted');

    NotificationManager.sendNotification('Titre', 'Corps');

    expect(NotificationMock).toHaveBeenCalledWith(
      'Titre',
      expect.objectContaining({ body: 'Corps', icon: expect.stringContaining('🇬🇧') }),
    );
  });
});
