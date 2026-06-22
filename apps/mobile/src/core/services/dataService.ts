import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as XLSX from 'xlsx';
import * as Clipboard from 'expo-clipboard';
import { Expense, Account, Category } from '../database/schema';
import { Platform } from 'react-native';

export type ExportColumn = 'Date' | 'Time' | 'Type' | 'Category' | 'Amount' | 'Description' | 'Merchant' | 'Account' | 'AccountInitialBalance';

export const exportData = async (
  expenses: Expense[],
  accounts: Account[],
  categories: Category[],
  format: 'csv' | 'xlsx',
  action: 'save' | 'share' = 'share',
  savedDirectoryUri?: string | null
): Promise<string | undefined> => {
  try {
    const formattedData = expenses.map(e => {
      const account = accounts.find(a => a.id === e.accountId);
      const category = categories.find(c => c.id === e.categoryId);
      return {
        Date: new Date(e.date).toLocaleDateString().replace(/\u202F/g, ' '),
        Time: new Date(e.date).toLocaleTimeString().replace(/\u202F/g, ' '),
        Type: e.type === 'credit' ? 'Income' : 'Expense',
        Category: category ? category.name : 'Unknown',
        Amount: `₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        Description: e.description,
        Merchant: e.merchant || '',
        AccountName: account ? account.name : 'Unassigned',
        AccountType: account ? account.type : 'N/A',
        AccountInitialBalance: account ? account.balance : 0,
        _RawDateUnix: e.date
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    const fileBase64 = XLSX.write(workbook, { type: 'base64', bookType: format });
    const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filename = `LedgerLite_Export_${Date.now()}.${format}`;

    if (action === 'save' && Platform.OS === 'android') {
      if (savedDirectoryUri) {
        try {
          const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
            savedDirectoryUri,
            filename,
            mimeType
          );
          await FileSystem.writeAsStringAsync(safUri, fileBase64, { encoding: 'base64' });
          return savedDirectoryUri;
        } catch (e) {
          console.log("Silent save failed, requesting permissions again");
        }
      }

      const initialUri = 'content://com.android.externalstorage.documents/tree/primary%3ADocuments';
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

      if (permissions.granted) {
        let targetDirUri = permissions.directoryUri;

        if (!decodeURIComponent(targetDirUri).endsWith('LedgerLite')) {
          let folderCreatedOrFound = false;

          try {
            const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(permissions.directoryUri);
            const existingLedgerLite = files.find(f => decodeURIComponent(f).endsWith('/LedgerLite') || decodeURIComponent(f).endsWith(':LedgerLite'));
            if (existingLedgerLite) {
              targetDirUri = existingLedgerLite;
              folderCreatedOrFound = true;
            }
          } catch (e) {
            console.log("Could not read directory for LedgerLite search", e);
          }

          if (!folderCreatedOrFound) {
            try {
              targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(permissions.directoryUri, 'LedgerLite');
            } catch (e) {
              console.log("Could not create LedgerLite subfolder", e);
            }
          }
        }

        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          filename,
          mimeType
        );
        await FileSystem.writeAsStringAsync(safUri, fileBase64, { encoding: 'base64' });
        return targetDirUri;
      }
    }

    const fileUri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, fileBase64, {
      encoding: 'base64'
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: mimeType,
      dialogTitle: 'Export LedgerLite Data'
    });

    return undefined;

  } catch (error) {
    console.error("Export Error: ", error);
    return undefined;
  }
}

export const importData = async (
  categories: Category[],
  accounts: Account[],
  existingExpenses: Expense[]
): Promise<{ expenses: any[], missingAccounts: { name: string; initialBalance: number }[] } | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'text/csv',
        'text/comma-separated-values',
        'application/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      copyToCacheDirectory: true
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    const workbook = XLSX.read(fileBase64, { type: 'base64' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

    const importedExpenses: any[] = [];
    const missingAccounts: { name: string; initialBalance: number }[] = [];

    for (const row of rawJson) {
      const rawAmountStr = String(row.Amount || '0').replace(/[^0-9.-]+/g, "");
      const parsedAmount = parseFloat(rawAmountStr) || 0;

      const categoryName = row.Category;
      const matchedCategory = categories.find(c => c.name === categoryName);
      const categoryId = matchedCategory ? matchedCategory.id : 'cat-1';

      const accountName = row.AccountName || row.Account;
      const matchedAccount = accounts.find(a => a.name === accountName);
      const accountId = matchedAccount ? matchedAccount.id : undefined;

      if (!matchedAccount && accountName && accountName !== 'Unassigned') {
        if (!missingAccounts.find(m => m.name === accountName)) {
          const initialBalance = parseFloat(String(row.AccountInitialBalance).replace(/[^0-9.-]+/g, "")) || 0;
          missingAccounts.push({ name: accountName, initialBalance });
        }
      }

      let parsedDate = Date.now();
      if (row._RawDateUnix) {
        parsedDate = parseInt(row._RawDateUnix);
      } else {
        const dateStr = `${row.Date} ${row.Time}`;
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj.getTime();
        } else if (row.Date) {
          const dateParts = String(row.Date).split(/[-/]/);
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            let year = parseInt(dateParts[2]);
            if (year < 100) year += 2000; 

            let hours = 0; let minutes = 0; let seconds = 0;
            if (row.Time) {
              const timeParts = String(row.Time).match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
              if (timeParts) {
                hours = parseInt(timeParts[1]);
                minutes = parseInt(timeParts[2]);
                seconds = timeParts[3] ? parseInt(timeParts[3]) : 0;
                const ampm = timeParts[4] ? timeParts[4].toUpperCase() : '';
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
              }
            }
            const fallbackDate = new Date(year, month, day, hours, minutes, seconds).getTime();
            if (!isNaN(fallbackDate)) parsedDate = fallbackDate;
          }
        }
      }
      const type = row.Type === 'Income' || row.Type === 'credit' ? 'credit' : 'debit';
      const description = row.Description || 'Imported Transaction';

      const isDuplicate = existingExpenses.some(ex => {
        const timeDiff = Math.abs(ex.date - parsedDate);
        return ex.amount === parsedAmount &&
          ex.description === description &&
          ex.type === type &&
          timeDiff < 60000; 
      });

      if (!isDuplicate) {
        importedExpenses.push({
          id: Date.now() + Math.random(), 
          amount: parsedAmount,
          description,
          merchant: row.Merchant || null,
          date: parsedDate,
          type,
          categoryId,
          accountId,
          _accountName: accountName 
        });
      }
    }

    return { expenses: importedExpenses, missingAccounts };

  } catch (error) {
    console.error("Import Error: ", error);
    return null;
  }
};

export const exportSettingsJSON = async (
  settingsData: any,
  action: 'save' | 'share' | 'copy' = 'share',
  savedDirectoryUri?: string | null
): Promise<string | undefined> => {
  try {
    const jsonString = JSON.stringify(settingsData, null, 2);

    if (action === 'copy') {
      await Clipboard.setStringAsync(jsonString);
      return undefined;
    }

    const filename = `LedgerLite_Settings_${Date.now()}.json`;
    const mimeType = 'application/json';

    if (action === 'save' && Platform.OS === 'android') {
      if (savedDirectoryUri) {
        try {
          const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
            savedDirectoryUri,
            filename,
            mimeType
          );
          await FileSystem.writeAsStringAsync(safUri, jsonString, { encoding: 'utf8' });
          return savedDirectoryUri;
        } catch (e) {
          console.log("Silent save failed, requesting permissions again");
        }
      }

      const initialUri = 'content://com.android.externalstorage.documents/tree/primary%3ADocuments';
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

      if (permissions.granted) {
        let targetDirUri = permissions.directoryUri;
        if (!decodeURIComponent(targetDirUri).endsWith('LedgerLite')) {
          let folderCreatedOrFound = false;
          try {
            const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(permissions.directoryUri);
            const existingLedgerLite = files.find(f => decodeURIComponent(f).endsWith('/LedgerLite') || decodeURIComponent(f).endsWith(':LedgerLite'));
            if (existingLedgerLite) {
              targetDirUri = existingLedgerLite;
              folderCreatedOrFound = true;
            }
          } catch (e) { }
          if (!folderCreatedOrFound) {
            try { targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(permissions.directoryUri, 'LedgerLite'); } catch (e) { }
          }
        }

        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          filename,
          mimeType
        );
        await FileSystem.writeAsStringAsync(safUri, jsonString, { encoding: 'utf8' });
        return targetDirUri;
      }
    }

    const fileUri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: 'utf8'
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: mimeType,
      dialogTitle: 'Export LedgerLite Settings'
    });

    return undefined;
  } catch (error) {
    console.error("Settings Export Error: ", error);
    return undefined;
  }
};
export const importSettingsJSON = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
    const parsedData = JSON.parse(fileContent);
    return parsedData;

  } catch (error) {
    console.error("Settings Import Error: ", error);
    return null;
  }
};

export const exportToPDF = async (
  expenses: Expense[],
  accounts: Account[],
  categories: Category[],
  selectedColumns: ExportColumn[],
  action: 'save' | 'share' = 'share',
  savedDirectoryUri?: string | null
): Promise<string | undefined> => {
  try {
    const escapeHTML = (str: any) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const formattedData = expenses.map(e => {
      const account = accounts.find(a => a.id === e.accountId);
      const category = categories.find(c => c.id === e.categoryId);
      return {
        Date: new Date(e.date).toLocaleDateString().replace(/\u202F/g, ' '),
        Time: new Date(e.date).toLocaleTimeString().replace(/\u202F/g, ' '),
        Type: e.type === 'credit' ? 'Income' : 'Expense',
        Category: category ? category.name : 'Unknown',
        Amount: `₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        Description: e.description,
        Merchant: e.merchant || '',
        Account: account ? account.name : 'Unassigned',
        AccountInitialBalance: account ? account.balance : 0
      };
    });

    const thHeaders = selectedColumns.map(col => `<th>${escapeHTML(col)}</th>`).join('');
    const trRows = formattedData.map(row => {
      const tdCells = selectedColumns.map(col => `<td>${escapeHTML((row as any)[col])}</td>`).join('');
      return `<tr>${tdCells}</tr>`;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #eee; }
          </style>
        </head>
        <body>
          <h1>LedgerLite Report</h1>
          <table>
            <thead><tr>${thHeaders}</tr></thead>
            <tbody>${trRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html,
      width: 612,
      height: 792
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const filename = `LedgerLite_Report_${Date.now()}.pdf`;
    const mimeType = 'application/pdf';

    if (action === 'save' && Platform.OS === 'android') {
      const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      let targetDirUri = savedDirectoryUri || undefined;

      if (!targetDirUri) {
        const initialUri = 'content://com.android.externalstorage.documents/tree/primary%3ADocuments';
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

        if (permissions.granted) {
          targetDirUri = permissions.directoryUri;
          if (!decodeURIComponent(targetDirUri).endsWith('LedgerLite')) {
            let folderCreatedOrFound = false;
            try {
              const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(permissions.directoryUri);
              const existingLedgerLite = files.find(f => decodeURIComponent(f).endsWith('/LedgerLite') || decodeURIComponent(f).endsWith(':LedgerLite'));
              if (existingLedgerLite) {
                targetDirUri = existingLedgerLite;
                folderCreatedOrFound = true;
              }
            } catch (e) { }

            if (!folderCreatedOrFound) {
              try { targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(permissions.directoryUri, 'LedgerLite'); } catch (e) { }
            }
          }
        }
      }

      if (targetDirUri) {
        try {
          const safUri = await FileSystem.StorageAccessFramework.createFileAsync(targetDirUri, filename, mimeType);
          await FileSystem.writeAsStringAsync(safUri, fileBase64, { encoding: 'base64' });
          return targetDirUri;
        } catch (e) {
          console.log("PDF save failed", e);
        }
      }
    }

    await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Export PDF' });
    return undefined;

  } catch (error) {
    console.error("PDF Export Error: ", error);
    return undefined;
  }
}