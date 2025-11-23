"use client";

import { useState, Suspense } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstallationReservationsManager from "@/components/staff/InstallationReservationsManager";
import EquipmentReservationsManager from "@/components/staff/EquipmentReservationsManager";

function StaffActiveReservationsContent() {
  const [activeTab, setActiveTab] = useState<
    "installations" | "equipment"
  >("installations");

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Reservas Ativas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerenciar reservas de instalações e equipamentos
          </p>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("installations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "installations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reservas de Instalações
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "equipment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reservas de Equipamentos
            </button>
          </nav>
        </div>

        {activeTab === "installations" && <InstallationReservationsManager />}

        {activeTab === "equipment" && <EquipmentReservationsManager />}
      </section>
    </Layout>
  );
}

export default function StaffActiveReservationsPage() {
  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <Suspense fallback={<div>Carregando...</div>}>
        <StaffActiveReservationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
