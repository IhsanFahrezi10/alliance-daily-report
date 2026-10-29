import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const INK = "#1A1A1A";
const MUTED = "#666666";
const BORDER = "#CCCCCC";
const BRAND = "#1B4F8A";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.35,
  },

  // ============ LOGO ROW ============
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 6,
  },
  logoLeft: { width: 80, height: "auto" },
  logoCenter: { width: 70, height: "auto" },
  logoRight: { width: 70, height: "auto" },

  // ============ TITLE + AVATAR ============
  titleWithAvatar: {
    position: "relative",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    minHeight: 40,
    justifyContent: "center",
  },
  avatarBox: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    zIndex: 2,
  },
  avatarImg: {
    width: 40,
    height: 40,
    objectFit: "cover",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  titleTextBlock: {
    width: "100%",
    paddingLeft: 48,
    paddingRight: 48,
  },
  title: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  periodText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginTop: 2,
    letterSpacing: 0.4,
    textAlign: "center",
  },

  // ============ INFO ROW ============
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    color: MUTED,
    fontFamily: "Helvetica",
    letterSpacing: 0.3,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    lineHeight: 1.2,
  },

  // ============ TABLE ============
  table: {
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.25,
    borderBottomColor: BORDER,
    minHeight: 18,
    alignItems: "flex-start",
  },
  tableRowFirstOfDay: {
    borderTopWidth: 0.5,
    borderTopColor: "#999",
    paddingTop: 5,
  },
  tableEmpty: {
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tdText: {
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.3,
  },
  tdTextMuted: {
    fontSize: 7.5,
    fontFamily: "Times-Roman",
    color: MUTED,
    fontStyle: "italic",
  },

  colDate: { width: "12%", paddingRight: 4 },
  colAttendance: { width: "11%", paddingRight: 4 },
  colActivity: { width: "38%", paddingRight: 4 },
  colLesson: { width: "20%", paddingRight: 4 },
  colChallenges: { width: "13%", paddingRight: 4 },
  colSignature: { width: "6%", textAlign: "center" },

  // ============ FOOTER ============
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
    color: MUTED,
    fontFamily: "Helvetica",
    letterSpacing: 0.3,
    paddingTop: 4,
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

export default function WeeklyReportPDF({ reports, periodLabel }: { reports: WeeklyReportData[]; periodLabel: string }) {
  if (!reports.length) return null;

  const first = reports[0];
  const position = "Intern";
  const avatarUrl = first.profiles?.avatar_url;
  const initial = first.profiles?.nama?.charAt(0)?.toUpperCase() || "?";

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
    <Document title={`Weekly Report - ${first.profiles?.nama} - ${periodLabel}`} author="Maganghub × Kemnaker × Alliance" subject="Weekly Report Intern Maganghub">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* LOGOS */}
        <View style={styles.logoRow} fixed>
          <Image src="/logo-alliance.png" style={styles.logoLeft} />
          <Image src="/logo-maganghub.png" style={styles.logoCenter} />
          <Image src="/logo-kemnaker.png" style={styles.logoRight} />
        </View>

        {/* TITLE + AVATAR */}
        <View style={styles.titleWithAvatar} fixed>
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
            <Text style={styles.title}>Daily Report Intern Maganghub Batch {first.profiles?.batch || 1}</Text>
            <Text style={styles.subtitle}>PT Alliance Consumer Product × Kemnaker</Text>
            <Text style={styles.periodText}>Periode: {periodLabel}</Text>
          </View>
        </View>

        {/* INFO — 4 KOLOM */}
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

        {/* TABLE */}
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
