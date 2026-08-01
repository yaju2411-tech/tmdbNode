import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../../entities/pdfstyle";

type ReceiptCardProps = {
  receipt: any;
};

export const ReceiptCard = ({ receipt }: ReceiptCardProps) => {
  const dateVal = receipt?.createdAt || receipt?.paid_at;
  const formattedDate = dateVal
    ? new Date(dateVal).toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown Date";

  const receiptNumber = receipt?.receiptNumber || receipt?.receipt_number || "N/A";
  const userName = receipt?.user?.name || receipt?.uname || "Valued Customer";
  const userEmail = receipt?.user?.email || receipt?.uemail || "";
  const paymentId = receipt?.razorpayPaymentId || receipt?.payment_id || "N/A";
  const orderId = receipt?.razorpayOrderId || receipt?.order_id || "N/A";
  const title = receipt?.title || receipt?.content_title || "TMDB VIP Pass";
  const contentType = receipt?.contentType || receipt?.content_type || "subscription";

  return (
    <Document>
      <Page size={"A4"} style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>$</Text>
            </View>
            <View>
              <Text style={styles.title}>TMDB Receipt</Text>
              <Text style={styles.subtitle}>Original Tax Invoice</Text>
            </View>
          </View>

          <View style={styles.rightHeader}>
            <Text style={styles.receiptTitle}>Receipt No:</Text>
            <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          </View>
        </View>

        {/* User + Payment */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Billed To:</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={[styles.label, { textAlign: "right" }]}>Payment Detail</Text>
            <Text style={styles.paymentId}>{paymentId}</Text>
            <Text style={styles.paymentDate}>{formattedDate}</Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusPaid}>{(receipt?.status || "paid").toUpperCase()}</Text>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Item Description</Text>
          <Text style={styles.tableHeaderText}>Type</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <View>
            <Text style={styles.itemTitle}>{title}</Text>
            <Text style={styles.orderId}>Order : {orderId}</Text>
          </View>
          <Text style={styles.typeBadge}>{contentType.toUpperCase()}</Text>
          <Text style={styles.amount}>{receipt?.amount || 0} Rs.</Text>
        </View>

        {/* Total */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{receipt?.amount || 0} Rs.</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax (0%)</Text>
            <Text>0.00 Rs.</Text>
          </View>
          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalText}>Total</Text>
            <Text style={styles.finalTotalText}>{receipt?.amount || 0} Rs.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your purchase with TMDB!</Text>
          <Text>If you have any questions or inquiries, please contact support.</Text>
        </View>
      </Page>
    </Document>
  );
};