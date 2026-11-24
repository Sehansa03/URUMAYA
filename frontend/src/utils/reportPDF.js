
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  teal: [16, 61, 70],
  gold: [230, 173, 81],
  terracotta: [185, 80, 53],
  cream: [246, 238, 223],
  ink: [41, 37, 31],
  muted: [117, 108, 96],
  white: [255, 255, 255],
  line: [225, 220, 210],
};

const TITLES = {
  Sales: "Sales Performance Report",
  Products: "Product Performance Report",
  Customers: "Customer Analytics Report",
  Orders: "Order & Payment Report",
  Inventory: "Inventory Report",
};

const num = (value) => Number(value ?? 0);

const number = (value) =>
  num(value).toLocaleString("en-GB");

const money = (value) =>
  `LKR ${num(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const percent = (value, total) =>
  total > 0 ? (value / total) * 100 : 0;

const percentage = (value) =>
  `${num(value).toFixed(1)}%`;

const capitalize = (value) => {
  const text = String(value ?? "");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatDate = (value) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  );

const shortDate = (value) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }
  );

const totalCount = (items) =>
  items.reduce(
    (sum, item) => sum + num(item.count),
    0
  );

export function generateReportPDF(data, activeTab) {
  if (!data || !TITLES[activeTab]) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  const width = pageWidth - margin * 2;
  const top = 39;
  const bottom = pageHeight - 20;

  let y = top;

  // ==========================================
  // PAGE MANAGEMENT
  // ==========================================

  const newPage = () => {
    doc.addPage();
    y = top;
  };

  const ensureSpace = (height) => {
    if (y + height > bottom) {
      newPage();
    }
  };

  const drawHeader = () => {
    doc.setFillColor(...COLORS.teal);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...COLORS.gold);
    doc.text("URUMAYA", margin, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("ROOTED IN HERITAGE", margin, 21);

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(8);

    doc.text(
      "BUSINESS INTELLIGENCE",
      pageWidth - margin,
      13,
      { align: "right" }
    );

    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 28, pageWidth, 1, "F");
  };

  // ==========================================
  // TEXT AND SECTION HELPERS
  // ==========================================

  const paragraph = (text, options = {}) => {
    const fontSize = options.fontSize || 9;
    const color = options.color || COLORS.muted;
    const lineHeight = fontSize * 0.45;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(text, width);

    ensureSpace(lines.length * lineHeight + 5);

    doc.setTextColor(...color);
    doc.text(lines, margin, y + 3);

    y += lines.length * lineHeight + 5;
  };

  const sectionTitle = (title, contentHeight = 20) => {
    // Keep the heading with its following content.
    ensureSpace(12 + contentHeight);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.teal);

    doc.text(title, margin, y + 4);

    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);

    doc.line(
      margin,
      y + 7,
      pageWidth - margin,
      y + 7
    );

    y += 12;
  };

  const introduction = () => {
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.teal);

    doc.text(TITLES[activeTab], margin, y + 4);

    y += 10;

    if (activeTab === "Inventory") {
      paragraph("Reporting period: Current inventory snapshot");
    } else {
      paragraph(
        `Reporting period: ${formatDate(
          data.period.startDate
        )} to ${formatDate(data.period.endDate)}`
      );
    }

    paragraph(
      `Generated: ${new Date(
        data.generatedAt
      ).toLocaleString("en-GB", {
        timeZone: "Asia/Colombo",
      })} | Currency: LKR`,
      { fontSize: 8 }
    );

    if (activeTab !== "Inventory") {
      paragraph(
        "Payment environment: Mock payments (simulated business activity).",
        { fontSize: 8 }
      );
    }

    y += 2;
  };

  // ==========================================
  // COMPACT SUMMARY CARDS
  // ==========================================

  const drawCards = (cards) => {
    const gap = 4;
    const cardWidth = (width - gap) / 2;
    const cardHeight = 21;

    for (let i = 0; i < cards.length; i += 2) {
      ensureSpace(cardHeight + 4);

      cards.slice(i, i + 2).forEach((card, index) => {
        const x = margin + index * (cardWidth + gap);

        doc.setFillColor(...COLORS.cream);

        doc.roundedRect(
          x,
          y,
          cardWidth,
          cardHeight,
          2,
          2,
          "F"
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);

        doc.text(card.label, x + 4, y + 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.teal);

        const value = String(card.value);

        while (
          doc.getTextWidth(value) > cardWidth - 8 &&
          doc.getFontSize() > 8
        ) {
          doc.setFontSize(doc.getFontSize() - 1);
        }

        doc.text(value, x + 4, y + 15);
      });

      y += cardHeight + 4;
    }

    y += 3;
  };

  // ==========================================
  // TABLE GENERATOR
  // ==========================================

  const drawTable = (
    headers,
    rows,
    columnStyles = {}
  ) => {
    ensureSpace(22);

    autoTable(doc, {
      startY: y,
      head: [headers],

      body: rows.length
        ? rows
        : [
            [
              "No records available",
              ...Array(headers.length - 1).fill(""),
            ],
          ],

      theme: "striped",

      margin: {
        top,
        left: margin,
        right: margin,
        bottom: 22,
      },

      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 2.8,
        textColor: COLORS.ink,
        overflow: "linebreak",
        valign: "middle",
      },

      headStyles: {
        fillColor: COLORS.teal,
        textColor: COLORS.white,
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: COLORS.cream,
      },

      columnStyles,
      rowPageBreak: "avoid",
      showHead: "everyPage",
    });

    y = doc.lastAutoTable.finalY + 8;
  };

  // ==========================================
  // AUTOMATIC BUSINESS INSIGHTS
  // ==========================================

  const drawInsights = (insights) => {
    if (!insights.length) return;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const wrapped = insights.map((insight) =>
      doc.splitTextToSize(insight, width - 15)
    );

    const boxHeight =
      8 +
      wrapped.reduce(
        (sum, lines) => sum + lines.length * 4.2 + 3,
        0
      );

    sectionTitle("Key Business Insights", boxHeight);

    doc.setFillColor(...COLORS.cream);

    doc.roundedRect(
      margin,
      y,
      width,
      boxHeight,
      2,
      2,
      "F"
    );

    doc.setFillColor(...COLORS.terracotta);
    doc.rect(margin, y + 2, 1.3, boxHeight - 4, "F");

    let textY = y + 6;

    wrapped.forEach((lines) => {
      doc.setFillColor(...COLORS.terracotta);

      doc.circle(
        margin + 5,
        textY - 1,
        0.7,
        "F"
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.ink);

      doc.text(lines, margin + 9, textY);

      textY += lines.length * 4.2 + 3;
    });

    y += boxHeight + 8;
  };

  // ==========================================
  // HORIZONTAL BAR CHART
  // ==========================================

  const drawBarChart = (
    title,
    items,
    labelKey,
    valueKey
  ) => {
    const visibleItems = items.slice(0, 10);

    if (
      !visibleItems.length ||
      visibleItems.every(
        (item) => num(item[valueKey]) === 0
      )
    ) {
      sectionTitle(title, 12);
      paragraph("No activity recorded for this chart.");
      return;
    }

    const chartHeight = visibleItems.length * 10 + 5;

    sectionTitle(title, chartHeight);

    const max = Math.max(
      1,
      ...visibleItems.map((item) =>
        num(item[valueKey])
      )
    );

    const labelWidth = 54;
    const valueWidth = 24;
    const barWidth = width - labelWidth - valueWidth;

    visibleItems.forEach((item) => {
      const value = num(item[valueKey]);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.ink);

      let label = String(item[labelKey] ?? "");

      while (
        doc.getTextWidth(label) > labelWidth - 4 &&
        label.length > 3
      ) {
        label = label.replace(/\.{3}$/, "");
        label = `${label.slice(0, -1)}...`;
      }

      doc.text(label, margin, y + 4);

      doc.setFillColor(...COLORS.cream);

      doc.rect(
        margin + labelWidth,
        y,
        barWidth,
        5.5,
        "F"
      );

      if (value > 0) {
        doc.setFillColor(...COLORS.teal);

        doc.rect(
          margin + labelWidth,
          y,
          (value / max) * barWidth,
          5.5,
          "F"
        );
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.teal);

      doc.text(
        number(value),
        pageWidth - margin,
        y + 4,
        { align: "right" }
      );

      y += 10;
    });

    y += 5;
  };

  // ==========================================
  // REVENUE TREND CHART
  // ==========================================

  const drawRevenueChart = (items) => {
    if (
      !items.length ||
      items.every((item) => num(item.revenue) === 0)
    ) {
      sectionTitle("Revenue Trend", 12);
      paragraph(
        "No successful payments during this period."
      );
      return;
    }

    sectionTitle("Revenue Trend (LKR)", 61);

    const chartX = margin + 25;
    const chartY = y + 3;
    const chartWidth = width - 30;
    const chartHeight = 43;

    const max = Math.max(
      1,
      ...items.map((item) => num(item.revenue))
    );

    const magnitude = Math.pow(
      10,
      Math.floor(Math.log10(max))
    );

    const axisMax =
      Math.ceil(max / magnitude) * magnitude;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    for (let i = 0; i <= 4; i++) {
      const lineY =
        chartY + (i / 4) * chartHeight;

      const value = axisMax * (1 - i / 4);

      doc.setDrawColor(...COLORS.line);
      doc.setLineWidth(0.2);

      doc.line(
        chartX,
        lineY,
        chartX + chartWidth,
        lineY
      );

      doc.setTextColor(...COLORS.muted);

      doc.text(
        number(Math.round(value)),
        chartX - 3,
        lineY + 1,
        { align: "right" }
      );
    }

    const points = items.map((item, index) => ({
      x:
        chartX +
        (items.length === 1
          ? chartWidth / 2
          : (index / (items.length - 1)) * chartWidth),

      y:
        chartY +
        chartHeight -
        (num(item.revenue) / axisMax) * chartHeight,

      revenue: num(item.revenue),
      date: item.date,
    }));

    doc.setDrawColor(...COLORS.teal);
    doc.setLineWidth(0.65);

    for (let i = 1; i < points.length; i++) {
      doc.line(
        points[i - 1].x,
        points[i - 1].y,
        points[i].x,
        points[i].y
      );
    }

    // Highlight actual sales days.
    doc.setFillColor(...COLORS.terracotta);

    points.forEach((point) => {
      if (point.revenue > 0) {
        doc.circle(point.x, point.y, 0.9, "F");
      }
    });

    // Include intermediate date labels.
    const labelCount = Math.min(6, items.length);

    const indexes = new Set();

    for (let i = 0; i < labelCount; i++) {
      indexes.add(
        labelCount === 1
          ? 0
          : Math.round(
              (i / (labelCount - 1)) *
                (items.length - 1)
            )
      );
    }

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);

    indexes.forEach((index) => {
      const point = points[index];

      doc.text(
        shortDate(point.date),
        point.x,
        chartY + chartHeight + 5,
        {
          align:
            index === 0
              ? "left"
              : index === items.length - 1
                ? "right"
                : "center",
        }
      );
    });

    y += 58;
  };

  // ==========================================
  // REPORT INTRODUCTION
  // ==========================================

  introduction();

  // ==========================================
  // 1. SALES PERFORMANCE REPORT
  // ==========================================

  if (activeTab === "Sales") {
    const sales = data.sales;
    const trend = data.salesTrend || [];

    const activeDays = trend.filter(
      (item) => num(item.orders) > 0
    );

    const inactiveDays =
      trend.length - activeDays.length;

    const peakDay = activeDays.reduce(
      (best, item) =>
        !best || num(item.revenue) > num(best.revenue)
          ? item
          : best,
      null
    );

    drawCards([
      {
        label: "Total Revenue",
        value: money(sales.revenue),
      },
      {
        label: "Orders Created",
        value: number(sales.totalOrders),
      },
      {
        label: "Paid Orders",
        value: number(sales.paidOrders),
      },
      {
        label: "Average Paid Order Value",
        value: money(sales.averageOrderValue),
      },
    ]);

    drawRevenueChart(trend);

    const insights = [];

    if (peakDay) {
      insights.push(
        `Highest revenue day: ${formatDate(
          peakDay.date
        )}, generating ${money(
          peakDay.revenue
        )} from ${number(peakDay.orders)} paid order(s).`
      );

      insights.push(
        `${percentage(
          percent(peakDay.revenue, sales.revenue)
        )} of total revenue was generated on the highest revenue day.`
      );

      insights.push(
        `Sales occurred on ${activeDays.length} of ${trend.length} reporting days. ${inactiveDays} day(s) recorded no successful payments.`
      );
    } else {
      insights.push(
        "No successful payments were recorded during the selected reporting period."
      );
    }

    if (num(sales.revenue) > 0) {
      insights.push(
        `Product sales contributed ${percentage(
          percent(
            sales.productRevenue,
            sales.revenue
          )
        )} of total revenue. The remaining revenue came from shipping charges.`
      );
    }

    drawInsights(insights);

    // Begin detailed analysis on a new page.
    newPage();

    sectionTitle("Detailed Sales Analysis", 15);

    paragraph(
      `Reporting period: ${formatDate(
        data.period.startDate
      )} to ${formatDate(data.period.endDate)}`
    );

    sectionTitle("Revenue Breakdown", 35);

    drawTable(
      ["Revenue Source", "Amount", "Share"],
      [
        [
          "Product Revenue",
          money(sales.productRevenue),
          percentage(
            percent(
              sales.productRevenue,
              sales.revenue
            )
          ),
        ],
        [
          "Shipping Revenue",
          money(sales.shippingRevenue),
          percentage(
            percent(
              sales.shippingRevenue,
              sales.revenue
            )
          ),
        ],
        [
          "Total Revenue",
          money(sales.revenue),
          num(sales.revenue) > 0 ? "100.0%" : "0.0%",
        ],
      ],
      {
        1: { halign: "right" },
        2: { halign: "right" },
      }
    );

    sectionTitle("Sales by Active Date", 30);

    paragraph(
      "Only dates with successful payments are listed below. Days without sales are summarized separately."
    );

    drawTable(
      ["Date", "Paid Orders", "Revenue"],
      [
        ...activeDays.map((item) => [
          formatDate(item.date),
          number(item.orders),
          money(item.revenue),
        ]),
        [
          "Total",
          number(sales.paidOrders),
          money(sales.revenue),
        ],
      ],
      {
        1: { halign: "right" },
        2: { halign: "right" },
      }
    );

    sectionTitle("Sales Activity Summary", 35);

    drawTable(
      ["Metric", "Value"],
      [
        ["Reporting Days", number(trend.length)],
        ["Days with Sales", number(activeDays.length)],
        ["Days without Sales", number(inactiveDays)],
        [
          "Sales Activity Rate",
          percentage(
            percent(activeDays.length, trend.length)
          ),
        ],
      ],
      {
        1: { halign: "right" },
      }
    );

    sectionTitle("Report Notes", 20);

    paragraph(
      "Revenue includes successful mock payments only. Orders created are counted by creation date, while paid orders are counted by payment date. These figures may represent different groups of orders."
    );

    paragraph(
      "Revenue represents sales receipts, including shipping charges. It does not represent net profit."
    );
  }

  // ==========================================
  // 2. PRODUCT PERFORMANCE REPORT
  // ==========================================

  if (activeTab === "Products") {
    const products = data.topProducts || [];

    const unitsSold = products.reduce(
      (sum, item) => sum + num(item.unitsSold),
      0
    );

    const listedRevenue = products.reduce(
      (sum, item) => sum + num(item.revenue),
      0
    );

    const bestSeller = products.reduce(
      (best, item) =>
        !best ||
        num(item.unitsSold) > num(best.unitsSold)
          ? item
          : best,
      null
    );

    const highestRevenue = products.reduce(
      (best, item) =>
        !best ||
        num(item.revenue) > num(best.revenue)
          ? item
          : best,
      null
    );

    drawCards([
      {
        label: "Ranked Products",
        value: number(products.length),
      },
      {
        label: "Units Sold - Ranked Products",
        value: number(unitsSold),
      },
      {
        label: "Revenue - Ranked Products",
        value: money(listedRevenue),
      },
      {
        label: "Total Product Revenue",
        value: money(data.sales.productRevenue),
      },
    ]);

    drawBarChart(
      "Best-Selling Products",
      products,
      "name",
      "unitsSold"
    );

    const insights = [];

    if (bestSeller) {
      insights.push(
        `Best-selling product: ${bestSeller.name}, with ${number(
          bestSeller.unitsSold
        )} units sold.`
      );

      insights.push(
        `Among the ranked products, ${highestRevenue.name} generated the highest revenue of ${money(
          highestRevenue.revenue
        )}.`
      );

      insights.push(
        `The best-selling product accounted for ${percentage(
          percent(bestSeller.unitsSold, unitsSold)
        )} of units sold among the listed products.`
      );

      insights.push(
        `The listed products contributed ${percentage(
          percent(
            listedRevenue,
            data.sales.productRevenue
          )
        )} of total product revenue.`
      );
    } else {
      insights.push(
        "No product sales were recorded during the selected period."
      );
    }

    drawInsights(insights);

    sectionTitle("Product Sales Breakdown", 35);

    drawTable(
      ["Rank", "Product", "SKU", "Units", "Revenue"],
      products.map((item, index) => [
        index + 1,
        item.name,
        item.sku,
        number(item.unitsSold),
        money(item.revenue),
      ]),
      {
        0: { cellWidth: 13 },
        3: { halign: "right" },
        4: { halign: "right" },
      }
    );

    sectionTitle("Report Notes", 15);

    paragraph(
      "This report ranks up to 10 products by units sold in successfully paid orders. Product revenue excludes shipping charges. Revenue comparisons are limited to the ranked products."
    );
  }

  // ==========================================
  // 3. CUSTOMER ANALYTICS REPORT
  // ==========================================

  if (activeTab === "Customers") {
    const customers = data.customers;

    const oneTimeCustomers = Math.max(
      0,
      num(customers.purchasingCustomers) -
        num(customers.repeatCustomers)
    );

    drawCards([
      {
        label: "Registered Customers",
        value: number(customers.totalCustomers),
      },
      {
        label: "New Customers",
        value: number(customers.newCustomers),
      },
      {
        label: "Purchasing Customers",
        value: number(customers.purchasingCustomers),
      },
      {
        label: "Repeat Customers",
        value: number(customers.repeatCustomers),
      },
      {
        label: "Repeat Purchase Rate",
        value: percentage(
          customers.repeatPurchaseRate
        ),
      },
      {
        label: "One-Time Purchasing Customers",
        value: number(oneTimeCustomers),
      },
    ]);

    drawBarChart(
      "Customer Purchase Behaviour",
      [
        {
          label: "One Paid Order",
          count: oneTimeCustomers,
        },
        {
          label: "Two or More Paid Orders",
          count: num(customers.repeatCustomers),
        },
      ],
      "label",
      "count"
    );

    const insights = [
      `${number(
        customers.newCustomers
      )} new customer account(s) were registered during the reporting period.`,
    ];

    if (num(customers.purchasingCustomers) > 0) {
      insights.push(
        `${number(
          customers.purchasingCustomers
        )} distinct customer(s) completed at least one successful payment.`
      );

      insights.push(
        `${percentage(
          customers.repeatPurchaseRate
        )} of purchasing customers completed two or more paid orders during this period.`
      );

      insights.push(
        `${number(
          oneTimeCustomers
        )} customer(s) completed exactly one paid order during this period.`
      );
    } else {
      insights.push(
        "No customer purchases were recorded during the selected period. Repeat purchasing behaviour cannot be assessed."
      );
    }

    drawInsights(insights);

    sectionTitle("Customer Activity Breakdown", 30);

    drawTable(
      ["Customer Metric", "Value"],
      [
        [
          "Current Registered Customers",
          number(customers.totalCustomers),
        ],
        [
          "New Registrations",
          number(customers.newCustomers),
        ],
        [
          "Purchasing Customers",
          number(customers.purchasingCustomers),
        ],
        [
          "One-Time Purchasing Customers",
          number(oneTimeCustomers),
        ],
        [
          "Repeat Customers",
          number(customers.repeatCustomers),
        ],
        [
          "Repeat Purchase Rate",
          percentage(customers.repeatPurchaseRate),
        ],
      ],
      {
        1: { halign: "right" },
      }
    );

    sectionTitle("Report Notes", 20);

    paragraph(
      "Repeat purchase rate is calculated by dividing repeat customers by purchasing customers. It measures activity within the selected period, not lifetime customer retention."
    );

    paragraph(
      "Registered customers represents the current account total. Purchasing customers are counted by successful payment date."
    );
  }

  // ==========================================
  // 4. ORDER AND PAYMENT REPORT
  // ==========================================

  if (activeTab === "Orders") {
    const orderStatuses = data.orderStatuses || [];
    const paymentStatuses = data.paymentStatuses || [];

    const totalOrders = totalCount(orderStatuses);
    const totalPayments = totalCount(paymentStatuses);

    const getCount = (items, status) =>
      num(
        items.find((item) => item.status === status)
          ?.count
      );

    const delivered = getCount(
      orderStatuses,
      "delivered"
    );

    const cancelled = getCount(
      orderStatuses,
      "cancelled"
    );

    const paid = getCount(paymentStatuses, "paid");
    const failed = getCount(paymentStatuses, "failed");

    const pending = getCount(
      paymentStatuses,
      "pending"
    );

    const refunded = getCount(
      paymentStatuses,
      "refunded"
    );

    drawCards([
      {
        label: "Total Orders",
        value: number(totalOrders),
      },
      {
        label: "Currently Paid Orders",
        value: number(paid),
      },
      {
        label: "Delivered Orders",
        value: number(delivered),
      },
      {
        label: "Cancelled Orders",
        value: number(cancelled),
      },
    ]);

    drawBarChart(
      "Order Status Distribution",
      orderStatuses.map((item) => ({
        ...item,
        label: capitalize(item.status),
      })),
      "label",
      "count"
    );

    const insights = [];

    if (totalOrders > 0) {
      const highestStatus = orderStatuses.reduce(
        (best, item) =>
          !best || num(item.count) > num(best.count)
            ? item
            : best,
        null
      );

      insights.push(
        `Most common order status: ${capitalize(
          highestStatus.status
        )}, representing ${number(
          highestStatus.count
        )} order(s).`
      );

      insights.push(
        `${percentage(
          percent(delivered, totalOrders)
        )} of orders created during the period are currently delivered.`
      );

      insights.push(
        `${percentage(
          percent(cancelled, totalOrders)
        )} of orders created during the period are currently cancelled.`
      );

      insights.push(
        `${number(paid)} order(s) are currently paid, ${number(
          failed
        )} failed, ${number(
          pending
        )} pending and ${number(refunded)} refunded.`
      );
    } else {
      insights.push(
        "No orders were created during the selected reporting period."
      );
    }

    drawInsights(insights);

    sectionTitle("Order Status Breakdown", 30);

    drawTable(
      ["Order Status", "Count", "Share"],
      orderStatuses.map((item) => [
        capitalize(item.status),
        number(item.count),
        percentage(
          percent(item.count, totalOrders)
        ),
      ]),
      {
        1: { halign: "right" },
        2: { halign: "right" },
      }
    );

    drawBarChart(
      "Payment Status Distribution",
      paymentStatuses.map((item) => ({
        ...item,
        label: capitalize(item.status),
      })),
      "label",
      "count"
    );

    sectionTitle("Payment Status Breakdown", 30);

    drawTable(
      ["Payment Status", "Count", "Share"],
      paymentStatuses.map((item) => [
        capitalize(item.status),
        number(item.count),
        percentage(
          percent(item.count, totalPayments)
        ),
      ]),
      {
        1: { halign: "right" },
        2: { halign: "right" },
      }
    );

    sectionTitle("Report Notes", 15);

    paragraph(
      "Order and payment statuses represent the current state of orders created during the selected period. They may change as orders are processed, delivered or cancelled."
    );
  }

  // ==========================================
  // 5. INVENTORY REPORT
  // ==========================================

  if (activeTab === "Inventory") {
    const inventory = data.inventory;

    const totalProducts = num(inventory.totalProducts);
    const lowStock = num(inventory.lowStock);
    const outOfStock = num(inventory.outOfStock);

    const healthyStock = Math.max(
      0,
      totalProducts - lowStock - outOfStock
    );

    const attentionRequired = lowStock + outOfStock;

    drawCards([
      {
        label: "Active Products",
        value: number(totalProducts),
      },
      {
        label: "Available Units",
        value: number(inventory.totalUnits),
      },
      {
        label: "Low Stock Products",
        value: number(lowStock),
      },
      {
        label: "Out of Stock Products",
        value: number(outOfStock),
      },
      {
        label: "Retail Stock Value",
        value: money(inventory.retailStockValue),
      },
      {
        label: "Products Requiring Attention",
        value: number(attentionRequired),
      },
    ]);

    drawBarChart(
      "Inventory Availability",
      [
        {
          label: "Healthy Stock",
          count: healthyStock,
        },
        {
          label: "Low Stock",
          count: lowStock,
        },
        {
          label: "Out of Stock",
          count: outOfStock,
        },
      ],
      "label",
      "count"
    );

    const insights = [];

    if (totalProducts === 0) {
      insights.push(
        "There are currently no active, published products in the inventory."
      );
    } else {
      insights.push(
        `${percentage(
          percent(healthyStock, totalProducts)
        )} of active products have stock above their low-stock threshold.`
      );

      if (attentionRequired === 0) {
        insights.push(
          "No active products currently require stock attention."
        );
      } else {
        insights.push(
          `${number(
            attentionRequired
          )} product(s) require stock attention, representing ${percentage(
            percent(attentionRequired, totalProducts)
          )} of active products.`
        );
      }

      if (outOfStock > 0) {
        insights.push(
          `${number(
            outOfStock
          )} product(s) are unavailable for purchase due to zero available stock. Review replenishment requirements.`
        );
      }

      if (lowStock > 0) {
        insights.push(
          `${number(
            lowStock
          )} product(s) have reached or fallen below their low-stock threshold. Monitor stock and consider replenishment.`
        );
      }
    }

    drawInsights(insights);

    sectionTitle("Stock Attention Required", 30);

    if (!inventory.alerts?.length) {
      paragraph(
        "No products currently require stock attention."
      );
    } else {
      drawTable(
        ["Product", "SKU", "Stock", "Threshold", "Status"],
        inventory.alerts.map((item) => [
          item.name,
          item.sku,
          number(item.stockQuantity),
          number(item.lowStockThreshold),
          num(item.stockQuantity) === 0
            ? "Out of Stock"
            : "Low Stock",
        ]),
        {
          2: { halign: "right" },
          3: { halign: "right" },
        }
      );
    }

    if (inventory.alertsTruncated) {
      paragraph(
        "Only the first 50 stock alerts are included. Refer to Inventory Management for the complete list."
      );
    }

    sectionTitle("Report Notes", 20);

    paragraph(
      "Inventory represents current available stock for active, published products. It is not a historical inventory report and is not affected by date filters."
    );

    paragraph(
      "Retail stock value is calculated using available stock quantities and current selling prices. It does not represent inventory acquisition cost or expected profit."
    );
  }

  // ==========================================
  // HEADERS AND FOOTERS
  // ==========================================

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    drawHeader();

    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);

    doc.line(
      margin,
      pageHeight - 15,
      pageWidth - margin,
      pageHeight - 15
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);

    doc.text(
      "URUMAYA | Confidential - Internal Use",
      margin,
      pageHeight - 9
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 9,
      { align: "right" }
    );
  }

  // ==========================================
  // SAVE PDF
  // ==========================================

  doc.setProperties({
    title: TITLES[activeTab],
    author: "URUMAYA",
    subject: "Business Reports and Analytics",
    creator: "URUMAYA Management System",
  });

  const filename =
    activeTab === "Inventory"
      ? `URUMAYA-inventory-${data.generatedAt.slice(
          0,
          10
        )}.pdf`
      : `URUMAYA-${activeTab.toLowerCase()}-${data.period.startDate}-${data.period.endDate}.pdf`;

  doc.save(filename);
}
