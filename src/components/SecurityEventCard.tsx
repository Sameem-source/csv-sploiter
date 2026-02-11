import { Badge } from "@/components/ui/badge";
import { getIndexColor } from "@/components/FieldPanel";
import { Shield, Clock, User, Monitor, Hash, FileText } from "lucide-react";

// Well-known Windows Security Event IDs
const EVENT_ID_MAP: Record<string, { label: string; severity: "info" | "warn" | "critical" }> = {
  "4624": { label: "Successful Logon", severity: "info" },
  "4625": { label: "Failed Logon", severity: "warn" },
  "4634": { label: "Logoff", severity: "info" },
  "4648": { label: "Logon with Explicit Credentials", severity: "warn" },
  "4672": { label: "Special Privileges Assigned", severity: "warn" },
  "4688": { label: "New Process Created", severity: "info" },
  "4689": { label: "Process Exited", severity: "info" },
  "4697": { label: "Service Installed", severity: "warn" },
  "4698": { label: "Scheduled Task Created", severity: "warn" },
  "4699": { label: "Scheduled Task Deleted", severity: "info" },
  "4700": { label: "Scheduled Task Enabled", severity: "info" },
  "4701": { label: "Scheduled Task Disabled", severity: "info" },
  "4702": { label: "Scheduled Task Updated", severity: "info" },
  "4719": { label: "Audit Policy Changed", severity: "critical" },
  "4720": { label: "User Account Created", severity: "warn" },
  "4722": { label: "User Account Enabled", severity: "info" },
  "4723": { label: "Password Change Attempt", severity: "info" },
  "4724": { label: "Password Reset Attempt", severity: "warn" },
  "4725": { label: "User Account Disabled", severity: "info" },
  "4726": { label: "User Account Deleted", severity: "warn" },
  "4728": { label: "Member Added to Security Group", severity: "warn" },
  "4732": { label: "Member Added to Local Group", severity: "warn" },
  "4735": { label: "Local Group Changed", severity: "warn" },
  "4738": { label: "User Account Changed", severity: "info" },
  "4740": { label: "Account Locked Out", severity: "critical" },
  "4756": { label: "Member Added to Universal Group", severity: "warn" },
  "4767": { label: "Account Unlocked", severity: "info" },
  "4768": { label: "Kerberos TGT Requested", severity: "info" },
  "4769": { label: "Kerberos Service Ticket Requested", severity: "info" },
  "4770": { label: "Kerberos Service Ticket Renewed", severity: "info" },
  "4771": { label: "Kerberos Pre-Auth Failed", severity: "warn" },
  "4776": { label: "NTLM Authentication", severity: "info" },
  "4798": { label: "User Local Group Membership Enumerated", severity: "info" },
  "4799": { label: "Security Group Membership Enumerated", severity: "info" },
  "5140": { label: "Network Share Accessed", severity: "info" },
  "5145": { label: "Network Share Object Checked", severity: "info" },
  "7045": { label: "New Service Installed", severity: "warn" },
  "1102": { label: "Audit Log Cleared", severity: "critical" },
};

const SEVERITY_STYLES = {
  info: "bg-blue-500/10 text-blue-700 border-blue-200",
  warn: "bg-amber-500/10 text-amber-700 border-amber-200",
  critical: "bg-red-500/10 text-red-700 border-red-200",
};

// Try to find a column value case-insensitively
function findField(row: Record<string, string>, ...candidates: string[]): string {
  for (const c of candidates) {
    const key = Object.keys(row).find((k) => k.toLowerCase() === c.toLowerCase());
    if (key && row[key]?.trim()) return row[key];
  }
  return "";
}

interface SecurityEventCardProps {
  row: Record<string, string>;
  indexName: string;
}

export function SecurityEventCard({ row, indexName }: SecurityEventCardProps) {
  const eventId = findField(row, "EventId", "EventID", "Event ID", "Id", "ID");
  const timeCreated = findField(row, "TimeCreated", "Time", "Timestamp", "Date", "DateTime", "EventTime");
  const account = findField(row, "TargetUserName", "AccountName", "Account", "UserName", "User", "SubjectUserName");
  const computer = findField(row, "Computer", "ComputerName", "MachineName", "Workstation", "Host");
  const logonType = findField(row, "LogonType", "Logon Type");
  const sourceIp = findField(row, "IpAddress", "SourceAddress", "SourceIP", "Source IP", "ClientAddress");
  const processName = findField(row, "ProcessName", "NewProcessName", "Process", "Image");
  const message = findField(row, "Message", "Description", "Details", "EventMessage");

  const eventInfo = eventId ? EVENT_ID_MAP[eventId] : undefined;
  const severityStyle = eventInfo ? SEVERITY_STYLES[eventInfo.severity] : SEVERITY_STYLES.info;

  // Collect remaining fields not already highlighted
  const highlightedKeys = new Set<string>();
  const markUsed = (...candidates: string[]) => {
    for (const c of candidates) {
      const key = Object.keys(row).find((k) => k.toLowerCase() === c.toLowerCase());
      if (key) highlightedKeys.add(key);
    }
  };
  markUsed("EventId", "EventID", "Event ID", "Id", "ID");
  markUsed("TimeCreated", "Time", "Timestamp", "Date", "DateTime", "EventTime");
  markUsed("TargetUserName", "AccountName", "Account", "UserName", "User", "SubjectUserName");
  markUsed("Computer", "ComputerName", "MachineName", "Workstation", "Host");
  markUsed("LogonType", "Logon Type");
  markUsed("IpAddress", "SourceAddress", "SourceIP", "Source IP", "ClientAddress");
  markUsed("ProcessName", "NewProcessName", "Process", "Image");
  markUsed("Message", "Description", "Details", "EventMessage");

  const extraFields = Object.entries(row).filter(
    ([k, v]) => !highlightedKeys.has(k) && v?.trim()
  );

  return (
    <div className="border rounded-lg p-3 bg-card hover:bg-accent/30 transition-colors">
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Badge variant="outline" className={`text-[10px] ${getIndexColor(indexName)}`}>
          {indexName}
        </Badge>
        {eventId && (
          <Badge variant="outline" className={`text-xs font-mono ${severityStyle}`}>
            <Hash className="h-3 w-3 mr-1" />
            {eventId}
          </Badge>
        )}
        {eventInfo && (
          <span className="text-sm font-semibold text-foreground">
            {eventInfo.label}
          </span>
        )}
        {!eventInfo && eventId && (
          <span className="text-sm text-muted-foreground">Event {eventId}</span>
        )}
        {timeCreated && (
          <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeCreated}
          </span>
        )}
      </div>

      {/* Key fields grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs">
        {account && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Account:</span>
            <span className="font-mono font-medium truncate">{account}</span>
          </div>
        )}
        {computer && (
          <div className="flex items-center gap-1">
            <Monitor className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Computer:</span>
            <span className="font-mono font-medium truncate">{computer}</span>
          </div>
        )}
        {logonType && (
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Logon Type:</span>
            <span className="font-mono font-medium">{logonType}</span>
          </div>
        )}
        {sourceIp && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Source IP:</span>
            <span className="font-mono font-medium">{sourceIp}</span>
          </div>
        )}
        {processName && (
          <div className="flex items-center gap-1 col-span-2">
            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Process:</span>
            <span className="font-mono font-medium truncate">{processName}</span>
          </div>
        )}
      </div>

      {/* Message if present */}
      {message && (
        <p className="text-[11px] text-muted-foreground mt-2 font-mono leading-relaxed line-clamp-2">
          {message}
        </p>
      )}

      {/* Extra fields collapsed into a compact row */}
      {extraFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
          {extraFields.slice(0, 8).map(([k, v]) => (
            <span key={k}>
              <span className="font-medium">{k}:</span>{" "}
              <span className="font-mono">{v.length > 60 ? v.slice(0, 60) + "…" : v}</span>
            </span>
          ))}
          {extraFields.length > 8 && (
            <span className="italic">+{extraFields.length - 8} more</span>
          )}
        </div>
      )}
    </div>
  );
}
