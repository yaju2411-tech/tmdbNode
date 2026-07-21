import {Document,Page,Text,View} from "@react-pdf/renderer";
import {styles} from "../entities/pdfstyle"
import React from "react";
import { Receipt } from "../entities/receipt";

type ReceiptCardProps = {
  receipt: Receipt;
};

export const ReceiptCard = ({ receipt }: ReceiptCardProps) => {
  const formattedDate = receipt?.paid_at? new Date(receipt.paid_at).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "Unknown Date";
  return(
  <Document>
    <Page size={"A4"} style={styles.page}>
      {/*Header Section*/}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>$</Text>
          </View>
          <View style={styles}>
            <Text style={styles.title}>TMDB Receipt</Text>
            <Text style={styles.subtitle}>Original Reciept</Text>
          </View>
        </View>

        <View style={styles.rightHeader}>
          <Text style={styles.receiptTitle}>Receipt No:</Text>
          <Text style={styles.receiptNumber}>{receipt.receipt_number}</Text>
        </View>
      </View>
      {/*User + Payment*/}
      <View style={styles.infoGrid}>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>Billed To:</Text>
          <Text style={styles.userName}>{receipt.uname}</Text>
          <Text style={styles.email}>{receipt.uemail}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={[styles.label,{textAlign:"right"}]}>Payment Detail</Text>
          <Text style={styles.paymentId}>{receipt.payment_id}</Text>
          <Text style={styles.paymentDate}>{formattedDate}</Text>
        </View>
      </View>
      {/*Status*/}
      <View style={styles.statusContainer}>
        <Text style={styles.statusPaid}>{receipt.status}</Text>
      </View>
      {/*Table*/}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Item Description</Text>
        <Text style={styles.tableHeaderText}>Type</Text>
        <Text style={styles.tableHeaderText}>Amount</Text>
      </View>
      <View style={styles.tableRow}>
        <View>
          <Text style={styles.itemTitle}>{receipt.content_title}</Text>
          <Text style={styles.orderId}>Order : {receipt.order_id}</Text>
        </View>
        <Text style={styles.typeBadge}>{receipt.content_type}</Text>
        <Text style={styles.amount}>{receipt.amount} Rs.</Text>
      </View>
      {/*Total*/}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text>Subtotal</Text>
          <Text>{receipt.amount} Rs.</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Tax (0%)</Text>
          <Text>0.00 Rs.</Text>
        </View>
        <View style={styles.finalTotal}>
          <Text style={styles.finalTotalText}>Total</Text>
          <Text style={styles.finalTotalText}>{receipt.amount} Rs.</Text>
        </View>
      </View>
      {/*Footer*/}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your purchase
        </Text>
        <Text>
          If you have any problem or inquiry,
          please contact tmdb@gmail.com
        </Text>
      </View>
    </Page>
  </Document>
  );
};