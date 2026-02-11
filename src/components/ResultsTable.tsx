import { useMemo } from "react";
import { useCsvStore } from "@/lib/csv-store";
import { Badge } from "@/components/ui/badge";
import { getIndexColor } from "@/components/FieldPanel";
import { SecurityEventCard, HIGH_VALUE_EVENTS } from "@/components/SecurityEventCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ResultsTable() {
  const { currentPage, pageSize, setCurrentPage, getSearchResults, indexes } =
    useCsvStore();

  const results = useMemo(() => getSearchResults(), [
    indexes,
    useCsvStore.getState().searchQuery,
  ]);

  const columns = useMemo(() => {
    const colSet = new Set<string>();
    results.forEach((r) => Object.keys(r.row).forEach((k) => colSet.add(k)));
    return Array.from(colSet);
  }, [results]);

  const isSecurityEventsOnly = useMemo(
    () => results.length > 0 && results.every((r) => r.index === "SecurityEvents"),
    [results]
  );

  const filteredResults = useMemo(() => {
    if (!isSecurityEventsOnly) return results;
    return results.filter((r) => {
      const eid = Object.keys(r.row).find((k) => k.toLowerCase().includes("eventid") || k.toLowerCase() === "id");
      const val = eid ? r.row[eid]?.trim() : "";
      return val ? HIGH_VALUE_EVENTS[val] !== undefined : true;
    });
  }, [results, isSecurityEventsOnly]);

  const hiddenCount = isSecurityEventsOnly ? results.length - filteredResults.length : 0;
  const displayResults = isSecurityEventsOnly ? filteredResults : results;
  const totalPages = Math.max(1, Math.ceil(displayResults.length / pageSize));
  const paged = displayResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const uniqueIndexes = new Set(results.map((r) => r.index));
  if (Object.keys(indexes).length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground border-b">
        <span>
          <strong className="text-foreground">{displayResults.length.toLocaleString()}</strong>{" "}
          {isSecurityEventsOnly ? "high-value events" : "results"} from{" "}
          <strong className="text-foreground">{uniqueIndexes.size}</strong>{" "}
          {uniqueIndexes.size === 1 ? "index" : "indexes"}
          {hiddenCount > 0 && (
            <span className="text-muted-foreground ml-1">
              ({hiddenCount} low-value events hidden)
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isSecurityEventsOnly ? (
          <div className="p-2 space-y-2">
            {paged.map((result, i) => (
              <SecurityEventCard key={i} row={result.row} indexName={result.index} />
            ))}
          </div>
        ) : (
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-32">
                    Index
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((result, i) => (
                    <TableRow key={i}>
                      <TableCell className="sticky left-0 bg-card z-10">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getIndexColor(result.index)}`}
                        >
                          {result.index}
                        </Badge>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          className="font-mono text-xs whitespace-nowrap max-w-[300px] truncate"
                        >
                          {result.row[col] ?? ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
