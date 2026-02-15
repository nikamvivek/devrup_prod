// src/components/admin/SalesReportExport.jsx
import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import adminService from '../../services/adminService';

const SalesReportExport = ({ period, startDate, endDate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFileName = (format) => {
    const dateStr = new Date().toISOString().split('T')[0];
    return `sales-report-${period}-${dateStr}.${format}`;
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the sales report API to get the data
      const params = {
        period,
        startDate,
        endDate
      };
      
      const data = await adminService.getSalesReport(params);
      return data;
    } catch (err) {
      console.error('Error fetching sales data for export:', err);
      setError('Failed to fetch data for export');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const data = await fetchSalesData();
      
      if (!data || !data.data || !data.data.length) {
        setError('No data available to export');
        return;
      }
      
      // Format the data for CSV
      let csvContent = '';
      
      // Add header row
      if (period === 'daily') {
        csvContent += 'Date,Orders,Sales ($),Average Order Value ($)\n';
      } else {
        csvContent += 'Month,Orders,Sales ($),Average Order Value ($)\n';
      }
      
      // Add data rows
      data.data.forEach(item => {
        const date = period === 'daily' ? item.date : item.month;
        const sales = parseFloat(item.sales).toFixed(2);
        const avgOrderValue = parseFloat(item.avg_order_value || 0).toFixed(2);
        
        csvContent += `${date},${item.orders},${sales},${avgOrderValue}\n`;
      });
      
      // Add summary section
      csvContent += '\n';
      csvContent += 'Summary,,,\n';
      csvContent += `Total Sales,,${parseFloat(data.summary.total_sales).toFixed(2)},\n`;
      csvContent += `Total Orders,,${data.summary.total_orders},\n`;
      csvContent += `Average Order Value,,${parseFloat(data.summary.avg_order_value).toFixed(2)},\n`;
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, generateFileName('csv'));
      
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError('Failed to generate CSV file');
    }
  };

  const exportToExcel = async () => {
    try {
      const data = await fetchSalesData();
      
      if (!data || !data.data || !data.data.length) {
        setError('No data available to export');
        return;
      }
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Format data for Excel
      const wsData = [];
      
      // Add title rows
      wsData.push([`Sales Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`]);
      wsData.push([`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`]);
      wsData.push([]);
      
      // Add header row
      if (period === 'daily') {
        wsData.push(['Date', 'Orders', 'Sales ($)', 'Average Order Value ($)']);
      } else {
        wsData.push(['Month', 'Orders', 'Sales ($)', 'Average Order Value ($)']);
      }
      
      // Add data rows
      data.data.forEach(item => {
        const date = period === 'daily' ? item.date : item.month;
        const sales = parseFloat(item.sales).toFixed(2);
        const avgOrderValue = parseFloat(item.avg_order_value || 0).toFixed(2);
        
        wsData.push([date, item.orders, sales, avgOrderValue]);
      });
      
      // Add summary section
      wsData.push([]);
      wsData.push(['Summary']);
      wsData.push(['Total Sales', '', parseFloat(data.summary.total_sales).toFixed(2)]);
      wsData.push(['Total Orders', '', data.summary.total_orders]);
      wsData.push(['Average Order Value', '', parseFloat(data.summary.avg_order_value).toFixed(2)]);
      
      // Create the worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, generateFileName('xlsx'));
      
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to generate Excel file');
    }
  };

  const exportToPDF = async () => {
    try {
      const data = await fetchSalesData();
      
      if (!data || !data.data || !data.data.length) {
        setError('No data available to export');
        return;
      }
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 153);
      doc.text(`Sales Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 22);
      
      // Add date range
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`, 14, 30);
      
      // Format data for table
      const tableData = [];
      data.data.forEach(item => {
        const date = period === 'daily' ? item.date : item.month;
        const sales = `$${parseFloat(item.sales).toFixed(2)}`;
        const avgOrderValue = `$${parseFloat(item.avg_order_value || 0).toFixed(2)}`;
        
        tableData.push([date, item.orders, sales, avgOrderValue]);
      });
      
      // Add table
      doc.autoTable({
        startY: 40,
        head: [period === 'daily' ? ['Date', 'Orders', 'Sales', 'Avg Order Value'] : ['Month', 'Orders', 'Sales', 'Avg Order Value']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });
      
      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text('Summary', 14, finalY);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Total Sales:', 14, finalY + 10);
      doc.text(`$${parseFloat(data.summary.total_sales).toFixed(2)}`, 80, finalY + 10);
      
      doc.text('Total Orders:', 14, finalY + 20);
      doc.text(`${data.summary.total_orders}`, 80, finalY + 20);
      
      doc.text('Average Order Value:', 14, finalY + 30);
      doc.text(`$${parseFloat(data.summary.avg_order_value).toFixed(2)}`, 80, finalY + 30);
      
      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text('This report is confidential and intended for internal use only.', 14, pageHeight - 20);
      doc.text(`© ${new Date().getFullYear()} Your Company Name`, 14, pageHeight - 10);
      
      // Save the PDF
      doc.save(generateFileName('pdf'));
      
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Failed to generate PDF file');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Export Report'}
      </button>
      
      <div 
        id="exportDropdown" 
        className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
      >
        <button
          onClick={exportToCSV}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={loading}
        >
          Export as CSV
        </button>
        <button
          onClick={exportToExcel}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={loading}
        >
          Export as Excel
        </button>
        <button
          onClick={exportToPDF}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={loading}
        >
          Export as PDF
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default SalesReportExport;