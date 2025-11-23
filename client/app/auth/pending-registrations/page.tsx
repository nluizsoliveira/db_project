"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiGet, apiPost } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Registration {
  id_solicitacao: number;
  cpf_pessoa: string;
  nome: string;
  email: string;
  nusp: string;
  data_solicitacao: string;
  data_aprovacao?: string;
  data_rejeicao?: string;
  cpf_admin_aprovador?: string;
  nome_admin_aprovador?: string;
  motivo_rejeicao?: string;
}

export default function PendingRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState<
    Registration[]
  >([]);
  const [rejectedRegistrations, setRejectedRegistrations] = useState<
    Registration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{
    category: "success" | "error";
    text: string;
  } | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadAllRegistrations();
  }, []);

  const loadAllRegistrations = async () => {
    setLoading(true);
    try {
      // Carregar pendentes
      const pendingData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/pending-registrations");

      if (pendingData.success && Array.isArray(pendingData.registrations)) {
        setRegistrations(pendingData.registrations);
      } else {
        setRegistrations([]);
      }

      // Carregar aprovados
      const approvedData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/approved-registrations");

      if (approvedData.success && Array.isArray(approvedData.registrations)) {
        setApprovedRegistrations(approvedData.registrations);
      } else {
        setApprovedRegistrations([]);
      }

      // Carregar rejeitados
      const rejectedData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/rejected-registrations");

      if (rejectedData.success && Array.isArray(rejectedData.registrations)) {
        setRejectedRegistrations(rejectedData.registrations);
      } else {
        setRejectedRegistrations([]);
      }
    } catch (err) {
      console.error("Erro ao carregar registrations:", err);
      setRegistrations([]);
      setApprovedRegistrations([]);
      setRejectedRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = loadAllRegistrations;

  const handleApprove = async (id: number) => {
    // Encontrar o registro antes de aprovar para mostrar na mensagem
    const registration = registrations.find((r) => r.id_solicitacao === id);
    const userName = registration?.nome || "usuário";

    // Marcar como processando
    setProcessingIds((prev) => new Set(prev).add(id));

    // Remover da lista imediatamente (otimista)
    setRegistrations((prev) => prev.filter((r) => r.id_solicitacao !== id));

    // Mostrar mensagem de loading
    setMessage({
      category: "success",
      text: `Aprovando cadastro de ${userName}...`,
    });

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>("/auth/approve-registration", {
        id_solicitacao: id,
      });

      if (data.success) {
        setMessage({
          category: "success",
          text: `Cadastro de ${userName} aprovado com sucesso!`,
        });
        // Recarregar todas as listas para garantir sincronização
        loadAllRegistrations();
      } else {
        // Reverter remoção se falhar
        if (registration) {
          setRegistrations((prev) =>
            [...prev, registration].sort(
              (a, b) =>
                new Date(a.data_solicitacao).getTime() -
                new Date(b.data_solicitacao).getTime()
            )
          );
        }
        setMessage({
          category: "error",
          text: data.message || "Erro ao aprovar cadastro",
        });
      }
    } catch (err) {
      // Reverter remoção se falhar
      if (registration) {
        setRegistrations((prev) =>
          [...prev, registration].sort(
            (a, b) =>
              new Date(a.data_solicitacao).getTime() -
              new Date(b.data_solicitacao).getTime()
          )
        );
      }
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar solicitação";
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: "error",
          text: errorData.message || "Erro ao aprovar cadastro",
        });
      } catch {
        setMessage({ category: "error", text: errorMessage });
      }
    } finally {
      // Remover do set de processando
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = (id: number) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;

    // Encontrar o registro antes de rejeitar para mostrar na mensagem
    const registration = registrations.find(
      (r) => r.id_solicitacao === rejectingId
    );
    const userName = registration?.nome || "usuário";

    // Fechar dialog
    setRejectDialogOpen(false);

    // Marcar como processando
    setProcessingIds((prev) => new Set(prev).add(rejectingId));

    // Remover da lista imediatamente (otimista)
    setRegistrations((prev) =>
      prev.filter((r) => r.id_solicitacao !== rejectingId)
    );

    // Mostrar mensagem de loading
    setMessage({
      category: "success",
      text: `Rejeitando cadastro de ${userName}...`,
    });

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>("/auth/reject-registration", {
        id_solicitacao: rejectingId,
        observacoes: rejectReason || null,
      });

      if (data.success) {
        setMessage({
          category: "success",
          text: `Cadastro de ${userName} rejeitado.`,
        });
        // Recarregar todas as listas para garantir sincronização
        loadAllRegistrations();
      } else {
        // Reverter remoção se falhar
        if (registration) {
          setRegistrations((prev) =>
            [...prev, registration].sort(
              (a, b) =>
                new Date(a.data_solicitacao).getTime() -
                new Date(b.data_solicitacao).getTime()
            )
          );
        }
        setMessage({
          category: "error",
          text: data.message || "Erro ao rejeitar cadastro",
        });
      }
    } catch (err) {
      // Reverter remoção se falhar
      if (registration) {
        setRegistrations((prev) =>
          [...prev, registration].sort(
            (a, b) =>
              new Date(a.data_solicitacao).getTime() -
              new Date(b.data_solicitacao).getTime()
          )
        );
      }
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar solicitação";
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: "error",
          text: errorData.message || "Erro ao rejeitar cadastro",
        });
      } catch {
        setMessage({ category: "error", text: errorMessage });
      }
    } finally {
      // Remover do set de processando
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(rejectingId);
        return next;
      });
      setRejectingId(null);
      setRejectReason("");
    }
  };

  const cancelReject = () => {
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectReason("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
  };

  return (
    <Layout
      messages={message ? [message] : undefined}
      mainClass="w-full max-w-full p-0 flex-1"
    >
      <div className="w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Solicitações de Cadastro
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Carregando...</div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {/* Grid de Pendentes */}
            <AccordionItem value="pendentes">
              <AccordionTrigger className="text-2xl font-semibold text-gray-800">
                Pendentes ({registrations.length})
              </AccordionTrigger>
              <AccordionContent>
                {registrations.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            CPF
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            NUSP
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Data Solicitação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {registrations.map((reg) => (
                          <tr key={reg.id_solicitacao}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.cpf_pessoa}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nome}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.email}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nusp}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {formatDate(reg.data_solicitacao)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() =>
                                  handleApprove(reg.id_solicitacao)
                                }
                                disabled={processingIds.has(reg.id_solicitacao)}
                                className="mr-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingIds.has(reg.id_solicitacao)
                                  ? "Processando..."
                                  : "Aprovar"}
                              </button>
                              <button
                                onClick={() => handleReject(reg.id_solicitacao)}
                                disabled={processingIds.has(reg.id_solicitacao)}
                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingIds.has(reg.id_solicitacao)
                                  ? "Processando..."
                                  : "Rejeitar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
                    <p className="text-gray-500">
                      Nenhuma solicitação de cadastro pendente.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Grid de Aprovados */}
            <AccordionItem value="aprovados">
              <AccordionTrigger className="text-2xl font-semibold text-green-700">
                Aprovados ({approvedRegistrations.length})
              </AccordionTrigger>
              <AccordionContent>
                {approvedRegistrations.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-green-200 bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            CPF
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            NUSP
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Data Solicitação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Data Aprovação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Aprovado por
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {approvedRegistrations.map((reg) => (
                          <tr
                            key={reg.id_solicitacao}
                            className="bg-green-50/30"
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.cpf_pessoa}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nome}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.email}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nusp}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {formatDate(reg.data_solicitacao)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {formatDate(reg.data_aprovacao || "")}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nome_admin_aprovador || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-white p-8 text-center shadow">
                    <p className="text-gray-500">
                      Nenhuma solicitação aprovada.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Grid de Rejeitados */}
            <AccordionItem value="rejeitados">
              <AccordionTrigger className="text-2xl font-semibold text-red-700">
                Rejeitados ({rejectedRegistrations.length})
              </AccordionTrigger>
              <AccordionContent>
                {rejectedRegistrations.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-red-200 bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            CPF
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            NUSP
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Data Solicitação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Data Rejeição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Rejeitado por
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Motivo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {rejectedRegistrations.map((reg) => (
                          <tr key={reg.id_solicitacao} className="bg-red-50/30">
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.cpf_pessoa}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nome}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.email}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nusp}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {formatDate(reg.data_solicitacao)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {formatDate(reg.data_rejeicao || "")}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {reg.nome_admin_aprovador || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {reg.motivo_rejeicao || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow">
                    <p className="text-gray-500">
                      Nenhuma solicitação rejeitada.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Dialog de Rejeição */}
        <Dialog
          open={rejectDialogOpen}
          onOpenChange={(open) => {
            setRejectDialogOpen(open);
            if (!open) {
              // Limpar estado quando o dialog fechar
              setRejectingId(null);
              setRejectReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Solicitação de Cadastro</DialogTitle>
              <DialogDescription>
                {rejectingId && (
                  <>
                    Você está prestes a rejeitar a solicitação de{" "}
                    <strong>
                      {registrations.find(
                        (r) => r.id_solicitacao === rejectingId
                      )?.nome || "usuário"}
                    </strong>
                    . Por favor, informe o motivo da rejeição (opcional).
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label
                htmlFor="reject-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Motivo da Rejeição (opcional)
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da rejeição..."
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <DialogFooter>
              <button
                onClick={cancelReject}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirmar Rejeição
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
