// ─── companiesService.js — add these methods to your existing service ──────────
//
// Existing methods assumed:
//   getCompanies(), getCompany(id), testConnection(id), disconnectCompany(id),
//   enableUpdates(id), disableUpdates(id)
//
// NEW — required by CompanyDetailsPage integration builder:

import api from "../api/axios";
console.log('COMPANIES SERVICE FILE LOADED');
export const companiesService = {

    // ── Existing (keep) ─────────────────────────────────────────────────────────
    getCompanies: () =>
        api.get('/companies').then(r => r.data),

    getCompany: (id) =>
        api.get(`/companies/${id}`).then(r => r.data),

    testConnection: (id) =>
        api.post(`/companies/${id}/test`).then(r => r.data),

    disconnectCompany: (id) =>
        api.post(`/companies/${id}/disconnect`).then(r => r.data),

    enableUpdates: (id) =>
        api.post(`/companies/${id}/webhook/enable`).then(r => r.data),

    disableUpdates: (id) =>
        api.post(`/companies/${id}/webhook/disable`).then(r => r.data),
    getCarrierActions: (carrierId) => {
        console.log('SERVICE EXPORT KEYS', Object.keys(companiesService));

        return api
            .get(`/companies/${carrierId}/actions`)
            .then(r => {
                console.log('ACTIONS RESPONSE', r.data);
                return r.data;
            })
            .catch(err => {
                console.error('ACTIONS ERROR', err);
                console.error('ACTIONS ERROR RESPONSE', err.response?.data);
                throw err;
            });
    },
    connectCompany: (companyId, credentials) =>
        api.post(`/companies/${companyId}/connect`, credentials)
            .then(r => r.data),
    // ── NEW ─────────────────────────────────────────────────────────────────────

    /**
     * Returns the action metadata for a carrier.
     * Expected response shape:
     * {
     *   actions: [
     *     {
     *       key: "createParcel",
     *       label: "Create Parcel",
     *       method: "POST",               // GET | POST | WEBHOOK
     *       group: "MAIN ACTION",
     *       is_auto_create: true,
     *       credentials: [
     *         { key: "api_id", label: "C-Api-Id", type: "password", required: true }
     *       ],
     *       fields: [
     *         { key: "ref",            label: "ref",              type: "text",    required: true },
     *         { key: "type_livraison", label: "Type de livraison",type: "select",  required: true, options: ["SIMPLE","EXPRESS"] },
     *         { key: "ouverture",      label: "Ouverture ?",      type: "boolean", required: true }
     *       ],
     *       saved_credentials: { api_id: "••••", api_key: "••••" },
     *       saved_prefilled:   { ref: null },
     *       saved_hidden:      { ref: false },
     *       auto_create_enabled: false,
     *       config_state: "configured",  // pending | configured | error
     *       test_state:   "passed",      // pending | passed | failed
     *       // Webhook-specific:
     *       webhook_url:    "https://yourdomain.com/api/webhooks/delivery/ameex",
     *       webhook_status: "ok"
     *     }
     *   ]
     * }
     */


    /**
     * Persist config for a single action.
     * Payload: { credentials, prefilled, hidden, auto_create }
     */
    saveActionConfig: (carrierId, actionKey, config) =>
        api.put(`/companies/${carrierId}/actions/${actionKey}/config`, config).then(r => r.data),

    /**
     * Run a live test for a specific action.
     * Returns raw response payload from carrier API.
     */
    testAction: (carrierId, actionKey) =>
        api.post(`/companies/${carrierId}/actions/${actionKey}/test`).then(r => r.data),

    /**
     * Register webhook with carrier.
     */
    registerWebhook: (carrierId) =>
        api.post(`/companies/${carrierId}/webhook/register`).then(r => r.data),
};