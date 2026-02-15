import React from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import siteConfig from "../config/siteConfig";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerSection: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 0,
  },
  customerAddress: {
    flex: 1,
    padding: 10,
    borderRightWidth: 2,
    borderRightColor: "#000",
  },
  deliverySection: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  codHeader: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 5,
    fontSize: 10,
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  pickupBadge: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 3,
    fontSize: 9,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  codeSection: {
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  returnAddress: {
    padding: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  billTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    padding: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  productDetailsHeader: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 6,
    fontSize: 11,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  productTable: {
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  col1: { width: "30%", fontSize: 9 },
  col2: { width: "15%", fontSize: 9 },
  col3: { width: "10%", fontSize: 9 },
  col4: { width: "10%", fontSize: 9 },
  col5: { width: "35%", fontSize: 9 },
  invoiceHeader: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 6,
    fontSize: 9,
    textAlign: "right",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  invoiceBody: {
    flexDirection: "row",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  billTo: {
    flex: 1,
    padding: 10,
    borderRightWidth: 2,
    borderRightColor: "#000",
  },
  soldBy: {
    flex: 1,
    padding: 10,
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    fontSize: 8,
  },
  metaItem: {
    flexDirection: "column",
  },
  itemsTable: {
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  itemsTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    fontWeight: "bold",
    fontSize: 9,
  },
  itemsTableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 9,
  },
  itemsTableTotal: {
    flexDirection: "row",
    padding: 6,
    borderTopWidth: 2,
    borderTopColor: "#000",
    fontWeight: "bold",
    fontSize: 9,
  },
  itemCol1: { width: "40%" },
  itemCol2: { width: "10%" },
  itemCol3: { width: "17%" },
  itemCol4: { width: "16%" },
  itemCol5: { width: "17%", textAlign: "right" },
  footerNote: {
    padding: 10,
    fontSize: 8,
    lineHeight: 1.5,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#000",
  },
});

// Create Receipt Document Component
const ReceiptDocument = ({ order }) => {
  const customerName = order.user
    ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim()
    : "Customer";

  const customerAddress = order.address
    ? `${order.address.address_line1 || ""}\n${order.address.address_line2 ? order.address.address_line2 + "\n" : ""}${order.address.city || ""}, ${order.address.state || ""}\npin. ${order.address.zip_code || ""}\n${order.address.country || ""}`
    : "Address not available";

  const customerMobile = order.address.phone || "-";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.customerAddress}>
            <Text style={styles.sectionTitle}>Customer Address</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.addressText}>{customerAddress}</Text>
            <Text style={styles.addressText}>Mobile: {customerMobile}</Text>
          </View>

          <View style={styles.deliverySection}>
            <View style={styles.pickupBadge}>
              <Text>Pickup</Text>
            </View>

            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>Destination Code</Text>
              <Text style={styles.codeValue}>Pune_PandurangIndArea_L</Text>
              <Text style={styles.codeValue}>(Maharashtra)</Text>
            </View>

            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>Return Code</Text>
              <Text style={styles.codeValue}>411041</Text>
            </View>
          </View>
        </View>

        {/* Return Address */}
        <View style={styles.returnAddress}>
          <Text style={styles.sectionTitle}>If undelivered, return to:</Text>
          <Text style={styles.addressText}>{siteConfig.shopName}</Text>
          <Text style={styles.addressText}>{siteConfig.contact.address}</Text>
          <Text style={styles.addressText}>{siteConfig.contact.phone}</Text>
        </View>

        {/* Bill Title */}
        <View style={styles.billTitle}>
          <Text>Bill</Text>
        </View>

        {/* Product Details */}
        <View style={styles.productDetailsHeader}>
          <Text>Product Details</Text>
        </View>

        <View style={styles.productTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>SKU</Text>
            <Text style={styles.col2}>Size</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>Color</Text>
            <Text style={styles.col5}>Order No.</Text>
          </View>

          {order.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>
                {item.product_name ||
                  item.product_variant?.product?.name ||
                  "N/A"}
              </Text>
              <Text style={styles.col2}>
                {item.product_variant?.size || "Free Size"}
              </Text>
              <Text style={styles.col3}>{item.quantity || 1}</Text>
              <Text style={styles.col4}>NA</Text>
              <Text style={styles.col5}>
                {order.order_number || order.id} {item.id}
              </Text>
            </View>
          ))}
        </View>

        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text>
            BILL OF SUPPLY/COMMERCIAL INVOICE - Original For Recipient
          </Text>
        </View>

        {/* Invoice Body */}
        <View style={styles.invoiceBody}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>BILL TO / SHIP TO</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.addressText}>{customerAddress}</Text>
            <Text style={styles.addressText}>Mobile: {customerMobile}</Text>
          </View>

          <View style={styles.soldBy}>
            <Text style={styles.sectionTitle}>Sold by:</Text>
            <Text style={styles.addressText}>{siteConfig.shopName}</Text>
            <Text style={styles.addressText}>{siteConfig.contact.address}</Text>
            <Text style={styles.addressText}>{siteConfig.contact.phone}</Text>

            <Text
              style={[styles.addressText, { fontWeight: "bold", marginTop: 8 }]}
            >
              Enrolment No. - 272500120283ESM
            </Text>

            <View style={styles.invoiceMeta}>
              <View style={styles.metaItem}>
                <Text style={{ fontWeight: "bold" }}>Order No.</Text>
                <Text>{order.order_number || order.id}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={{ fontWeight: "bold" }}>Invoice No.</Text>
                <Text>4fakx263</Text>
              </View>
            </View>
            <View style={styles.invoiceMeta}>
              <View style={styles.metaItem}>
                <Text style={{ fontWeight: "bold" }}>Order Date</Text>
                <Text>
                  {new Date(order.created_at).toLocaleDateString("en-GB")}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={{ fontWeight: "bold" }}>Invoice Date</Text>
                <Text>{new Date().toLocaleDateString("en-GB")}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.itemsTableHeader}>
            <Text style={styles.itemCol1}>Description</Text>
            <Text style={styles.itemCol2}>Qty</Text>
            <Text style={styles.itemCol3}>Gross Amount</Text>
            <Text style={styles.itemCol4}></Text>
            <Text style={styles.itemCol5}>Total</Text>
          </View>

          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemsTableRow}>
              <Text style={styles.itemCol1}>
                {item.product_name ||
                  item.product_variant?.product?.name ||
                  "N/A"}{" "}
                - {item.product_variant?.size || "Free Size"}
              </Text>
              <Text style={styles.itemCol2}>{item.quantity || 1}</Text>
              <Text style={styles.itemCol3}>
                Rs . {parseFloat(item.price || 0).toFixed(2)}
              </Text>
              <Text style={styles.itemCol4}></Text>
              <Text style={styles.itemCol5}>
                Rs .{" "}
                {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(
                  2,
                )}
              </Text>
            </View>
          ))}

          <View style={styles.itemsTableTotal}>
            <Text style={styles.itemCol1}></Text>
            <Text style={styles.itemCol2}></Text>
            <Text style={styles.itemCol3}></Text>
            <Text style={styles.itemCol4}>Discount</Text>
            <Text style={styles.itemCol5}>
              Rs . {parseFloat(order.discount_amount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.itemsTableTotal}>
            <Text style={styles.itemCol1}></Text>
            <Text style={styles.itemCol2}></Text>
            <Text style={styles.itemCol3}></Text>
            <Text style={styles.itemCol4}>Total</Text>
            <Text style={styles.itemCol5}>
              Rs . {parseFloat(order.total_price || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text>
            This is a computer generated invoice and does not require signature.
            Other charges are charges that are applicable to your order and
            include charges for logistics fee (where applicable). Includes
            discounts for your city and/or for online payments (as applicable)
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Export function to generate and download PDF
export const generateReceipt = async (order) => {
  try {
    const blob = await pdf(<ReceiptDocument order={order} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${order.order_number || order.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    throw error;
  }
};
