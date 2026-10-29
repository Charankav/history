'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_MODEL, getApiKey, getModel, setApiKey, setModel } from '@/lib/claude-browser';

export function TeacherSettings({ onChange }: { onChange?: (hasKey: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [model, setModelState] = useState(DEFAULT_MODEL);
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const k = getApiKey();
    setHasKey(!!k);
    setModelState(getModel());
    if (!k) setOpen(true);
    onChange?.(!!k);
  }, [onChange]);

  const save = () => {
    setApiKey(key);
    setModel(model || DEFAULT_MODEL);
    const ok = !!key.trim();
    setHasKey(ok);
    setKey('');
    setSaved(true);
    onChange?.(ok);
    if (ok) setOpen(false);
  };

  const remove = () => {
    setApiKey('');
    setHasKey(false);
    setSaved(false);
    onChange?.(false);
  };

  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-3 text-xs text-ink-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-bold uppercase tracking-wider"
        aria-expanded={open}
      >
        <span>Teacher Settings (Claude API key)</span>
        <span className={hasKey ? 'text-green-700' : 'text-red-700'}>
          {hasKey ? 'Key saved ✓' : 'No key set'}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2.5">
          <p>
            Paste an Anthropic API key from console.anthropic.com. It is saved only in this
            browser on this device. It is not stored on GitHub or shared with other devices.
          </p>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasKey ? 'Key saved. Paste a new one to replace it.' : 'sk-ant-...'}
            className="w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm"
          />
          <label className="block">
            <span className="font-semibold">Model</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModelState(e.target.value)}
              className="mt-1 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-ink-900 px-4 py-2 font-semibold text-white hover:bg-bronze-700"
            >
              Save
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={remove}
                className="rounded-lg border border-parchment-300 bg-white px-4 py-2 font-semibold"
              >
                Remove key
              </button>
            )}
          </div>
          {saved && <p className="text-green-700">Settings saved.</p>}
          <p className="text-[11px] text-ink-800/80">
            Tip: set a monthly spend limit in the Anthropic console, and remove the key on shared
            computers when the lesson ends.
          </p>
        </div>
      )}
    </div>
  );
}
