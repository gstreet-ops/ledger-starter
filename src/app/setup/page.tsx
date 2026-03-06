"use client";

import { useState } from "react";
import { saveSetup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

const STEPS = ["Business", "Tax Setup", "Banking", "Confirm"] as const;

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    entityType: "sole_prop",
    state: "",
    filingMethod: "self",
    taxYearStart: "01-01",
    plaidEnabled: true,
    timezone: "America/New_York",
  });

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleFinish() {
    setSaving(true);
    await saveSetup(form);
  }

  const canNext = [
    form.businessName.trim().length > 0,
    form.state.length === 2,
    true,
    true,
  ][step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 && "Your Business"}
              {step === 1 && "Tax Setup"}
              {step === 2 && "Bank Connections"}
              {step === 3 && "Review & Finish"}
            </CardTitle>
            <CardDescription>
              Step {step + 1} of {STEPS.length}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    placeholder="Acme Consulting LLC"
                    value={form.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input
                    placeholder="Jane Smith"
                    value={form.ownerName}
                    onChange={(e) => set("ownerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select value={form.entityType} onValueChange={(v) => set("entityType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_prop">Sole Proprietor</SelectItem>
                      <SelectItem value="smllc">Single-Member LLC (disregarded)</SelectItem>
                      <SelectItem value="s_corp">S-Corp</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filing Method</Label>
                  <Select value={form.filingMethod} onValueChange={(v) => set("filingMethod", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self-file</SelectItem>
                      <SelectItem value="cpa">CPA — export mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Year Start</Label>
                  <Select value={form.taxYearStart} onValueChange={(v) => set("taxYearStart", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01-01">January 1 (calendar year)</SelectItem>
                      <SelectItem value="04-01">April 1</SelectItem>
                      <SelectItem value="07-01">July 1</SelectItem>
                      <SelectItem value="10-01">October 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ledger Starter uses Plaid to connect your bank and credit card accounts.
                  You can skip this and connect manually later via CSV import.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="plaid"
                    checked={form.plaidEnabled}
                    onChange={(e) => set("plaidEnabled", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="plaid">Enable Plaid bank sync</Label>
                </div>
                {form.plaidEnabled && (
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll connect accounts from the Bank Connections page after setup.
                    Requires <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code> in .env.local.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Business</span>
                  <span>{form.businessName}</span>
                  <span className="text-muted-foreground">Owner</span>
                  <span>{form.ownerName || "—"}</span>
                  <span className="text-muted-foreground">Entity</span>
                  <span>{form.entityType}</span>
                  <span className="text-muted-foreground">State</span>
                  <span>{form.state}</span>
                  <span className="text-muted-foreground">Filing</span>
                  <span>{form.filingMethod}</span>
                  <span className="text-muted-foreground">Tax year</span>
                  <span>Starts {form.taxYearStart}</span>
                  <span className="text-muted-foreground">Plaid sync</span>
                  <span>{form.plaidEnabled ? "Enabled" : "CSV only"}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  These settings are saved to your database and can be updated later in Settings.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={saving}>
                  {saving ? "Saving..." : "Finish Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ledger-starter · open source accounting for US small businesses
        </p>
      </div>
    </div>
  );
}
