export interface CorrectionRecord {
  timestamp: string;
  oldValue: number;
  newValue: number;
  reason?: string;
  operator?: string;
}

export interface Product {
  Marka: string;
  UrunGrubu: string;
  UrunKodu: string;
  RenkKodu: string;
  Bedi: string;
  Envant: string;
  Barkod: string;
  Sezi: string;
  countedQuantity: number;
  corrections?: CorrectionRecord[];
  lastCorrectionDate?: string;
}

export interface InventoryCount {
  id: string;
  date: string;
  products: Product[];
  isCompleted: boolean;
} 