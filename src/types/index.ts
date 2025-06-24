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
}

export interface InventoryCount {
  id: string;
  date: string;
  products: Product[];
  isCompleted: boolean;
} 