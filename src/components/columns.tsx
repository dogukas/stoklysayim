"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { ArrowUpDown, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "Marka",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Marka
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              A'dan Z'ye
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Z'den A'ya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <div className="p-2">
              <input
                type="text"
                placeholder="Marka ara..."
                className="w-full p-2 border rounded"
                onChange={(e) => column.setFilterValue(e.target.value)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "UrunGrubu",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Ürün Grubu
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              A'dan Z'ye
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Z'den A'ya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <div className="p-2">
              <input
                type="text"
                placeholder="Ürün grubu ara..."
                className="w-full p-2 border rounded"
                onChange={(e) => column.setFilterValue(e.target.value)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "UrunKodu",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Ürün Kodu
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Artan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Azalan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <div className="p-2">
              <input
                type="text"
                placeholder="Ürün kodu ara..."
                className="w-full p-2 border rounded"
                onChange={(e) => column.setFilterValue(e.target.value)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "RenkKodu",
    header: "Renk Kodu",
  },
  {
    accessorKey: "Bedi",
    header: "Beden",
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.getValue("Bedi")}</div>
    },
  },
  {
    accessorKey: "Envant",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Envanter
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Artan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Azalan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <div className="p-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 p-2 border rounded"
                  onChange={(e) => {
                    const value = e.target.value;
                    column.setFilterValue((old: any) => ({
                      ...old,
                      min: value ? parseInt(value) : undefined
                    }));
                  }}
                />
                <MinusCircle className="h-4 w-4" />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-20 p-2 border rounded"
                  onChange={(e) => {
                    const value = e.target.value;
                    column.setFilterValue((old: any) => ({
                      ...old,
                      max: value ? parseInt(value) : undefined
                    }));
                  }}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("Envant")}</div>
    },
    filterFn: (row, id, value: { min?: number; max?: number }) => {
      const envanter = parseInt(row.getValue(id));
      if (value.min !== undefined && envanter < value.min) return false;
      if (value.max !== undefined && envanter > value.max) return false;
      return true;
    },
  },
  {
    accessorKey: "Barkod",
    header: "Barkod",
    cell: ({ row }) => {
      return <div className="font-mono">{row.getValue("Barkod")}</div>
    },
  },
  {
    accessorKey: "Sezi",
    header: "Sezon",
  },
  {
    accessorKey: "countedQuantity",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Sayılan
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sıralama</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Artan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Azalan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <div className="p-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 p-2 border rounded"
                  onChange={(e) => {
                    const value = e.target.value;
                    column.setFilterValue((old: any) => ({
                      ...old,
                      min: value ? parseInt(value) : undefined
                    }));
                  }}
                />
                <MinusCircle className="h-4 w-4" />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-20 p-2 border rounded"
                  onChange={(e) => {
                    const value = e.target.value;
                    column.setFilterValue((old: any) => ({
                      ...old,
                      max: value ? parseInt(value) : undefined
                    }));
                  }}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("countedQuantity")}</div>
    },
    filterFn: (row, id, value: { min?: number; max?: number }) => {
      const counted = row.getValue(id) as number;
      if (value.min !== undefined && counted < value.min) return false;
      if (value.max !== undefined && counted > value.max) return false;
      return true;
    },
  },
  {
    id: "status",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between">
              Durum
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={column.getFilterValue() === "Sayılmadı"}
              onCheckedChange={() => column.setFilterValue("Sayılmadı")}
            >
              Sayılmadı
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getFilterValue() === "Tamam"}
              onCheckedChange={() => column.setFilterValue("Tamam")}
            >
              Tamam
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getFilterValue() === "Eksik"}
              onCheckedChange={() => column.setFilterValue("Eksik")}
            >
              Eksik
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getFilterValue() === "Fazla"}
              onCheckedChange={() => column.setFilterValue("Fazla")}
            >
              Fazla
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.setFilterValue(null)}>
              Filtreyi Temizle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => {
      const counted = row.getValue("countedQuantity") as number;
      const expected = Number(row.getValue("Envant"));

      if (counted === 0) {
        return <Badge variant="outline" className="w-24 justify-center">Sayılmadı</Badge>
      } else if (counted === expected) {
        return <Badge variant="success" className="bg-green-500 w-24 justify-center">Tamam</Badge>
      } else if (counted < expected) {
        return <Badge variant="destructive" className="w-24 justify-center">Eksik</Badge>
      } else {
        return <Badge variant="warning" className="bg-yellow-500 w-24 justify-center">Fazla</Badge>
      }
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      const counted = row.getValue("countedQuantity") as number;
      const expected = Number(row.getValue("Envant"));

      switch (value) {
        case "Sayılmadı":
          return counted === 0;
        case "Tamam":
          return counted === expected;
        case "Eksik":
          return counted < expected && counted > 0;
        case "Fazla":
          return counted > expected;
        default:
          return true;
      }
    },
  },
]; 