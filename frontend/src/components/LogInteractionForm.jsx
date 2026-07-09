import { useSelector } from "react-redux";

const inputCls =
  "w-full text-sm rounded-md border border-slate-300 bg-slate-50 p-2.5 text-slate-700 placeholder-slate-400 cursor-not-allowed";

export default function LogInteractionForm() {
  const form = useSelector((s) => s.interaction.form);
  const suggestions = useSelector((s) => s.interaction.suggestions);

  return (
    <div className="h-full overflow-y-auto p-6 bg-white">
      <h2 className="text-xl font-bold text-slate-900 mb-5">
        Log HCP Interaction
      </h2>

      <p className="text-sm font-semibold text-slate-700 mb-3">
        Interaction Details
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            HCP Name
          </label>
          <input
            readOnly
            disabled
            value={form.hcp_name}
            placeholder="Search or select HCP..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Interaction Type
          </label>
          <input
            readOnly
            disabled
            value={form.interaction_type}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            readOnly
            disabled
            value={form.date}
            placeholder="DD-MM-YYYY"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Time
          </label>
          <input
            readOnly
            disabled
            value={form.time}
            placeholder="HH:MM"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Attendees
        </label>
        <input
          readOnly
          disabled
          value={form.attendees}
          placeholder="Enter names or search..."
          className={inputCls}
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Topics Discussed
        </label>

        <textarea
          readOnly
          disabled
          value={form.topics_discussed}
          rows={3}
          placeholder="Enter key discussion points..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <p className="text-xs text-indigo-500 mb-4">
        🎤 Summarize from Voice Note (Requires Consent)
      </p>

      <p className="text-sm font-semibold text-slate-700 mb-3">
        Materials Shared / Samples Distributed
      </p>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-slate-700">
            Materials Shared
          </label>

          <button
            disabled
            className="text-xs px-2 py-1 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed"
          >
            🔍 Search/Add
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {form.materials_shared || "No materials added."}
        </p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-slate-700">
            Samples Distributed
          </label>

          <button
            disabled
            className="text-xs px-2 py-1 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed"
          >
            💊 Add Sample
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {form.samples_distributed || "No samples added."}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Observed/Inferred HCP Sentiment
        </label>

        <div className="flex gap-4 text-sm text-slate-600">
          {["Positive", "Neutral", "Negative"].map((s) => (
            <label key={s} className="flex items-center gap-1.5">
              <input
                type="radio"
                disabled
                checked={form.sentiment === s}
                readOnly
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Outcomes
        </label>

        <textarea
          readOnly
          disabled
          value={form.outcomes}
          rows={2}
          placeholder="Key outcomes or agreements..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Follow-up Actions
        </label>

        <textarea
          readOnly
          disabled
          value={form.follow_up_actions}
          rows={2}
          placeholder="Enter next steps or tasks..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {suggestions?.length > 0 && (
        <div className="rounded-md bg-indigo-50 border border-indigo-100 p-4 mt-4">
          <p className="text-sm font-semibold text-indigo-700 mb-3">
            AI Suggested Follow-ups
          </p>

          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded bg-white border border-indigo-100 p-3"
              >
                {typeof s === "string" ? (
                  <span className="text-sm text-indigo-900">
                    • {s}
                  </span>
                ) : (
                  <>
                    <div className="font-medium text-indigo-900">
                      • {s.action}
                    </div>

                    {s.reason && (
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Reason:</strong> {s.reason}
                      </div>
                    )}

                    {s.due_date && (
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Due:</strong> {s.due_date}
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}