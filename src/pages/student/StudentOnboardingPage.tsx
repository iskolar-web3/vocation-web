import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  type Errors,
  Field,
  Progress,
  SkillsInput,
  TextField,
  check,
  focusFirstInvalid,
} from '../../components/student/forms';
import { OJT_PRESETS, SCHOOLS, SKILL_SUGGESTIONS, YEARS, schoolSchema, targetHoursSchema } from '../../components/student/profile';
import { toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCreateStudentProfile } from '../../services/queries';

interface StudentOnboardingPageProps {
  navigate: (path: string) => void;
}

const STEPS = 3;

/** S-020. One profile, three screens: the fields are the old single form's, submitted once at the end. */
export const StudentOnboardingPage: React.FC<StudentOnboardingPageProps> = ({ navigate }) => {
  const { user, refetchUser } = useAuth();
  const createProfileMutation = useCreateStudentProfile();
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [hours, setHours] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const first = useRef(true);

  // Move focus to the new step's heading (no keyboard pop-up on phones).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step]);

  const clear = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errs =
      step === 1
        ? check(schoolSchema, { full_name: fullName, school, course, year_level: yearLevel })
        : step === 2
          ? check(targetHoursSchema, { target_ojt_hours: hours })
          : skills.length
            ? {}
            : { skills: 'Add at least one skill, or pick a suggestion.' };
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formRef.current);
    if (step < STEPS) return setStep(step + 1);

    try {
      await createProfileMutation.mutateAsync({
        full_name: fullName.trim(),
        school: school.trim(),
        course: course.trim(),
        year_level: Number(yearLevel),
        skills,
        ...(hours.trim() ? { target_ojt_hours: Number(hours) } : {}),
      });
      // Refetch the session so AuthContext reflects is_onboarded: true before the guard runs.
      await refetchUser();
      toast.success('Profile saved');
      navigate('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'We couldn’t save your profile. Check your connection and try again.');
    }
  };

  const copy = [
    ['Where do you study?', 'We use this to match roles and coaches to your course.'],
    ['How many OJT hours do you need?', 'Not sure? Your OJT coordinator knows.'],
    ['What can you do?', 'Add the skills you’d put on your resume. We’ll use them to suggest roles.'],
  ][step - 1];
  const pending = createProfileMutation.isPending;

  return (
    <div className="flex justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-[560px]">
        <div className="mb-5 grid gap-2.5">
          <span className="t-label num">
            Step {step} of {STEPS}
          </span>
          <Progress value={(step / STEPS) * 100} label="Setup progress" />
        </div>

        <div className="panel panel-pad sm:p-7">
          <h1 className="t-h2 outline-none" ref={heading} tabIndex={-1}>
            {copy[0]}
          </h1>
          <p className="t-body mt-2 mb-6">{copy[1]}</p>

          <form ref={formRef} onSubmit={next} noValidate className="grid gap-[18px]" aria-busy={pending}>
            {errorMsg ? (
              <div className="note is-bad" role="alert">
                <AlertCircle aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {step === 1 && (
              <>
                <TextField
                  id="ob-name"
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
                  placeholder="e.g. Juan Dela Cruz"
                />
                <TextField
                  id="ob-school"
                  label="University"
                  value={school}
                  onChange={(e) => {
                    setSchool(e.target.value);
                    clear('school');
                  }}
                  error={errors.school}
                  list="ob-schools"
                  autoComplete="organization"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="Start typing your school"
                />
                <datalist id="ob-schools">
                  {SCHOOLS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <TextField
                  id="ob-course"
                  label="Course"
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    clear('course');
                  }}
                  error={errors.course}
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="e.g. BS Information Technology"
                />
                <Field id="ob-year" label="Year level" error={errors.year_level}>
                  <select
                    id="ob-year"
                    className="select"
                    value={yearLevel}
                    onChange={(e) => {
                      setYearLevel(e.target.value);
                      clear('year_level');
                    }}
                    aria-invalid={errors.year_level ? true : undefined}
                    aria-describedby={errors.year_level ? 'ob-year-e' : undefined}
                  >
                    <option value="">Choose one</option>
                    {YEARS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field">
                  <span className="label" id="ob-hl">
                    Required hours
                  </span>
                  <div className="flex flex-wrap gap-2" role="group" aria-labelledby="ob-hl">
                    {OJT_PRESETS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="chip !h-11 !px-[18px]"
                        aria-pressed={Number(hours) === n}
                        onClick={() => {
                          setHours(String(n));
                          clear('target_ojt_hours');
                        }}
                      >
                        <span className="num">{n}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <TextField
                  id="ob-hours"
                  label="Or enter your own"
                  type="number"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    clear('target_ojt_hours');
                  }}
                  error={errors.target_ojt_hours}
                  hint="Between 1 and 2000 hours. Leave it blank if your school hasn’t told you yet."
                  inputMode="numeric"
                  min={1}
                  max={2000}
                  enterKeyHint="next"
                  className="num"
                />
              </>
            )}

            {step === 3 && (
              <SkillsInput
                id="ob-skills"
                label="Skills"
                value={skills}
                onChange={(v) => {
                  setSkills(v);
                  clear('skills');
                }}
                suggestions={SKILL_SUGGESTIONS}
                hint="Type a skill and press Enter."
                error={errors.skills}
              />
            )}

            <div className="mt-2 flex justify-between gap-3">
              {step > 1 ? (
                <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={pending}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="btn btn-brand flex-1 sm:flex-none" disabled={pending}>
                {step === STEPS ? (pending ? 'Saving…' : 'Finish') : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
