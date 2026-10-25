import { adminJson, toFormData } from '@/lib/api';
import * as A from '@/app/dashboard/actions';

// The same server actions the website uses (each one checks the admin token itself).
// Body: { action: 'setLicenseActive', args: [licenseId, true] }
const ACTIONS = {
  createCustomerWithLicenses: (form) => A.createCustomerWithLicenses(toFormData(form)),
  addLicenses: (customerId, count, price, note) => A.addLicenses(customerId, count, price, note),
  setLicenseActive: (id, active) => A.setLicenseActive(id, active),
  resetMachine: (id) => A.resetMachine(id),
  updateLicenseNote: (id, note, price) => A.updateLicenseNote(id, note, price),
  deleteLicense: (id) => A.deleteLicense(id),
  updateCustomer: (customerId, form) => A.updateCustomer(customerId, toFormData(form)),
  deleteCustomer: (customerId) => A.deleteCustomer(customerId),
  setFeedbackStatus: (ids, status) => A.setFeedbackStatus(ids, status),
  setFeedbackNote: (id, note) => A.setFeedbackNote(id, note),
  deleteFeedback: (id) => A.deleteFeedback(id),
  setCrashesResolved: (ids, resolved) => A.setCrashesResolved(ids, resolved),
  setCrashNote: (ids, note) => A.setCrashNote(ids, note),
  deleteCrashes: (ids) => A.deleteCrashes(ids),
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const fn = ACTIONS[body.action];
  return adminJson(async () => {
    if (!fn) return { error: 'Unknown action.' };
    return fn(...(Array.isArray(body.args) ? body.args : []));
  });
}
