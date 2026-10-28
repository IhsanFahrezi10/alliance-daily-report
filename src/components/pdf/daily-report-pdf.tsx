import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const INK = "#1A1A1A";
const MUTED = "#666666";
const BORDER = "#CCCCCC";
const BRAND = "#1B4F8A";

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
    marginBottom: 14,
    paddingBottom: 12,
  },
  logoLeft: { width: 110, height: "auto" },
  logoCenter: { width: 95, height: "auto" },
  logoRight: { width: 95, height: "auto" },

  // ============ TITLE + AVATAR BLOCK (CENTERED) ============
  titleWithAvatar: {
    position: "relative",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBox: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 56,
    height: 56,
  },
  avatarImg: {
    width: 56,
    height: 56,
    objectFit: "cover",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  titleTextBlock: {
    alignItems: "center",
    paddingLeft: 70,
    paddingRight: 70,
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
    marginTop: 4,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // ============ INFO ROW ============
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
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

  // ============ TABLE ============
  table: {
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0.25,
    borderBottomColor: BORDER,
    minHeight: 32,
    alignItems: "flex-start",
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

export type ReportPdfData = {
  id: string;
  tanggal: string;
  attendance?: string | null;
  kendala?: string | null;
  lesson_learned?: string | null;
  rencana_besok?: string | null;
  catatan?: string | null;
  profiles: {
    nama: string;
    role?: string;
    mentor_nama?: string | null;
    avatar_url?: string | null;
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

export default function DailyReportPDF({ report }: { report: ReportPdfData }) {
  const activities = [...(report.report_activities || [])].sort((a, b) => a.urutan - b.urutan);

  const tanggalFormatted = format(new Date(report.tanggal), "dd MMM yyyy", {
    locale: localeId,
  });

  const tanggalCetak = format(new Date(), "d MMM yyyy HH:mm", {
    locale: localeId,
  });

  const position = "Intern";
  const avatarUrl = report.profiles?.avatar_url;
  const initial = report.profiles?.nama?.charAt(0)?.toUpperCase() || "?";

  return (
    <Document title={`Daily Report - ${report.profiles?.nama} - ${report.tanggal}`} author="Maganghub × Kemnaker × Alliance" subject="Daily Report Intern Maganghub">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* LOGOS */}
        <View style={styles.logoRow} fixed>
          <Image src="/logo-alliance.png" style={styles.logoLeft} />
          <Image src="/logo-maganghub.png" style={styles.logoCenter} />
          <Image src="/logo-kemnaker.png" style={styles.logoRight} />
        </View>

        {/* TITLE + AVATAR */}
        <View style={styles.titleWithAvatar}>
          <View style={styles.avatarBox}>
            {avatarUrl ? (
              <Image src={avatarUrl} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.title}>Daily Report Intern Maganghub Batch {report.profiles?.batch || 1}</Text>
            <Text style={styles.subtitle}>PT Alliance Consumer Product × Kemnaker</Text>
          </View>
        </View>

        {/* INFO — 4 KOLOM */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{report.profiles?.nama || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{report.profiles?.departemen?.nama || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>{position}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mentor</Text>
            <Text style={styles.infoValue}>{report.profiles?.mentor_nama || "-"}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDate, styles.thText]}>Date</Text>
            <Text style={[styles.colAttendance, styles.thText]}>Attendance</Text>
            <Text style={[styles.colActivity, styles.thText]}>Activity Description</Text>
            <Text style={[styles.colLesson, styles.thText]}>Lesson Learned</Text>
            <Text style={[styles.colChallenges, styles.thText]}>Challenges</Text>
            <Text style={[styles.colSignature, styles.thText]}>Sign</Text>
          </View>

          {activities.length ? (
            activities.map((a) => (
              <View key={a.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.colDate, styles.tdText]}>{tanggalFormatted}</Text>
                <Text style={[styles.colAttendance, styles.tdText]}>{report.attendance || "Present"}</Text>
                <Text style={[styles.colActivity, styles.tdText]}>{a.deskripsi || "-"}</Text>
                <Text style={[styles.colLesson, styles.tdText]}>{report.lesson_learned || "-"}</Text>
                <Text style={[styles.colChallenges, styles.tdText]}>{report.kendala || "-"}</Text>
                <View style={styles.colSignature} />
              </View>
            ))
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
