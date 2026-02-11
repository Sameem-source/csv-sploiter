import { Badge } from "@/components/ui/badge";
import { getIndexColor } from "@/components/FieldPanel";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

/**
 * High-value forensic Windows Security Event IDs.
 * Only these are shown when viewing SecurityEvents index.
 */
export const HIGH_VALUE_EVENTS: Record<
  string,
  { label: string; category: string; severity: "info" | "warn" | "critical" }
> = {
  // Authentication
  "4624": { label: "Successful Logon", category: "Authentication", severity: "info" },
  "4625": { label: "Failed Logon", category: "Authentication", severity: "warn" },
  "4648": { label: "Logon Using Explicit Credentials", category: "Authentication", severity: "warn" },
  "4771": { label: "Kerberos Pre-Auth Failed", category: "Authentication", severity: "warn" },
  "4776": { label: "NTLM Credential Validation", category: "Authentication", severity: "info" },

  // Privilege Escalation
  "4672": { label: "Special Privileges Assigned to Logon", category: "Privilege Escalation", severity: "warn" },

  // Account Management
  "4720": { label: "User Account Created", category: "Account Management", severity: "warn" },
  "4724": { label: "Password Reset Attempt", category: "Account Management", severity: "warn" },
  "4726": { label: "User Account Deleted", category: "Account Management", severity: "warn" },
  "4728": { label: "Member Added to Security-Enabled Global Group", category: "Account Management", severity: "warn" },
  "4732": { label: "Member Added to Security-Enabled Local Group", category: "Account Management", severity: "warn" },
  "4740": { label: "Account Locked Out", category: "Account Management", severity: "critical" },
  "4756": { label: "Member Added to Universal Security Group", category: "Account Management", severity: "warn" },

  // Persistence & Execution
  "4688": { label: "New Process Created", category: "Execution", severity: "info" },
  "4697": { label: "Service Installed on System", category: "Persistence", severity: "warn" },
  "7045": { label: "New Service Installed", category: "Persistence", severity: "warn" },
  "4698": { label: "Scheduled Task Created", category: "Persistence", severity: "warn" },

  // Lateral Movement
  "4768": { label: "Kerberos TGT Requested", category: "Lateral Movement", severity: "info" },
  "4769": { label: "Kerberos Service Ticket Requested", category: "Lateral Movement", severity: "info" },
  "5140": { label: "Network Share Object Accessed", category: "Lateral Movement", severity: "info" },
  "5145": { label: "Network Share Object Checked", category: "Lateral Movement", severity: "info" },

  // Defense Evasion
  "1102": { label: "Audit Log Was Cleared", category: "Defense Evasion", severity: "critical" },
  "4719": { label: "System Audit Policy Changed", category: "Defense Evasion", severity: "critical" },
};

const SEVERITY_ICON = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  critical: <ShieldAlert className="h-4 w-4 text-red-500" />,
};

const SEVERITY_BORDER = {
  info: "border-l-blue-400",
  warn: "border-l-amber-400",
  critical: "border-l-red-500",
};

const CATEGORY_COLOR: Record<string, string> = {
  Authentication: "bg-blue-100 text-blue-800",
  "Privilege Escalation": "bg-purple-100 text-purple-800",
  "Account Management": "bg-amber-100 text-amber-800",
  Execution: "bg-cyan-100 text-cyan-800",
  Persistence: "bg-orange-100 text-orange-800",
  "Lateral Movement": "bg-indigo-100 text-indigo-800",
  "Defense Evasion": "bg-red-100 text-red-800",
};

// Case-insensitive field lookup
function f(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
    if (found && row[found]?.trim()) return row[found].trim();
  }
  return "";
}

interface Props {
  row: Record<string, string>;
  indexName: string;
}

export function SecurityEventCard({ row, indexName }: Props) {
  const eventId = f(row, "EventId", "EventID", "Event ID", "Id", "ID");
  const meta = eventId ? HIGH_VALUE_EVENTS[eventId] : undefined;
  const severity = meta?.severity ?? "info";

  // Key forensic fields
  const fields: { label: string; value: string }[] = [
    { label: "Event ID", value: eventId },
    { label: "Description", value: meta?.label ?? "Unknown Event" },
    { label: "Time", value: f(row, "TimeCreated", "Time", "Timestamp", "Date", "DateTime", "EventTime") },
    { label: "Computer", value: f(row, "Computer", "ComputerName", "MachineName", "Host") },
    { label: "Subject Account", value: f(row, "SubjectUserName", "SubjectAccount") },
    { label: "Subject Domain", value: f(row, "SubjectDomainName", "SubjectDomain") },
    { label: "Target Account", value: f(row, "TargetUserName", "AccountName", "Account", "UserName", "User") },
    { label: "Target Domain", value: f(row, "TargetDomainName", "TargetDomain") },
    { label: "Logon Type", value: f(row, "LogonType", "Logon Type") },
    { label: "Logon ID", value: f(row, "SubjectLogonId", "TargetLogonId", "LogonId") },
    { label: "Source IP", value: f(row, "IpAddress", "SourceAddress", "SourceIP", "ClientAddress") },
    { label: "Source Port", value: f(row, "IpPort", "SourcePort") },
    { label: "Workstation", value: f(row, "WorkstationName", "Workstation") },
    { label: "Process", value: f(row, "ProcessName", "NewProcessName", "Process", "Image") },
    { label: "Process ID", value: f(row, "ProcessId", "NewProcessId") },
    { label: "Parent Process", value: f(row, "ParentProcessName", "ParentImage") },
    { label: "Service Name", value: f(row, "ServiceName", "Service") },
    { label: "Task Name", value: f(row, "TaskName") },
    { label: "Status", value: f(row, "Status") },
    { label: "Failure Reason", value: f(row, "FailureReason", "SubStatus") },
    { label: "Logon Process", value: f(row, "LogonProcessName", "LogonProcess") },
    { label: "Auth Package", value: f(row, "AuthenticationPackageName", "AuthPackage") },
    { label: "Share Name", value: f(row, "ShareName") },
    { label: "Share Path", value: f(row, "ShareLocalPath", "RelativeTargetName") },
  ].filter((x) => x.value !== "");

  // Any remaining fields not already shown
  const usedKeys = new Set<string>();
  fields.forEach(({ value }) => {
    Object.entries(row).forEach(([k, v]) => {
      if (v?.trim() === value) usedKeys.add(k);
    });
  });
  const extras = Object.entries(row).filter(
    ([k, v]) => !usedKeys.has(k) && v?.trim()
  );

  return (
    <div
      className={`border rounded-md border-l-4 ${SEVERITY_BORDER[severity]} bg-card p-3 hover:bg-accent/20 transition-colors`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {SEVERITY_ICON[severity]}
        <span className="font-mono text-sm font-bold text-foreground">
          {eventId || "?"}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {meta?.label ?? "Unknown Event"}
        </span>
        {meta?.category && (
          <Badge className={`text-[10px] border-0 ${CATEGORY_COLOR[meta.category] ?? "bg-secondary text-secondary-foreground"}`}>
            {meta.category}
          </Badge>
        )}
        <Badge variant="outline" className={`text-[10px] ml-auto ${getIndexColor(indexName)}`}>
          {indexName}
        </Badge>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex gap-1.5 text-xs leading-5">
            <span className="text-muted-foreground whitespace-nowrap shrink-0">{label}:</span>
            <span className="font-mono font-medium text-foreground truncate" title={value}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Extra fields */}
      {extras.length > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
          {extras.slice(0, 6).map(([k, v]) => (
            <span key={k}>
              <span className="font-medium">{k}:</span>{" "}
              <span className="font-mono">{v.length > 50 ? v.slice(0, 50) + "…" : v}</span>
            </span>
          ))}
          {extras.length > 6 && <span className="italic">+{extras.length - 6} more</span>}
        </div>
      )}
    </div>
  );
}
