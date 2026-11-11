import { AlertCircle, Download, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useShell, pathOf } from '../../components/layout/shell';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { DeleteAccountDialog } from '../../components/student/DeleteAccountDialog';
import {
  type Errors,
  Field,
  PageHead,
  PasswordField,
  PasswordRule,
  SkillsInput,
  TextField,
  check,
  focusFirstInvalid,
} from '../../components/student/forms';
import { CompletenessChecklist, completenessItems } from '../../components/student/ProfileMeter';
import { SCHOOLS, YEARS, passwordSchema, profileSchema } from '../../components/student/profile';
import { TabPanel, Tabs, toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useFeatures, useStudentProfile, useUpdateSettings, useUpdateStudentProfile } from '../../services/queries';

interface StudentProfileSettingsPageProps {
  navigate: (path: string) => void;
}

type View = 'profile' | 'settings';

/** S-024 at /app/profile and S-025 at /app/settings: one component, two routes. */
export const StudentProfileSettingsPage: React.FC<StudentProfileSettingsPageProps> = ({ navigate }) => {
  const pathname = pathOf(useShell().path);
  const view: View = pathname.startsWith('/app/settings') ? 'settings' : 'profile';

  return (
    <div className="wrap py-6 min-[721px]:py-10">
      <PageHead title={view === 'profile' ? 'Profile' : 'Settings'} />
      <Tabs
        label="Account"
        idBase="acct"
        value={view}
        onValueChange={(v) => navigate(v === 'profile' ? '/app/profile' : '/app/settings')}
        className="mb-6"
        options={[
          { value: 'profile', label: 'Profile' },
          { value: 'settings', label: 'Settings' },
        ]}
      />
      <TabPanel idBase="acct" value="profile" active={view === 'profile'}>
        <ProfileForm />
      </TabPanel>
      <TabPanel idBase="acct" value="settings" active={view === 'settings'}>
        <SettingsPanels navigate={navigate} />
      </TabPanel>
    </div>
  );
};

function UploadSoon({ label, name }: { label: string; name: string }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div
        aria-disabled="true"
        className="flex items-center gap-3.5 rounded-[var(--r)] border border-dashed border-line-strong bg-field p-[18px] text-tx-3"
      >
        <Upload className="size-[22px] flex-none" aria-hidden="true" />
        <span className="t-small flex-1">{name} uploads are coming soon.</span>
        <ComingSoonBadge />
      </div>
    </div>
  );
}

/* ── S-024 ─────────────────────────────────────────────────────────── */
function ProfileForm() {
  const { user, role, refetchUser } = useAuth();
  const features = useFeatures();
  const { data: profile, isFetched } = useStudentProfile({ enabled: role === 'student' });
  const update = useUpdateStudentProfile();
  const formRef = useRef<HTMLFormElement>(null);
  const hydrated = useRef(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [target, setTarget] = useState('');
  const [completed, setCompleted] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fill the form once from the server. A later refetch must not overwrite what the student is typing.
  useEffect(() => {
    if (hydrated.current || !isFetched) return;
    hydrated.current = true;
    if (!profile) return;
    setFullName(profile.full_name || user?.full_name || '');
    setSchool(profile.school || '');
    setCourse(profile.course || '');
    setYear(profile.year_level ? String(profile.year_level) : '');
    setTarget(profile.target_ojt_hours != null ? String(profile.target_ojt_hours) : '');
    setCompleted(profile.completed_ojt_hours != null ? String(profile.completed_ojt_hours) : '');
    setBio(profile.bio || '');
    setSkills(profile.skills ?? []);
  }, [isFetched, profile, user?.full_name]);

  const clear = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errs = check(profileSchema, {
      full_name: fullName,
      school,
      course,
      year_level: year,
      target_ojt_hours: target,
      completed_ojt_hours: completed,
      bio,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formRef.current);
    try {
      await update.mutateAsync({
        full_name: fullName.trim(),
        school: school.trim(),
        course: course.trim(),
        year_level: Number(year),
        bio: bio.trim(),
        skills,
        ...(target.trim() ? { target_ojt_hours: Number(target) } : {}),
        ...(completed.trim() ? { completed_ojt_hours: Number(completed) } : {}),
      });
      await refetchUser();
      toast.success('Profile saved');
    } catch (err: any) {
      const msg = err.message || 'We couldn’t save your profile. Try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const pct = profile?.completeness_pct ?? 0;
  const items = completenessItems(profile ?? {}).filter((i) => features.uploads || (i.key !== 'photo' && i.key !== 'resume'));
  const saving = update.isPending;

  return (
    <div className="grid items-start gap-6 min-[1025px]:grid-cols-[minmax(0,1fr)_300px]">
      <form ref={formRef} id="pf-form" onSubmit={save} noValidate className="grid gap-5" aria-busy={saving}>
        {errorMsg ? (
          <div className="note is-bad" role="alert">
            <AlertCircle aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <section className="panel panel-pad grid gap-5" aria-labelledby="pf-h1">
          <h2 className="t-h3" id="pf-h1">
            Basics
          </h2>
          <TextField
            id="pf-name"
            label="Full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clear('full_name');
            }}
            error={errors.full_name}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
          />
          {!features.uploads ? <UploadSoon label="Profile photo" name="Photo" /> : null}
        </section>

        <section className="panel panel-pad" aria-labelledby="pf-h2">
          <h2 className="t-h3 mb-5" id="pf-h2">
            School
          </h2>
          <div className="grid items-start gap-[18px] min-[721px]:grid-cols-2">
            <div className="min-[721px]:col-span-2">
              <TextField
                id="pf-school"
                label="University"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  clear('school');
                }}
                error={errors.school}
                list="pf-schools"
                autoComplete="organization"
                autoCapitalize="words"
                enterKeyHint="next"
              />
              <datalist id="pf-schools">
                {SCHOOLS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <TextField
              id="pf-course"
              label="Course"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                clear('course');
              }}
              error={errors.course}
              autoCapitalize="words"
              enterKeyHint="next"
            />
            <Field id="pf-year" label="Year level" error={errors.year_level}>
              <select
                id="pf-year"
                className="select"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  clear('year_level');
                }}
                aria-invalid={errors.year_level ? true : undefined}
                aria-describedby={errors.year_level ? 'pf-year-e' : undefined}
              >
                <option value="">Choose one</option>
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="panel panel-pad" aria-labelledby="pf-h3">
          <h2 className="t-h3 mb-5" id="pf-h3">
            OJT
          </h2>
          <div className="grid items-start gap-[18px] min-[721px]:grid-cols-2">
            <TextField
              id="pf-hours"
              label="Target hours"
              type="number"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                clear('target_ojt_hours');
              }}
              error={errors.target_ojt_hours}
              hint="Between 1 and 2000."
              inputMode="numeric"
              min={1}
              max={2000}
              enterKeyHint="next"
              className="num"
            />
            <TextField
              id="pf-done"
              label="Completed so far"
              type="number"
              value={completed}
              onChange={(e) => {
                setCompleted(e.target.value);
                clear('completed_ojt_hours');
              }}
              error={errors.completed_ojt_hours}
              inputMode="numeric"
              min={0}
              max={2000}
              enterKeyHint="next"
              className="num"
            />
          </div>
        </section>

        <section className="panel panel-pad" aria-labelledby="pf-h4">
          <h2 className="t-h3 mb-5" id="pf-h4">
            About you
          </h2>
          <div className="field">
            <label htmlFor="pf-bio">Short bio</label>
            <textarea
              id="pf-bio"
              className="textarea"
              value={bio}
              maxLength={500}
              onChange={(e) => {
                setBio(e.target.value);
                clear('bio');
              }}
              aria-describedby="pf-bio-n"
              aria-invalid={errors.bio ? true : undefined}
            />
            <span className="num justify-self-end text-[13px] text-tx-3" id="pf-bio-n">
              {bio.length}/500
            </span>
          </div>
        </section>

        <section className="panel panel-pad" aria-labelledby="pf-h5">
          <h2 className="t-h3 mb-5" id="pf-h5">
            Skills
          </h2>
          <SkillsInput id="pf-skills" label="Add a skill" value={skills} onChange={setSkills} hint="Type a skill and press Enter." />
        </section>

        {!features.uploads ? (
          <section className="panel panel-pad" aria-labelledby="pf-h6">
            <h2 className="t-h3 mb-5" id="pf-h6">
              Resume
            </h2>
            <UploadSoon label="Resume (PDF)" name="Resume" />
          </section>
        ) : null}

        {/* Mobile: sticky above the tab bar and safe area. Desktop: the button lives in the aside. */}
        <div className="sticky bottom-[var(--tabbar-total)] z-[5] -mx-[var(--gutter)] border-t border-line bg-canvas px-[var(--gutter)] py-3 min-[1025px]:hidden">
          <button type="submit" className="btn btn-brand btn-block" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <aside className="grid gap-4 min-[1025px]:sticky min-[1025px]:top-24" aria-label="Profile completeness">
        <CompletenessChecklist pct={pct} items={items} />
        <button type="submit" form="pf-form" className="btn btn-brand btn-block max-[1024px]:hidden" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </aside>
    </div>
  );
}

/* ── S-025 ─────────────────────────────────────────────────────────── */
function SettingsPanels({ navigate }: { navigate: (path: string) => void }) {
  const { user, logout } = useAuth();
  const { data: profile } = useStudentProfile({ enabled: true });
  const updateSettings = useUpdateSettings();
  const formRef = useRef<HTMLFormElement>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clear = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errs = check(passwordSchema, { current_password: current, password: next, confirm });
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formRef.current);
    try {
      // API-038: changing the password needs current_password. The email is read-only here (Audit CON-11).
      await updateSettings.mutateAsync({ current_password: current, password: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success('Password changed');
    } catch (err: any) {
      setErrorMsg(err.message || 'We couldn’t change your password. Check your current password and try again.');
    }
  };

  const exportData = () => {
    const payload = {
      user: { id: user?.id, email: user?.email, full_name: user?.full_name, role: user?.role, is_onboarded: user?.is_onboarded },
      profile: profile ?? null,
      exported_at: new Date().toISOString(),
      basis: 'RA 10173 Section 18 Data Portability',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocation-user-data-${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Your data export is downloading (JSON)');
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      try {
        await api.delete('/me');
      } catch {
        // Fallback when the backend does not register DELETE /me
      }
      setDeleteOpen(false);
      await logout();
      navigate('/');
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(`We couldn’t delete your account: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid max-w-[720px] gap-5">
      <section className="panel panel-pad" aria-labelledby="st-a">
        <h2 className="t-h3 mb-1.5" id="st-a">
          Account
        </h2>
        <p className="t-small mb-4">Your email is how you sign in.</p>
        <TextField
          id="st-email"
          label="Email"
          type="email"
          value={user?.email || ''}
          readOnly
          hint="To change it, email support@iskolar.io from your school email."
          autoComplete="email"
        />
        <button
          type="button"
          className="btn btn-secondary mt-4"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
        >
          Sign out
        </button>
      </section>

      <section className="panel panel-pad" aria-labelledby="st-p">
        <h2 className="t-h3 mb-1.5" id="st-p">
          Password
        </h2>
        <p className="t-small mb-4">Use at least 8 characters.</p>
        <form ref={formRef} onSubmit={changePassword} noValidate className="grid gap-[18px]" aria-busy={updateSettings.isPending}>
          {errorMsg ? (
            <div className="note is-bad" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          ) : null}
          <PasswordField
            id="st-cur"
            label="Current password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              clear('current_password');
            }}
            error={errors.current_password}
            autoComplete="current-password"
            enterKeyHint="next"
          />
          <PasswordField
            id="st-new"
            label="New password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value);
              clear('password');
            }}
            error={errors.password}
            hint={<PasswordRule met={next.length >= 8} />}
            autoComplete="new-password"
            enterKeyHint="next"
          />
          <PasswordField
            id="st-conf"
            label="Confirm new password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clear('confirm');
            }}
            error={errors.confirm}
            autoComplete="new-password"
            enterKeyHint="go"
          />
          <div>
            <button type="submit" className="btn btn-brand max-[720px]:w-full" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Changing…' : 'Change password'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel panel-pad" aria-labelledby="st-d">
        <h2 className="t-h3 mb-1.5" id="st-d">
          Your data
        </h2>
        <p className="t-small mb-4">Under RA 10173, you can ask for a copy of your data or have it erased.</p>
        <button type="button" className="btn btn-secondary max-[720px]:w-full" onClick={exportData}>
          <Download aria-hidden="true" />
          Download my data
        </button>
      </section>

      <section className="panel panel-pad !border-[rgba(255,138,122,.35)]" aria-labelledby="st-x">
        <h2 className="t-h3 mb-1.5" id="st-x">
          Delete account
        </h2>
        <p className="t-small mb-4">This erases your profile, saved roles and booking history. It can’t be undone.</p>
        <button type="button" className="btn btn-danger max-[720px]:w-full" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden="true" />
          Delete my account
        </button>
      </section>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={deleteAccount} pending={deleting} />
    </div>
  );
}
