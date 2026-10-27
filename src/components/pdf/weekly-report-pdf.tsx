import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const INK = "#1A1A1A";
const MUTED = "#666666";
const BORDER = "#CCCCCC";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.45,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
  },
  logoLeft: { width: 110, height: "auto" },
  logoCenter: { width: 95, height: "auto" },
  logoRight: { width: 95, height: "auto" },

  titleBlock: {
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
  },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.6,
    textAlign: "center",
    marginTop: 3,
    textTransform: "uppercase",
  },
  periodText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Helvetica",
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK,
    lineHeight: 1.3,
  },

  table: {
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 0.25,
    borderBottomColor: BORDER,
    minHeight: 30,
    alignItems: "flex-start",
  },
  tableRowFirstOfDay: {
    borderTopWidth: 0.5,
    borderTopColor: "#999",
    paddingTop: 9,
  },
  tableEmpty: {
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },

  thText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  tdText: {
    fontSize: 8.5,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.4,
  },
  tdTextMuted: {
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: MUTED,
    fontStyle: "italic",
  },

  // Column widths — TANPA WAKTU
  colDate: { width: "12%", paddingRight: 5 },
  colAttendance: { width: "11%", paddingRight: 5 },
  colActivity: { width: "38%", paddingRight: 5 },
  colLesson: { width: "20%", paddingRight: 5 },
  colChallenges: { width: "13%", paddingRight: 5 },
  colSignature: { width: "6%", textAlign: "center" },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: MUTED,
    fontFamily: "Helvetica",
    letterSpacing: 0.4,
    paddingTop: 5,
    textTransform: "uppercase",
  },
});

export type WeeklyReportData = {
  id: string;
  tanggal: string;
  attendance?: string | null;
  kendala?: string | null;
  lesson_learned?: string | null;
  profiles: {
    nama: string;
    role?: string;
    mentor_nama?: string | null;
    batch?: number | null;
    departemen?: { nama: string } | null;
  };
  report_activities: Array<{
    id: string;
    deskripsi: string;
    status: string;
    urutan: number;
  }>;
};

export default function WeeklyReportPDF({ reports, periodLabel }: { reports: WeeklyReportData[]; periodLabel: string }) {
  if (!reports.length) return null;

  const first = reports[0];
  const position = "Intern";

  const flatRows = reports.flatMap((r) => {
    const activities = [...(r.report_activities || [])].sort((a, b) => a.urutan - b.urutan);
    return activities.map((a) => ({
      reportId: r.id,
      tanggal: r.tanggal,
      attendance: r.attendance || "Present",
      lesson: r.lesson_learned || "-",
      challenges: r.kendala || "-",
      activityId: a.id,
      deskripsi: a.deskripsi,
    }));
  });

  let lastTanggal = "";

  const tanggalCetak = format(new Date(), "d MMM yyyy HH:mm", {
    locale: localeId,
  });

  return (
    <Document title={`Weekly Report - ${first.profiles?.nama} - ${periodLabel}`} author="Maganghub × Kemnaker × Alliance" subject="Weekly Report Intern Maganghub Batch 2">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER */}
        <View style={styles.logoRow} fixed>
          <Image src="/logo-alliance.png" style={styles.logoLeft} />
          <Image src="/logo-maganghub.png" style={styles.logoCenter} />
          <Image src="/logo-kemnaker.png" style={styles.logoRight} />
        </View>

        {/* TITLE */}
        <View style={styles.titleBlock} fixed>
          <Text style={styles.title}>Daily Report Intern Maganghub Batch {first.profiles?.batch || 1}</Text>
          <Text style={styles.subtitle}>PT Alliance Consumer Product × Kemnaker</Text>
          <Text style={styles.periodText}>Periode: {periodLabel}</Text>
        </View>

        <View style={styles.infoRow} fixed>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{first.profiles?.nama || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{first.profiles?.departemen?.nama || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>{position}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mentor</Text>
            <Text style={styles.infoValue}>{first.profiles?.mentor_nama || "-"}</Text>
          </View>
        </View>

        {/* TABLE — TANPA WAKTU */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.colDate, styles.thText]}>Date</Text>
            <Text style={[styles.colAttendance, styles.thText]}>Attendance</Text>
            <Text style={[styles.colActivity, styles.thText]}>Activity Description</Text>
            <Text style={[styles.colLesson, styles.thText]}>Lesson Learned</Text>
            <Text style={[styles.colChallenges, styles.thText]}>Challenges</Text>
            <Text style={[styles.colSignature, styles.thText]}>Sign</Text>
          </View>

          {flatRows.length ? (
            flatRows.map((row) => {
              const isNewDay = row.tanggal !== lastTanggal;
              lastTanggal = row.tanggal;
              const tanggalFormatted = format(new Date(row.tanggal), "dd MMM yyyy", { locale: localeId });
              return (
                <View key={row.activityId} style={[styles.tableRow, isNewDay ? styles.tableRowFirstOfDay : {}]} wrap={false}>
                  <Text style={[styles.colDate, styles.tdText]}>{isNewDay ? tanggalFormatted : ""}</Text>
                  <Text style={[styles.colAttendance, styles.tdText]}>{isNewDay ? row.attendance : ""}</Text>
                  <Text style={[styles.colActivity, styles.tdText]}>{row.deskripsi || "-"}</Text>
                  <Text style={[styles.colLesson, styles.tdText]}>{isNewDay ? row.lesson : ""}</Text>
                  <Text style={[styles.colChallenges, styles.tdText]}>{isNewDay ? row.challenges : ""}</Text>
                  <View style={styles.colSignature} />
                </View>
              );
            })
          ) : (
            <View style={styles.tableEmpty}>
              <Text style={styles.tdTextMuted}>Tidak ada aktivitas tercatat</Text>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>Dicetak: {tanggalCetak} WIB</Text>
          <Text>Maganghub × Kemnaker × Alliance</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
