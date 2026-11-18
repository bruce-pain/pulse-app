import type { FormSettings, FormType } from "@/types/form";

type Props = {
  settings: FormSettings;
  formType: FormType;
  canDelete: boolean;
  onSettingsChange: (patch: Partial<FormSettings>) => void;
  onTypeChange: (type: FormType) => void;
  onDelete: () => void;
};

const FORM_TYPES: { value: FormType; label: string }[] = [
  { value: "feedback", label: "Feedback" },
  { value: "job_application", label: "Job application" },
  { value: "poll", label: "Poll" },
  { value: "survey", label: "Survey" },
];

function OnOff({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`text-sm font-semibold ${
        disabled
          ? "text-slate-400"
          : checked
            ? "text-[#050d63]"
            : "text-slate-800"
      }`}
    >
      {checked ? "On" : "Off"}
    </button>
  );
}

const note =
  "mt-2 border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500";

export function SettingsPanel({
  settings,
  formType,
  canDelete,
  onSettingsChange,
  onTypeChange,
  onDelete,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Anonymous */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-800">Anonymous responses</span>
          <OnOff
            label="Anonymous responses"
            checked={settings.anonymous}
            onChange={(value) =>
              // Anonymous forms cannot limit one response per person
              onSettingsChange({
                anonymous: value,
                one_response: value ? false : settings.one_response,
              })
            }
          />
        </div>
        <p className={note}>
          Nothing is stored that could identify who answered — no name, no
          email, no IP address. You will not be able to tell who said what, and
          neither will anyone else. This cannot be switched on later for answers
          already collected.
        </p>
      </div>

      {/* One response per person */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-800">
            One response per person
          </span>
          <OnOff
            label="One response per person"
            checked={settings.one_response}
            disabled={settings.anonymous}
            onChange={(value) => onSettingsChange({ one_response: value })}
          />
        </div>
        <p className={note}>
          {settings.anonymous
            ? "Unavailable while the form is anonymous: with no identity stored, there is nothing to check a second submission against."
            : "Each person can submit this form once."}
        </p>
      </div>

      {/* Deadline */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="deadline" className="text-sm text-slate-800">
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={settings.deadline ?? ""}
            onChange={(e) =>
              onSettingsChange({ deadline: e.target.value || null })
            }
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#050d63]"
          />
        </div>
        <p className={note}>
          The form stops accepting responses at midnight. Results and exports
          stay available.
        </p>
      </div>

      {/* Form type */}
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="form-type" className="text-sm text-slate-800">
          Form type
        </label>
        <select
          id="form-type"
          value={formType}
          onChange={(e) => onTypeChange(e.target.value as FormType)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#050d63]"
        >
          {FORM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {canDelete && (
        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onDelete}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Delete this form
          </button>
        </div>
      )}
    </div>
  );
}
