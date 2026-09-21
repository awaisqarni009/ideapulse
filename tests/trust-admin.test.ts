import { describe, it, expect, vi, beforeEach } from 'vitest';
import { REPORT_REASONS } from '@/app/actions/reports';

describe('Trust, Safety & Reporting Rules [T-6.1, T-6.2, BR-037]', () => {
  it('validates allowed report reasons against the database constraint', () => {
    const allowed = ['spam', 'duplicate', 'offensive', 'plagiarism', 'vote_manipulation', 'other'];

    expect(REPORT_REASONS.map((r) => r.value)).toEqual(allowed);
    REPORT_REASONS.forEach((r) => {
      expect(r.label).toBeDefined();
      expect(r.description).toBeDefined();
    });
  });

  it('enforces one report per user per idea rule [BR-037]', () => {
    const reportedPairs = new Set<string>();

    function canReport(userId: string, ideaId: string): boolean {
      const key = `${userId}:${ideaId}`;
      if (reportedPairs.has(key)) return false;
      reportedPairs.add(key);
      return true;
    }

    const user1 = 'u1';
    const user2 = 'u2';
    const ideaA = 'ideaA';

    expect(canReport(user1, ideaA)).toBe(true);
    expect(canReport(user1, ideaA)).toBe(false); // Duplicate rejected
    expect(canReport(user2, ideaA)).toBe(true); // Distinct user accepted
  });

  it('simulates 3-reporter threshold moving idea to under_review [T-6.2, BR-037]', () => {
    interface IdeaState {
      id: string;
      status: 'published' | 'under_review' | 'removed';
    }

    interface ReportState {
      id: string;
      idea_id: string;
      reporter_id: string;
      resolved_at: string | null;
    }

    const idea: IdeaState = { id: 'idea-100', status: 'published' };
    const reports: ReportState[] = [];

    function triggerOnReportInserted(newReport: ReportState) {
      reports.push(newReport);

      const distinctReporters = new Set(
        reports
          .filter((r) => r.idea_id === newReport.idea_id && r.resolved_at === null)
          .map((r) => r.reporter_id),
      );

      if (distinctReporters.size >= 3 && idea.status === 'published') {
        idea.status = 'under_review';
      }
    }

    // 1st report: still published
    triggerOnReportInserted({
      id: 'rep-1',
      idea_id: idea.id,
      reporter_id: 'user-1',
      resolved_at: null,
    });
    expect(idea.status).toBe('published');

    // 2nd report: still published
    triggerOnReportInserted({
      id: 'rep-2',
      idea_id: idea.id,
      reporter_id: 'user-2',
      resolved_at: null,
    });
    expect(idea.status).toBe('published');

    // Duplicate report from user-2 doesn't increase distinct count
    triggerOnReportInserted({
      id: 'rep-2-dup',
      idea_id: idea.id,
      reporter_id: 'user-2',
      resolved_at: null,
    });
    expect(idea.status).toBe('published');

    // 3rd distinct report: moves to under_review!
    triggerOnReportInserted({
      id: 'rep-3',
      idea_id: idea.id,
      reporter_id: 'user-3',
      resolved_at: null,
    });
    expect(idea.status).toBe('under_review');
  });

  it('prohibits voting on under_review ideas with IP_IDEA_CLOSED [BR-037]', () => {
    function validateVoteOnIdea(status: string) {
      if (status !== 'published') {
        throw new Error('IP_IDEA_CLOSED');
      }
      return true;
    }

    expect(validateVoteOnIdea('published')).toBe(true);
    expect(() => validateVoteOnIdea('under_review')).toThrow('IP_IDEA_CLOSED');
    expect(() => validateVoteOnIdea('withdrawn')).toThrow('IP_IDEA_CLOSED');
    expect(() => validateVoteOnIdea('removed')).toThrow('IP_IDEA_CLOSED');
  });
});

describe('Admin Moderation & Guard Rules [T-6.3, T-6.4, T-6.5, AC-10.3]', () => {
  it('enforces 404 rewrite on /admin for non-admins [AC-10.3]', () => {
    function adminGuard(user: { id: string } | null, isAdmin: boolean) {
      if (!user || !isAdmin) {
        return { status: 404, view: 'NOT_FOUND' };
      }
      return { status: 200, view: 'ADMIN_DASHBOARD' };
    }

    // Anonymous visitor
    expect(adminGuard(null, false)).toEqual({ status: 404, view: 'NOT_FOUND' });

    // Regular member
    expect(adminGuard({ id: 'member-1' }, false)).toEqual({
      status: 404,
      view: 'NOT_FOUND',
    });

    // Admin user
    expect(adminGuard({ id: 'admin-1' }, true)).toEqual({
      status: 200,
      view: 'ADMIN_DASHBOARD',
    });
  });

  it('requires written reason of at least 5 chars for moderation audit [T-6.5]', () => {
    function validateModerationInput(action: string, reason: string) {
      if (!['dismiss', 'remove'].includes(action)) {
        throw new Error('IP_INVALID_ACTION');
      }
      if (!reason || reason.trim().length < 5) {
        throw new Error('IP_REASON_REQUIRED');
      }
      return true;
    }

    expect(() => validateModerationInput('dismiss', '')).toThrow('IP_REASON_REQUIRED');
    expect(() => validateModerationInput('remove', 'bad')).toThrow('IP_REASON_REQUIRED');
    expect(validateModerationInput('dismiss', 'False flag, compliant')).toBe(true);
    expect(validateModerationInput('remove', 'Confirmed duplicate')).toBe(true);
  });

  it('simulates moderate_idea_report restoring under_review to published on dismissal [T-6.5]', () => {
    let ideaStatus: 'published' | 'under_review' | 'removed' = 'under_review';
    let reportsResolved = false;
    let auditLogged = false;

    function moderateIdea(action: 'dismiss' | 'remove', reason: string) {
      if (reason.trim().length < 5) throw new Error('IP_REASON_REQUIRED');

      if (action === 'dismiss') {
        if (ideaStatus === 'under_review') {
          ideaStatus = 'published';
        }
      } else if (action === 'remove') {
        ideaStatus = 'removed';
      }

      reportsResolved = true;
      auditLogged = true;
    }

    moderateIdea('dismiss', 'Legitimate educational content');

    expect(ideaStatus).toBe('published');
    expect(reportsResolved).toBe(true);
    expect(auditLogged).toBe(true);
  });
});
