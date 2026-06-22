import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, X, Save } from 'lucide-react';
import { companiesService } from '../../services/companiesService';
import { CATEGORY_ORDER, CATEGORY_LABELS } from './constants';
import CarrierLogo from './CarrierLogo';
import ActionSidebar from './ActionSidebar';
import ActionFieldsTable from './ActionFieldsTable';
import ApiCredentialsBlock from './ApiCredentialsBlock';
import AutoCreateToggle from './AutoCreateToggle';
import WebhookConfigPanel from './WebhookConfigPanel';
import TestPanel from './TestPanel';
import ResponsePayload from './ResponsePayload';

function ActionConfigPanel({ carrierId, action, config, onConfigChange }) {
  const creds = config.credentials || {};
  const values = config.prefilled || {};
  const hidden = config.hidden || {};

  const handleTestResult = useCallback(({ state }) => {
    onConfigChange({ ...config, test_state: state });
  }, [config, onConfigChange]);

  // WEBHOOK action — own dedicated panel
  if (action.category === 'webhook' || action.method === 'WEBHOOK') {
    return (
      <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
        <WebhookConfigPanel
          carrierId={carrierId}
          action={action}
          config={config}
          onConfigChange={onConfigChange}
        />
      </div>
    );
  }

  // Backend marks createParcel-style actions via auto_create_enabled !== null (DTO contract).
  const supportsAutoCreate = action.auto_create_enabled !== null && action.auto_create_enabled !== undefined;

  return (
    <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
      {supportsAutoCreate ? (
        <AutoCreateToggle
          checked={config.auto_create}
          onChange={v => onConfigChange({ ...config, auto_create: v })}
        />
      ) : null}

      <ApiCredentialsBlock
        credentials={action.credentials || []}
        values={creds}
        onChange={v => onConfigChange({ ...config, credentials: v })}
      />

      <div style={{ marginBottom: '18px' }}>
        <TestPanel
          carrierId={carrierId}
          actionKey={action.key}
          initialState={config.test_state}
          onResult={handleTestResult}
        />
      </div>

      <ActionFieldsTable
        fields={action.fields || []}
        values={values}
        hiddenFields={hidden}
        onChangeValues={v => onConfigChange({ ...config, prefilled: v })}
        onChangeHidden={v => onConfigChange({ ...config, hidden: v })}
      />

      <ResponsePayload data={null} />
    </div>
  );
}

export default function IntegrationBuilderModal({ carrierId, onClose }) {
  const [company, setCompany] = useState(null);
  const [actions, setActions] = useState([]);
  const [configs, setConfigs] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, [carrierId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const compData = await companiesService.getCompany(carrierId);
      const actionsData = await companiesService.getCarrierActions(carrierId);
      console.log('COMPANY', carrierId);
      console.log('ACTIONS', actionsData);
      const c = compData.company || compData;
      const acts = Array.isArray(actionsData) ? actionsData
        : Array.isArray(actionsData?.actions) ? actionsData.actions
          : Array.isArray(actionsData?.data) ? actionsData.data
            : [];

      setCompany(c);
      setActions(acts);

      const initialConfigs = {};
      acts.forEach(a => {
        initialConfigs[a.key] = {
          credentials: a.saved_credentials || {},
          prefilled: a.saved_prefilled || {},
          hidden: a.saved_hidden || {},
          auto_create: a.auto_create_enabled ?? false,
          test_state: a.test_status === 'passed' ? 'passed'
            : a.test_status === 'failed' ? 'failed'
              : 'idle',
        };
      });
      setConfigs(initialConfigs);
      if (acts.length > 0) {
        setSelectedKey(acts.find(a => a.key === 'createProductCopy')?.key || acts[0].key);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load carrier configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(configs).map(([actionKey, config]) =>
          companiesService.saveActionConfig(carrierId, actionKey, {
            credentials: config.credentials,
            prefilled: config.prefilled,
            hidden: config.hidden,
            auto_create_enabled: config.auto_create,
          })
        )
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Group by backend-provided `category`, in fixed display order — no carrier-
  // specific logic here; new carriers just need their actions to carry a valid category.
  const groups = React.useMemo(() => {
    return CATEGORY_ORDER
      .map(cat => ({
        label: CATEGORY_LABELS[cat],
        actions: actions.filter(a => a.category === cat),
      }))
      .filter(g => g.actions.length > 0);
  }, [actions]);

  const selectedAction = actions.find(a => a.key === selectedKey);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '22px'
    }}>
      <div style={{
        width: '100%', maxWidth: '768px', height: '90vh', maxHeight: '540px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.32)'
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CarrierLogo carrierId={carrierId} size={40} radius={8} />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                Configure {company?.name || carrierId.toUpperCase()}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                Set credentials, pre-filled values and field visibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '22px', height: '22px', borderRadius: '50%',
              backgroundColor: '#a3a3a3', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0
            }}
          >
            <X size={13} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            {groups.length > 0 && (
              <ActionSidebar
                groups={groups}
                selectedKey={selectedKey}
                configs={configs}
                onSelect={setSelectedKey}
              />
            )}

            <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
              {selectedAction ? (
                <ActionConfigPanel
                  carrierId={carrierId}
                  action={selectedAction}
                  config={configs[selectedKey] || {}}
                  onConfigChange={cfg => setConfigs(prev => ({ ...prev, [selectedKey]: cfg }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Select an action from the sidebar
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)', flexShrink: 0
        }}>
          <div style={{ minWidth: 0 }}>
            {error && (
              <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} /> {error}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', width: error ? '70%' : '100%' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '11px 20px', borderRadius: '10px',
                backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                padding: '11px 24px', borderRadius: '10px',
                background: saving ? '#ede9fe' : 'linear-gradient(135deg, #a855f7, #4c1d95)',
                border: 'none', color: '#fff', fontSize: '13px',
                fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving
                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <Save size={13} />
              }
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
