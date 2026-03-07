export const dynamic = "force-dynamic";

import { getUserSettings } from "@/lib/db/queries";
import {
  getCurrentFingerprint,
  getBaseManifest,
  computeDiff,
  hashFingerprint,
} from "@/lib/services/fingerprint";
import { CommunityView } from "./community-view";

export default async function CommunityPage() {
  const [fingerprint, baseManifest, settings] = await Promise.all([
    getCurrentFingerprint(),
    getBaseManifest(),
    getUserSettings(),
  ]);

  const diff = computeDiff(fingerprint, baseManifest);
  const fingerprintHash = hashFingerprint(fingerprint);

  return (
    <CommunityView
      fingerprint={fingerprint}
      diff={diff}
      fingerprintHash={fingerprintHash}
      communitySharingEnabled={settings?.communitySharingEnabled ?? false}
      lastSharedAt={settings?.lastSharedAt?.toISOString() ?? null}
    />
  );
}
