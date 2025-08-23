'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from 'next-themes';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export default function RaporPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filtre state'leri
  const [markaFilter, setMarkaFilter] = useState('all');
  const [urunGrubuFilter, setUrunGrubuFilter] = useState('all');
  const [sezonFilter, setSezonFilter] = useState('all');
  const [minCount, setMinCount] = useState('');
  const [maxCount, setMaxCount] = useState('');

  useEffect(() => {
    const savedProducts = localStorage.getItem('inventoryProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    setLoading(false);
  }, []);

  // Tema bazlı renkler
  const themeColors = {
    text: isDark ? '#e2e8f0' : '#1e293b',
    grid: isDark ? '#334155' : '#e2e8f0',
    tooltip: isDark ? '#1e293b' : '#ffffff',
    background: isDark ? '#020617' : '#ffffff',
  };

  // Filtreleme fonksiyonu
  const filterProducts = (products: Product[]) => {
    return products.filter(product => {
      const markaMatch = markaFilter === 'all' || product.Marka.toLowerCase().includes(markaFilter.toLowerCase());
      const urunGrubuMatch = urunGrubuFilter === 'all' || product.UrunGrubu.toLowerCase().includes(urunGrubuFilter.toLowerCase());
      const sezonMatch = sezonFilter === 'all' || product.Sezi.toLowerCase().includes(sezonFilter.toLowerCase());
      const countMatch = (!minCount || product.countedQuantity >= parseInt(minCount)) &&
                        (!maxCount || product.countedQuantity <= parseInt(maxCount));
      
      return markaMatch && urunGrubuMatch && sezonMatch && countMatch;
    });
  };

  const filteredProducts = filterProducts(products);

  // Sayım durumu verilerini hazırla
  const countStatus = {
    data: [
      {
        id: 'Sayılmadı',
        label: 'Sayılmadı',
        value: filteredProducts.filter(p => p.countedQuantity === 0).length,
        color: isDark ? '#64748b' : '#94a3b8'
      },
      {
        id: 'Tamam',
        label: 'Tamam',
        value: filteredProducts.filter(p => Number(p.countedQuantity) === Number(p.Envant)).length,
        color: isDark ? '#22c55e' : '#16a34a'
      },
      {
        id: 'Eksik',
        label: 'Eksik',
        value: filteredProducts.filter(p => Number(p.countedQuantity) < Number(p.Envant) && p.countedQuantity > 0).length,
        color: isDark ? '#ef4444' : '#dc2626'
      },
      {
        id: 'Fazla',
        label: 'Fazla',
        value: filteredProducts.filter(p => Number(p.countedQuantity) > Number(p.Envant)).length,
        color: isDark ? '#eab308' : '#ca8a04'
      }
    ]
  };

  // Marka bazlı dağılım
  const brandDistribution = Array.from(new Set(filteredProducts.map(p => p.Marka)))
    .map(brand => {
      const count = filteredProducts.filter(p => p.Marka === brand).length;
      return {
        id: brand,
        label: brand,
        value: count,
        color: isDark ? `hsl(${Math.random() * 360}, 70%, 50%)` : `hsl(${Math.random() * 360}, 60%, 45%)`
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Ürün grubu dağılımı
  const productGroupDistribution = Array.from(new Set(filteredProducts.map(p => p.UrunGrubu)))
    .map(group => {
      const count = filteredProducts.filter(p => p.UrunGrubu === group).length;
      return {
        id: group,
        label: group,
        value: count,
        color: isDark ? `hsl(${Math.random() * 360}, 70%, 50%)` : `hsl(${Math.random() * 360}, 60%, 45%)`
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Sezon dağılımı
  const seasonDistribution = Array.from(new Set(filteredProducts.map(p => p.Sezi)))
    .map(season => {
      const count = filteredProducts.filter(p => p.Sezi === season).length;
      return {
        id: season || 'Belirtilmemiş',
        label: season || 'Belirtilmemiş',
        value: count,
        color: isDark ? `hsl(${Math.random() * 360}, 70%, 50%)` : `hsl(${Math.random() * 360}, 60%, 45%)`
      };
    })
    .sort((a, b) => b.value - a.value);

  const commonProps = {
    theme: {
      textColor: themeColors.text,
      tooltip: {
        container: {
          background: themeColors.tooltip,
          color: isDark ? '#ffffff' : '#1e293b',
        }
      },
      legends: {
        text: {
          fill: themeColors.text,
        }
      }
    },
    margin: { top: 40, right: 80, bottom: 80, left: 80 },
    innerRadius: 0.5,
    padAngle: 0.7,
    cornerRadius: 3,
    activeOuterRadiusOffset: 8,
    borderWidth: 1,
    borderColor: { from: 'color' },
    arcLinkLabelsSkipAngle: 10,
    arcLinkLabelsTextColor: themeColors.text,
    arcLinkLabelsThickness: 2,
    arcLinkLabelsColor: { from: 'color' },
    arcLabelsSkipAngle: 10,
    arcLabelsTextColor: themeColors.background,
    legends: [
      {
        anchor: 'bottom' as const,
        direction: 'row' as const,
        justify: false,
        translateY: 56,
        itemsSpacing: 0,
        itemWidth: 100,
        itemHeight: 18,
        itemTextColor: themeColors.text,
        itemDirection: 'left-to-right' as const,
        itemOpacity: 1,
        symbolSize: 18,
        symbolShape: 'circle' as const,
        effects: [
          {
            on: 'hover' as const,
            style: {
              itemTextColor: isDark ? '#ffffff' : '#000000'
            }
          }
        ]
      }
    ]
  };

  const generatePDF = () => {
    const doc = new jsPDF() as JsPDFWithAutoTable;
    
    // Türkçe karakterler için font ayarı
    doc.setFont('helvetica');
    
    // Türkçe karakter dönüşümü
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
    const statsData = [
      [turkishText('Toplam Ürün'), products.length.toString()],
      [turkishText('Sayılan Ürün'), products.filter(p => p.countedQuantity > 0).length.toString()],
      [turkishText('Doğru Sayım'), products.filter(p => Number(p.countedQuantity) === Number(p.Envant)).length.toString()],
      [turkishText('Eksik Sayım'), products.filter(p => Number(p.countedQuantity) < Number(p.Envant) && p.countedQuantity > 0).length.toString()],
      [turkishText('Fazla Sayım'), products.filter(p => Number(p.countedQuantity) > Number(p.Envant)).length.toString()],
      [turkishText('Sayılmayan'), products.filter(p => p.countedQuantity === 0).length.toString()]
    ];

    autoTable(doc, {
      startY: 50,
      head: [[turkishText('Metrik'), turkishText('Değer')]],
      body: statsData,
      theme: 'grid'
    });

    const finalY1 = doc.lastAutoTable.finalY;

    // Detaylı Ürün Listesi
    doc.setFontSize(16);
    doc.text(turkishText('Detaylı Ürün Listesi'), 20, finalY1 + 20);
    const productData = products.map(product => [
      product.Marka,
      product.UrunKodu,
      product.Barkod,
      product.Envant,
      product.countedQuantity.toString(),
      Number(product.countedQuantity) === Number(product.Envant) ? turkishText('Doğru') :
      Number(product.countedQuantity) < Number(product.Envant) ? 'Eksik' :
      Number(product.countedQuantity) > Number(product.Envant) ? 'Fazla' : turkishText('Sayılmadı')
    ]);

    autoTable(doc, {
      startY: finalY1 + 25,
      head: [['Marka', turkishText('Ürün Kodu'), 'Barkod', 'Beklenen', turkishText('Sayılan'), 'Durum']],
      body: productData,
      theme: 'grid'
    });

    doc.save('stok-sayim-raporu.pdf');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }

  // Benzersiz değerleri al
  const uniqueMarkas = Array.from(new Set(products.map(p => p.Marka))).sort();
  const uniqueUrunGruplari = Array.from(new Set(products.map(p => p.UrunGrubu))).sort();
  const uniqueSezonlar = Array.from(new Set(products.map(p => p.Sezi))).sort();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={generatePDF}
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marka</label>
              <Select value={markaFilter} onValueChange={setMarkaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Marka seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueMarkas.map(marka => (
                    <SelectItem key={marka} value={marka}>{marka}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Grubu</label>
              <Select value={urunGrubuFilter} onValueChange={setUrunGrubuFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ürün grubu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueUrunGruplari.map(grup => (
                    <SelectItem key={grup} value={grup}>{grup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sezon</label>
              <Select value={sezonFilter} onValueChange={setSezonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sezon seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueSezonlar.map(sezon => (
                    <SelectItem key={sezon} value={sezon}>{sezon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min. Sayım</label>
              <Input
                type="number"
                value={minCount}
                onChange={(e) => setMinCount(e.target.value)}
                placeholder="Min. sayım"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max. Sayım</label>
              <Input
                type="number"
                value={maxCount}
                onChange={(e) => setMaxCount(e.target.value)}
                placeholder="Max. sayım"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sayım Durumu */}
        <Card>
          <CardHeader>
            <CardTitle>Sayım Durumu Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsivePie
                {...commonProps}
                data={countStatus.data}
                colors={{ datum: 'data.color' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Marka Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Marka Dağılımı (İlk 8)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsivePie
                {...commonProps}
                data={brandDistribution}
                colors={{ datum: 'data.color' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ürün Grubu Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Ürün Grubu Dağılımı (İlk 8)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsivePie
                {...commonProps}
                data={productGroupDistribution}
                colors={{ datum: 'data.color' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sezon Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Sezon Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsivePie
                {...commonProps}
                data={seasonDistribution}
                colors={{ datum: 'data.color' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 