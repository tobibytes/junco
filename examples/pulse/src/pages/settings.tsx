import * as React from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Kbd,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from "@junco/react";
import { PageContainer, PageHeader, SettingsRow, SettingsSection } from "@junco/blocks/app";
import type { PageProps } from "../app";
import { CopyIcon } from "../icons";

const WRITE_KEY = "pk_live_7f3c9a1e4b2d8f60";

function DeleteProject() {
  const [confirm, setConfirm] = React.useState("");
  const matches = confirm === "northwind-docs";
  return (
    <Dialog onOpenChange={(open) => !open && setConfirm("")}>
      <DialogTrigger asChild>
        <Button variant="danger" size="sm">
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete Northwind Docs?</DialogTitle>
          <DialogDescription>
            This deletes 8.2M events and every funnel, cohort and dashboard. It can't be undone.
          </DialogDescription>
        </DialogHeader>
        <Field label={<>Type <Kbd>northwind-docs</Kbd> to confirm</>}>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="danger"
              disabled={!matches}
              onClick={() => toast.info("Not in the demo", { description: "Deleting is turned off here, but the flow works." })}
            >
              Delete project
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage(_: PageProps) {
  const [name, setName] = React.useState("Northwind Docs");
  const [saved, setSaved] = React.useState("Northwind Docs");
  const [prefs, setPrefs] = React.useState({ anonymizeIp: true, filterBots: true, weeklyDigest: false, sessionReplay: false });
  const set = (key: keyof typeof prefs) => (value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    toast.success("Setting saved");
  };

  return (
    <PageContainer size="md">
      <PageHeader title="Settings" description="Project details, privacy and data collection." />

      <SettingsSection
        title="Project"
        description="How this project appears to your team."
        footer={
          <Button
            size="sm"
            disabled={name === saved || !name.trim()}
            onClick={() => {
              setSaved(name);
              toast.success("Project renamed", { description: `It's now called “${name}”.` });
            }}
          >
            Save changes
          </Button>
        }
      >
        <SettingsRow title="Project name" htmlFor="project-name" isStacked>
          <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
        </SettingsRow>
        <SettingsRow title="Timezone" description="Days in charts start at midnight here.">
          <Select defaultValue="utc">
            <SelectTrigger className="w-56" aria-label="Timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="ny">America/New_York</SelectItem>
              <SelectItem value="la">America/Los_Angeles</SelectItem>
              <SelectItem value="lagos">Africa/Lagos</SelectItem>
              <SelectItem value="london">Europe/London</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow title="Data retention" description="Raw events older than this are aggregated.">
          <Select defaultValue="13m">
            <SelectTrigger className="w-56" aria-label="Data retention">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 months</SelectItem>
              <SelectItem value="13m">13 months</SelectItem>
              <SelectItem value="5y">5 years</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Privacy" description="Controls applied to every event before it's stored.">
        <SettingsRow title="Anonymize IP addresses" description="Drop the last octet before geolocation." htmlFor="anon-ip">
          <Switch id="anon-ip" checked={prefs.anonymizeIp} onCheckedChange={set("anonymizeIp")} />
        </SettingsRow>
        <SettingsRow title="Filter bots and crawlers" description="Uses known user agents and behavior." htmlFor="bots">
          <Switch id="bots" checked={prefs.filterBots} onCheckedChange={set("filterBots")} />
        </SettingsRow>
        <SettingsRow title="Session replay" description="Record clicks and scrolls, never keystrokes." htmlFor="replay">
          <Switch id="replay" checked={prefs.sessionReplay} onCheckedChange={set("sessionReplay")} />
        </SettingsRow>
        <SettingsRow title="Weekly digest email" description="A Monday summary for everyone on the team." htmlFor="digest">
          <Switch id="digest" checked={prefs.weeklyDigest} onCheckedChange={set("weeklyDigest")} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Tracking" description="Paste this key into the Pulse SDK.">
        <SettingsRow title="Public write key" description="Safe to ship in client code. It can only send events.">
          <code className="rounded-control border border-border bg-muted/50 px-2.5 py-1.5 font-mono text-xs">{WRITE_KEY}</code>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Copy write key"
            onClick={() => {
              void navigator.clipboard?.writeText(WRITE_KEY).catch(() => {});
              toast.success("Write key copied");
            }}
          >
            <CopyIcon className="size-3.5" />
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Danger zone" description="Permanent actions.">
        <SettingsRow title="Delete project" description="Removes all data for Northwind Docs.">
          <DeleteProject />
        </SettingsRow>
      </SettingsSection>
    </PageContainer>
  );
}
