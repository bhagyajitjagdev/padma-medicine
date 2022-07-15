import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import * as moment from 'moment';
import { APIService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  dateFormat = '';
  constructor(private control: APIService) {
    this.dateFormat = this.control.getDateFormat;
  }

  exportExcel(
    excelData: any,
    debitTotal: number,
    creditTotal: number,
    debitTotalCashbook: number,
    creditTotalCashbook: number,
    fileName: string
  ): void {
    const bankStatements = excelData.bankStatements;
    const categoryItems = excelData.categoryItems;
    const categoryItemsCashbook = excelData.categoryItemsCashbook;
    const cashbookMappedList = excelData.cashbookMappedList;
    const invoiceMappedList = excelData.invoiceMappedList;
    const cashbookList = excelData.cashbookList;
    const invoiceList = excelData.invoiceList;

    let workbook = new Workbook();

    // bank statement start
    let worksheet1 = workbook.addWorksheet('Bank Statement Report');
    const bankStatementHeaders = [
      'Date',
      'IRIS Code',
      'Details',
      'Debit',
      'Credit',
      'Balance',
      'Comments',
      'Remarks',
      'Mapped With Cashbook',
      'Mapped With Invoice',
    ];
    worksheet1.addRow(bankStatementHeaders);

    bankStatements.forEach((d: any) => {
      worksheet1.addRow([
        moment(d.date).format(this.dateFormat),
        d?.category?.irisCode,
        d.detail,
        d.debit,
        d.credit,
        d.balance,
        d.comment,
        d.remark,
        cashbookMappedList.includes(d.id) ? 'YES' : 'NO',
        invoiceMappedList.includes(d.id) ? 'YES' : 'NO',
      ]);
    });
    // bank statement end

    // trial balance start
    // -> first table start
    let worksheet2 = workbook.addWorksheet('Trial Balance Report');
    const trialBalanceItemHeaders = [
      'IRIS Code',
      'Category Name',
      'Debit',
      'Credit',
    ];
    worksheet2.addRow(['Bank Statement']);
    worksheet2.addRow(trialBalanceItemHeaders);
    categoryItems.forEach((d: any) => {
      worksheet2.addRow([
        d?.category?.irisCode,
        d?.category?.name,
        d?._sum?.debit,
        d._sum?.credit,
      ]);
    });
    worksheet2.addRow(['Total', '', debitTotal, creditTotal]);
    // -> first table end

    worksheet2.addRow([]);
    worksheet2.addRow([]);

    if (categoryItemsCashbook.length > 1) {
      // -> second table start
      worksheet2.addRow(['Cashbook', '', '', '']);
      worksheet2.addRow(trialBalanceItemHeaders);
      categoryItemsCashbook.forEach((d: any) => {
        worksheet2.addRow([
          d.data[0]?.category?.irisCode,
          d.data[0]?.category?.name,
          d?._sum?.debit,
          d._sum?.credit,
        ]);
      });
      worksheet2.addRow(['Total', '', debitTotalCashbook, creditTotalCashbook]);
    }
    // trial balance ends

    // category sheet start
    const nameObj: any = {};

    bankStatements.forEach((bank: any) => {
      const name = bank?.category?.name.replace(/[^a-zA-Z ]/g, '');
      if (!nameObj.hasOwnProperty(name)) {
        nameObj[name] = [];
      }
      nameObj[name].push(bank);
    });

    for (const [key, value] of Object.entries(nameObj)) {
      const values: any = value;

      let worksheetCategory = workbook.addWorksheet(
        key == 'undefined' ? 'Uncategorized' : key
      );

      const bankStatementHeadersCategory = [
        'Date',
        'IRIS Code',
        'Details',
        'Debit',
        'Credit',
        'Balance',
        'Comments',
        'Remarks',
        'Mapped With Cashbook',
        'Mapped With Invoice',
      ];

      worksheetCategory.addRow(bankStatementHeadersCategory);

      values.forEach((d: any) => {
        worksheetCategory.addRow([
          moment(d.date).format(this.dateFormat),
          d?.category?.irisCode,
          d.detail,
          d.debit,
          d.credit,
          d.balance,
          d.comment,
          d.remark,
          cashbookMappedList.includes(d.id) ? 'YES' : 'NO',
          invoiceMappedList.includes(d.id) ? 'YES' : 'NO',
        ]);
      });
    }
    // category sheet ends

    // cashbook start
    let worksheet3 = workbook.addWorksheet('Cashbook Report');
    const cashbookHeaders = [
      'Sl No.',
      'Date',
      'Detail',
      'Net',
      'VAT',
      'Gross',
      'IRIS Code',
      'In Bank',
      'Mapped With Bank Statement',
    ];
    worksheet3.addRow(cashbookHeaders);
    cashbookList.forEach((d: any) => {
      worksheet3.addRow([
        d.index,
        moment(d.date).format(this.dateFormat),
        d.detail,
        d.net,
        d.vat,
        d.gross,
        d?.category?.irisCode,
        d.inBank,
        d.bankStatementId ? 'Yes' : 'No',
      ]);
    });
    // cashbook ends

    // invoice start
    let worksheet4 = workbook.addWorksheet('Invoice Report');
    const invoiceHeaders = [
      'Sl No.',
      'Date',
      'Invoice No.',
      'Name',
      'Description',
      'Net',
      'VAT',
      'Gross',
      'IRIS Code',
      'In Bank',
      'Mapped With Bank Statement',
    ];
    worksheet4.addRow(invoiceHeaders);
    invoiceList.forEach((d: any) => {
      worksheet4.addRow([
        d.index,
        moment(d.date).format(this.dateFormat),
        d.invoiceNo,
        d.name,
        d.description,
        d.net,
        d.vat,
        d.gross,
        d?.category?.irisCode,
        d.inBank,
        d.bankStatementId ? 'Yes' : 'No',
      ]);
    });
    // invoice ends

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, fileName + '_' + new Date().getTime() + '.xlsx');
    });
  }
}
