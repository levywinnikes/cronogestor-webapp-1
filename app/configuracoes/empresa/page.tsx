"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function EmpresaSettingsPage() {
  return (
    <Card>
      <CardHeader title="Configurações da Empresa" icon={<Building className="w-5 h-5" />} />
      <CardContent>
        <p className="text-sm text-text-secondary">
          As configurações cadastrais da sua empresa (PF/PJ) serão disponibilizadas nesta seção em breve.
        </p>
      </CardContent>
    </Card>
  );
}
