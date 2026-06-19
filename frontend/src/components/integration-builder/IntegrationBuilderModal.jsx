// src/components/integration-builder/IntegrationBuilderModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
import ActionSidebar from './ActionSidebar';
import ActionFieldsTable from './ActionFieldsTable';
import ApiCredentialsBlock from './ApiCredentialsBlock';
import WebhookConfigPanel from './WebhookConfigPanel';
import AutoCreateToggle from './AutoCreateToggle';
import companiesService from '../../services/companiesService';

export default function IntegrationBuilderModal({ companyId, onClose }) {
  const [actions, setActions] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const reload = useCallback(async () => {
    const data = await companiesService.getCarrierActions(companyId);
    setActions(data);
    if (!selectedKey && data.length > 0) setSelectedKey(data[0].key);
    setLoading(false);
  }, [companyId, selectedKey]);

  useEffect(() => { reload(); }, [companyId]); // eslint-disable-line

  const current = actions.find((a) => a.key === selectedKey);

  const saveConfig = async (payload) => {
    await companiesService.saveActionConfig(companyId, selectedKey, payload);
    await reload();
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await companiesService.testAction(companyId, selectedKey);
      setTestResult(res);
    } finally {
      setTesting(false);
      reload();
    }
  };

  const handleRegisterWebhook = () => companiesService.registerWebhook(companyId);

  if (loading || !current) {
    return (
      <div className="modal-overlay">
        <div className="modal-card">Loading…</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card integration-builder">
        <div className="modal-header">
          <div>
            <h2>Configure {current.label}</h2>
            <p className="modal-subtitle">Set credentials, pre-filled values and field visibility</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <ActionSidebar actions={actions} selectedKey={selectedKey} onSelect={setSelectedKey} />

          <div className="action-panel">
            {current.category === 'webhook' ? (
              <WebhookConfigPanel action={current} onRegister={handleRegisterWebhook} />
            ) : (
              <>
                <div className="panel-toolbar">
                  <span className={`test-status test-status-${current.test_status}`}>
                    {current.test_status === 'passed' && '✅ Test passed'}
                    {current.test_status === 'failed' && '🔴 Test failed'}
                    {current.test_status === 'pending' && '⚪ Pending test'}
                  </span>
                  <div className="toolbar-actions">
                    <button type="button" className="btn-secondary" onClick={() => {}}>
                      {'</>'} Response
                    </button>
                    <button type="button" className="btn-primary" onClick={handleTest} disabled={testing}>
                      {testing ? 'Testing…' : '▶ Test'}
                    </button>
                  </div>
                </div>

                <ApiCredentialsBlock
                  action={current}
                  onSaveCredentials={(creds) => saveConfig({ credentials: creds })}
                />

                {current.auto_create_enabled !== null && (
                  <AutoCreateToggle
                    action={current}
                    onChange={(enabled) => saveConfig({ auto_create_enabled: enabled })}
                  />
                )}

                <ActionFieldsTable
                  fields={current.fields}
                  values={current.saved_prefilled}
                  hidden={current.saved_hidden}
                  onValueChange={(key, value) =>
                    saveConfig({ prefilled: { ...current.saved_prefilled, [key]: value } })
                  }
                  onToggleHidden={(key) =>
                    saveConfig({
                      hidden: { ...current.saved_hidden, [key]: !current.saved_hidden?.[key] },
                    })
                  }
                />

                {testResult && (
                  <div className="response-payload">
                    <div className="response-label">Response Payload</div>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={onClose}>💾 Save Configuration</button>
        </div>
      </div>
    </div>
  );
}