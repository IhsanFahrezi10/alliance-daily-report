"use client";

import { useMemo } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Download, FileText } from "lucide-react";
import DailyReportPDF, { ReportPdfData } from "@/components/pdf/daily-report-pdf";

export default function PrintViewer({ report, filename }: { report: ReportPdfData; filename: string }) {
  // Memoize PDF Document biar nggak re-render tiap parent render
  const pdfDocument = useMemo(() => <DailyReportPDF report={report} />, [report]);

  return (
    <>
      {/* HEADER ACTION */}
      <div className="flex items-center justify-end pb-4">
        <PDFDownloadLink document={pdfDocument} fileName={filename} className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.2em]">
          {({ loading }) =>
            loading ? (
              "Menyiapkan..."
            ) : (
              <>
                <Download size={13} /> Download PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>

      {/* PREVIEW */}
      <div className="border border-brand-primary/25 bg-white">
        <div className="px-4 md:px-5 py-3 border-b border-brand-primary/25 flex items-center gap-2 mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-ink/50 overflow-hidden">
          <FileText size={12} className="shrink-0" />
          <span className="truncate">Preview — {filename}</span>
        </div>

        <div className="md:hidden">
          <PDFViewer width="100%" height="600" showToolbar={false}>
            {pdfDocument}
          </PDFViewer>
        </div>
        <div className="hidden md:block">
          <PDFViewer width="100%" height="900" showToolbar={false}>
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </>
  );
}
