import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Play, Code2 } from 'lucide-react';
import ResponsePayload from './ResponsePayload';
import { companiesService } from '../../services/companiesService';

export default function TestPanel({ carrierId, actionKey, initialState, onResult }) {
  const [state, setState] = useState(initialState || 'idle'); // idle | loading | passed | failed
  const [response, setResponse] = useState(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleTest = async () => {
    setState('loading');
    try {
      const result = await companiesService.testAction(carrierId, actionKey);
      setState('passed');
      setResponse({ success: true, data: result });
      onResult?.({ state: 'passed' });
    } catch (err) {
      setState('failed');
      setResponse({ success: false, data: err.response?.data || { message: 'Test failed' } });
      onResult?.({ state: 'failed' });
    }
  };

  const stateMap = {
    idle: { color: 'var(--text-muted)', label: 'Pending test', icon: <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'inline-block' }} /> },
    loading: { color: '#f59e0b', label: 'Testing…', icon: <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: '#f59e0b' }} /> },
    passed: { color: '#10b981', label: 'Test passed', icon: <CheckCircle2 size={12} style={{ color: '#10b981' }} /> },
    failed: { color: '#ef4444', label: 'Test failed', icon: <AlertCircle size={12} style={{ color: '#ef4444' }} /> },
  };
  const s = stateMap[state] || stateMap.idle;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {s.icon}
          <span style={{ fontSize: '12px', fontWeight: '500', color: s.color }}>{s.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setShowResponse(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: '8px',
              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
              fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer'
            }}
          >
            <Code2 size={11} /> Response
          </button>
          <button
            onClick={handleTest}
            disabled={state === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px', borderRadius: '8px',
              background: state === 'loading' ? '#ede9fe' : '#f3e8ff',
              border: 'none', color: '#7c3aed', fontSize: '12px',
              fontWeight: '600', cursor: state === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {state === 'loading'
              ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
              : <Play size={11} fill="currentColor" />
            }
            Test
          </button>
        </div>
      </div>
      {showResponse && <ResponsePayload data={response?.data || null} />}
    </div>
  );
}
