import {StyleSheet} from "@react-pdf/renderer";
export const styles = StyleSheet.create({
    page: {
    backgroundColor: "#ffffff",
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 45,
    fontSize: 12,
    color: "#18181b",
  },
  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 55,
    height: 55,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    color: "white",
    fontSize:26,
    fontWeight: "bold",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "bold",
  },
  rightHeader: {
    alignItems: "flex-end",
    paddingVertical : 3 
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  receiptNumber: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "bold",
  },
  // USER + PAYMENT
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoColumn: {
    width: "48%",
  },
  label: {
    fontSize: 10,
    color: "#71717a",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    color: "#52525b",
    fontSize: 12,
  },
  paymentDate: {
    textAlign : "right",
    color: "#52525b",
    fontSize: 12,
  },
  paymentId: {
    textAlign : "right",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom : 5,
  },
  // STATUS
  statusContainer: {
    marginBottom: 35,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 11,
    textTransform: "uppercase",
    width: 75,
    textAlign: "center",
  },
  // TABLE
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "2px solid #18181b",
    paddingBottom: 12,
    marginBottom: 20,
  },
  tableHeaderText: {
    fontSize: 10,
    color: "#71717a",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #f4f4f5",
    paddingBottom: 22,
    marginBottom: 25,
  }, 
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
    textOverflow:"ellipsis"
  },
  orderId: {
    color: "#71717a",
    fontSize: 10,
  },
  typeBadge: {
    marginLeft:-30,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
  },
  // TOTAL BOX
  totalsContainer: {
    alignSelf: "flex-end",
    width: "45%",
    marginTop: 15,
    marginBottom: 40,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #f4f4f5",
    paddingVertical: 10,
    color: "#52525b",
  },
  finalTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  finalTotalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // FOOTER
  footer: {
    borderTop: "1px solid #f4f4f5",
    paddingTop: 20,
    textAlign: "center",
    color: "#71717a",
    fontSize: 10,
    marginTop: 25,
  },
  footerText: {
    marginBottom: 4,
  },
});
