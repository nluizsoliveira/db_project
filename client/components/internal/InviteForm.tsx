'use client';

import { useState, FormEvent } from 'react';
import { useInternalActivities } from '@/hooks/useActivities';
import { useCreateInvite } from '@/hooks/useInvites';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface Activity {
  id_atividade: number;
  nome_atividade: string;
}

interface InviteFormProps {
  onSuccess?: () => void;
}

export default function InviteForm({ onSuccess }: InviteFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    documento_convidado: '',
    nome_convidado: '',
    email_convidado: '',
    telefone_convidado: '',
    id_atividade: '',
    observacoes: '',
  });
  const [createdToken, setCreatedToken] = useState('');

  const { data: activitiesData = [], isLoading: loading } = useInternalActivities();
  const createMutation = useCreateInvite();
  const alertDialog = useAlertDialog();

  // Get unique activities by id_atividade
  const activities = Array.from(
    new Map(activitiesData.map((a) => [a.id_atividade, { id_atividade: a.id_atividade, nome_atividade: a.nome_atividade }])).values()
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.documento_convidado || !formData.nome_convidado) {
      setError('Documento e nome do convidado são obrigatórios');
      return;
    }

    try {
      // Note: The API might return invite data differently, adjust as needed
      const data = await createMutation.mutateAsync({
        email: formData.email_convidado || '',
        nome: formData.nome_convidado,
      });

      if (data.success) {
        setSuccess(true);
        // If the API returns a token, extract it here
        // setCreatedToken(data.invite?.token || '');
        if (onSuccess) {
          onSuccess();
        }
        // Reset form
        setFormData({
          documento_convidado: '',
          nome_convidado: '',
          email_convidado: '',
          telefone_convidado: '',
          id_atividade: '',
          observacoes: '',
        });
      } else {
        setError(data.message || 'Erro ao criar convite');
      }
    } catch (err: any) {
      console.error('Erro ao criar convite:', err);
      setError(err.message || 'Erro ao criar convite');
    }
  };

  const submitting = createMutation.isPending;

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      alertDialog.showAlert('Token copiado para a área de transferência!', 'Sucesso');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Convidar Usuário Externo</h2>

      {success && createdToken && (
        <div className="mb-4 rounded-lg bg-green-50 p-4">
          <p className="mb-2 text-sm font-semibold text-green-800">Convite criado com sucesso!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white p-2 text-xs text-gray-900">{createdToken}</code>
            <button
              onClick={copyToken}
              className="rounded bg-[#1094ab] px-3 py-1 text-xs font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
            >
              Copiar
            </button>
          </div>
          <p className="mt-2 text-xs text-green-700">
            Compartilhe este token com o usuário externo para que ele possa fazer login.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">
              Documento do Convidado <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.documento_convidado}
              onChange={(e) => setFormData({ ...formData, documento_convidado: e.target.value })}
              placeholder="CPF ou RG"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">
              Nome do Convidado <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.nome_convidado}
              onChange={(e) => setFormData({ ...formData, nome_convidado: e.target.value })}
              placeholder="Nome completo"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">E-mail do Convidado</span>
            <input
              type="email"
              value={formData.email_convidado}
              onChange={(e) => setFormData({ ...formData, email_convidado: e.target.value })}
              placeholder="email@exemplo.com"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">Telefone do Convidado</span>
            <input
              type="text"
              value={formData.telefone_convidado}
              onChange={(e) => setFormData({ ...formData, telefone_convidado: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-600">
          <span className="mb-1 block font-medium">Atividade (Opcional)</span>
          {loading ? (
            <div className="py-2 text-sm text-gray-500">Carregando atividades...</div>
          ) : (
            <select
              value={formData.id_atividade}
              onChange={(e) => setFormData({ ...formData, id_atividade: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            >
              <option value="">Nenhuma atividade específica</option>
              {activities.map((activity) => (
                <option key={activity.id_atividade} value={activity.id_atividade}>
                  {activity.nome_atividade}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="block text-sm text-gray-600">
          <span className="mb-1 block font-medium">Observações</span>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Observações adicionais sobre o convite"
            rows={3}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                documento_convidado: '',
                nome_convidado: '',
                email_convidado: '',
                telefone_convidado: '',
                id_atividade: '',
                observacoes: '',
              });
              setError('');
              setSuccess(false);
              setCreatedToken('');
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar Convite'}
          </button>
        </div>
      </form>

      <AlertDialog open={alertDialog.open} onOpenChange={alertDialog.handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={alertDialog.handleClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
