'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { createColumns } from "@/components/columns";
import { CorrectionRecord } from "@/types";
import { Trash2, FileDown, FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AutoTable extends jsPDF {
  autoTable: (options: {
    startY: number;
    head: string[][];
    body: string[][];
    theme: string;
  }) => void;
  lastAutoTable: {
    finalY: number;
  };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [showCorrectionHistory, setShowCorrectionHistory] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const json = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '',
        });
        
        console.log('Ham Excel verisi:', json);

        const formattedProducts: Product[] = (json as Array<Record<string, string>>).map((item) => {
          console.log('İşlenen satır:', item);
          return {
            Marka: String(item['Marka'] || ''),
            UrunGrubu: String(item['Ürün Grubu'] || ''),
            UrunKodu: String(item['Ürün Kodu'] || ''),
            RenkKodu: String(item['Renk Kodu'] || ''),
            Bedi: String(item['Beden'] || ''),
            Envant: String(item['Envanter'] || '0'),
            Barkod: String(item['Barkod'] || ''),
            Sezi: String(item['Sezon'] || ''),
            countedQuantity: 0
          };
        });

        console.log('Formatlanmış veriler:', formattedProducts);
        setProducts(formattedProducts);
        localStorage.setItem('inventoryProducts', JSON.stringify(formattedProducts));
        setMessage(`Excel dosyası başarıyla yüklendi! Toplam ${formattedProducts.length} ürün`);
        setMessageType('success');
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const barcode = e.target.value;
    setCurrentBarcode(barcode);
    
    const product = products.find(p => p.Barkod === barcode);
    
    if (product) {
      const updatedProducts = products.map(p => 
        p.Barkod === barcode 
          ? { ...p, countedQuantity: p.countedQuantity + 1 }
          : p
      );
      
      const updatedProduct = updatedProducts.find(p => p.Barkod === barcode)!;
      
      if (Number(updatedProduct.countedQuantity) === Number(updatedProduct.Envant)) {
        setMessage(`${updatedProduct.Marka} ${updatedProduct.UrunGrubu} - Sayım doğru! (${updatedProduct.countedQuantity}/${updatedProduct.Envant})`);
        setMessageType('success');
      } else if (Number(updatedProduct.countedQuantity) < Number(updatedProduct.Envant)) {
        setMessage(`${updatedProduct.Marka} ${updatedProduct.UrunGrubu} - Eksik sayım! (${updatedProduct.countedQuantity}/${updatedProduct.Envant})`);
        setMessageType('warning');
      } else {
        setMessage(`${updatedProduct.Marka} ${updatedProduct.UrunGrubu} - Fazla sayım! (${updatedProduct.countedQuantity}/${updatedProduct.Envant})`);
        setMessageType('error');
      }
      
      setProducts(updatedProducts);
      localStorage.setItem('inventoryProducts', JSON.stringify(updatedProducts));
      setCurrentBarcode('');
    } else if (barcode.length > 0) {
      setMessage('Ürün bulunamadı!');
      setMessageType('error');
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentBarcode('');
  };

  useEffect(() => {
    const savedProducts = localStorage.getItem('inventoryProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Sayım düzeltme fonksiyonu
  const handleCorrection = (barkod: string, newValue: number, reason?: string) => {
    const updatedProducts = products.map(product => {
      if (product.Barkod === barkod) {
        const correction: CorrectionRecord = {
          timestamp: new Date().toISOString(),
          oldValue: product.countedQuantity,
          newValue: newValue,
          reason: reason,
          operator: 'Current User' // İleriye yönelik kullanıcı sistemi için
        };

        const updatedProduct = {
          ...product,
          countedQuantity: newValue,
          corrections: [...(product.corrections || []), correction],
          lastCorrectionDate: correction.timestamp
        };

        // Durum mesajı
        const expected = Number(product.Envant);
        if (newValue === expected) {
          setMessage(`✅ ${product.Marka} ${product.UrunGrubu} - Düzeltme tamamlandı! Sayım artık doğru (${newValue}/${expected})`);
          setMessageType('success');
        } else if (newValue < expected) {
          setMessage(`⚠️ ${product.Marka} ${product.UrunGrubu} - Düzeltildi ama hala eksik (${newValue}/${expected})`);
          setMessageType('warning');
        } else {
          setMessage(`⚠️ ${product.Marka} ${product.UrunGrubu} - Düzeltildi ama hala fazla (${newValue}/${expected})`);
          setMessageType('warning');
        }

        return updatedProduct;
      }
      return product;
    });

    setProducts(updatedProducts);
    localStorage.setItem('inventoryProducts', JSON.stringify(updatedProducts));
  };

  // Düzeltme geçmişi gösterme fonksiyonu
  const handleShowHistory = (barkod: string) => {
    setShowCorrectionHistory(barkod);
  };

  // Sütunları düzeltme fonksiyonları ile oluştur
  const columnsWithActions = createColumns({
    onCorrect: handleCorrection,
    onShowHistory: handleShowHistory
  });

  const handleClearData = () => {
    if (window.confirm('Tüm sayım verilerini sıfırlamak istediğinize emin misiniz?')) {
      const clearedProducts = products.map(product => ({
        ...product,
        countedQuantity: 0
      }));
      setProducts(clearedProducts);
      localStorage.setItem('inventoryProducts', JSON.stringify(clearedProducts));
      setMessage('Tüm sayım verileri sıfırlandı');
      setMessageType('warning');
    }
  };

  const handleExportExcel = () => {
    const exportData = products.map(product => ({
      'Marka': product.Marka,
      'Ürün Grubu': product.UrunGrubu,
      'Ürün Kodu': product.UrunKodu,
      'Renk Kodu': product.RenkKodu,
      'Beden': product.Bedi,
      'Beklenen Envanter': product.Envant,
      'Sayılan Miktar': product.countedQuantity,
      'Barkod': product.Barkod,
      'Sezon': product.Sezi,
      'Durum': product.countedQuantity === 0 ? 'Sayılmadı' :
               Number(product.countedQuantity) === Number(product.Envant) ? 'Tamam' :
               Number(product.countedQuantity) < Number(product.Envant) ? 'Eksik' : 'Fazla',
      'Düzeltme Sayısı': product.corrections?.length || 0,
      'Son Düzeltme': product.lastCorrectionDate ? 
        new Date(product.lastCorrectionDate).toLocaleString('tr-TR') : 'Yok'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sayım Raporu');
    
    // Excel dosyasını oluştur
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Dosyayı indir
    const fileName = `Sayim_Raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`;
    saveAs(data, fileName);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Türkçe karakterler için font ayarı
    doc.setFont('helvetica');
    
    // UTF-8 encoding için
    const turkishText = (text: string) => {
      return text
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I');
    };
    
    // Başlık
    doc.setFontSize(20);
    doc.text(turkishText('Stok Sayım Raporu'), 20, 20);
    doc.setFontSize(12);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);

    // Genel İstatistikler
    doc.setFontSize(16);
    doc.text(turkishText('Genel İstatistikler'), 20, 45);
    doc.setFontSize(12);

    autoTable(doc, {
      startY: 50,
      head: [[turkishText('Metrik'), turkishText('Değer')]],
      body: [
        [turkishText('Toplam Ürün'), products.length.toString()],
        [turkishText('Sayılan Ürün'), products.filter(p => p.countedQuantity > 0).length.toString()],
        [turkishText('Doğru Sayım'), products.filter(p => Number(p.countedQuantity) === Number(p.Envant)).length.toString()],
        [turkishText('Eksik Sayım'), products.filter(p => Number(p.countedQuantity) < Number(p.Envant) && p.countedQuantity > 0).length.toString()],
        [turkishText('Fazla Sayım'), products.filter(p => Number(p.countedQuantity) > Number(p.Envant)).length.toString()],
        [turkishText('Sayılmayan'), products.filter(p => p.countedQuantity === 0).length.toString()]
      ],
      theme: 'grid'
    });

    // Detaylı Ürün Listesi
    doc.setFontSize(16);
    doc.text(turkishText('Detaylı Ürün Listesi'), 20, doc.lastAutoTable.finalY + 20);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Marka', turkishText('Ürün Kodu'), 'Barkod', 'Beden', 'Envanter', turkishText('Sayılan'), 'Durum']],
      body: products.map(product => [
        product.Marka,
        product.UrunKodu,
        product.Barkod,
        product.Bedi,
        product.Envant,
        product.countedQuantity.toString(),
        product.countedQuantity === 0 ? turkishText('Sayılmadı') :
        Number(product.countedQuantity) === Number(product.Envant) ? 'Tamam' :
        Number(product.countedQuantity) < Number(product.Envant) ? 'Eksik' : 'Fazla'
      ]),
      theme: 'grid'
    });

    // PDF'i kaydet
    doc.save(`Stok_Sayim_Raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ana Sayfa</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4" />
            Sayımı Sıfırla
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportExcel}
          >
            <FileDown className="h-4 w-4" />
            Excel İndir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Excel Dosyası Yükle</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Barkod Okut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleBarcodeSubmit}>
              <Input
                type="text"
                value={currentBarcode}
                onChange={handleBarcodeInput}
                placeholder="Barkod okutun veya girin..."
                autoFocus
              />
            </form>

            {message && (
              <div className={`p-4 rounded-lg ${
                messageType === 'success' ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' :
                messageType === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800' :
                'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Sayım Durumu</CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-2 hover:border-red-500 hover:text-red-500"
              onClick={handleClearData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sayımı Sıfırla
            </Button>
            <Button
              variant="outline"
              className="border-2 hover:border-blue-500 hover:text-blue-500"
              onClick={handleExportExcel}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Excel İndir
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={generatePDF}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF İndir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="w-24 justify-center">Sayılmadı</Badge>
              <span className="text-sm text-gray-500">{products.filter(p => p.countedQuantity === 0).length} ürün</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-500 w-24 justify-center">Tamam</Badge>
              <span className="text-sm text-gray-500">{products.filter(p => Number(p.countedQuantity) === Number(p.Envant)).length} ürün</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="w-24 justify-center">Eksik</Badge>
              <span className="text-sm text-gray-500">{products.filter(p => Number(p.countedQuantity) < Number(p.Envant) && p.countedQuantity > 0).length} ürün</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-500 w-24 justify-center">Fazla</Badge>
              <span className="text-sm text-gray-500">{products.filter(p => Number(p.countedQuantity) > Number(p.Envant)).length} ürün</span>
            </div>
          </div>
          <DataTable columns={columnsWithActions} data={products} />
        </CardContent>
      </Card>

      {/* Düzeltme Geçmişi Modal */}
      <Dialog open={!!showCorrectionHistory} onOpenChange={() => setShowCorrectionHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Düzeltme Geçmişi
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCorrectionHistory(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {showCorrectionHistory && (() => {
            const product = products.find(p => p.Barkod === showCorrectionHistory);
            if (!product) return null;

            return (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold">{product.Marka} {product.UrunGrubu}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ürün Kodu: {product.UrunKodu} | Barkod: {product.Barkod}
                  </p>
                  <p className="text-sm">
                    Beklenen: {product.Envant} | Mevcut: {product.countedQuantity}
                  </p>
                </div>

                {product.corrections && product.corrections.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Düzeltme Kayıtları:</h4>
                    {product.corrections.map((correction, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {correction.oldValue} → {correction.newValue}
                            </span>
                            <Badge variant={
                              correction.newValue > correction.oldValue ? "default" : 
                              correction.newValue < correction.oldValue ? "destructive" : "secondary"
                            }>
                              {correction.newValue > correction.oldValue ? `+${correction.newValue - correction.oldValue}` : 
                               correction.newValue < correction.oldValue ? `${correction.newValue - correction.oldValue}` : 
                               'Değişiklik yok'}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(correction.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        
                        {correction.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Neden:</strong> {correction.reason}
                          </p>
                        )}
                        
                        {correction.operator && (
                          <p className="text-xs text-gray-500">
                            Düzenleyen: {correction.operator}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Henüz düzeltme yapılmamış
                  </p>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
