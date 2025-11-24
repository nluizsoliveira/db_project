"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { Checkbox } from "@/components/ui/checkbox";

const ATRIBUICOES_POSSIVEIS = [
  "Administrador",
  "Professor de Educação Física",
  "Coordenador de Atividades Esportivas",
  "Treinador de Atletismo",
  "Professor de Natação",
  "Preparador Físico",
  "Instrutor de Musculação",
  "Técnico de Futebol",
  "Técnico de Vôlei",
  "Assistente de Reabilitação Física",
  "Supervisor de Recreação",
  "Nutricionista Esportivo",
  "Psicólogo Esportivo",
  "Fisioterapeuta",
  "Analista de Performance",
  "Gerente de Eventos Esportivos",
  "Administrador de Ginásio",
  "Monitores de Atividades Recreativas",
  "Gestor de Programas Esportivos",
  "Professor de Yoga ou Pilates",
  "Especialista em Medicina Esportiva",
];

interface User {
  cpf: string;
  nome: string;
  email: string;
  celular: string | null;
  data_nascimento: string | null;
  tipo_usuario: string;
  nusp: string | null;
  formacao: string | null;
  numero_conselho: string | null;
  is_admin?: boolean;
  is_funcionario?: boolean;
  is_educador_fisico?: boolean;
  atribuicoes?: string[];
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    celular: "",
    data_nascimento: "",
    tipo_usuario: "interno",
    nusp: "",
    formacao: "",
    numero_conselho: "",
    is_admin: false,
    is_funcionario: false,
    is_educador_fisico: false,
    atribuicao: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const alertDialog = useAlertDialog();

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{
        success: boolean;
        users: User[];
      }>("/admin/users");

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError("Erro ao carregar usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      cpf: "",
      nome: "",
      email: "",
      celular: "",
      data_nascimento: "",
      tipo_usuario: "interno",
      nusp: "",
      formacao: "",
      numero_conselho: "",
      is_admin: false,
      is_funcionario: false,
      is_educador_fisico: false,
      atribuicao: "",
    });
    setShowForm(true);
  };

  const handleEdit = async (cpf: string) => {
    try {
      const data = await apiGet<{
        success: boolean;
        user: User;
      }>(`/admin/users/${cpf}`);

      if (data.success && data.user) {
        const user = data.user;
        const atribuicoes = user.atribuicoes || [];
        // Encontrar atribuição principal (primeira que não seja Administrador)
        const atribuicaoPrincipal =
          atribuicoes.find((a) => a !== "Administrador") || "";

        const isFuncionario = user.is_funcionario || false;

        setEditingUser(user);
        setFormData({
          cpf: user.cpf,
          nome: user.nome,
          email: user.email,
          celular: user.celular || "",
          data_nascimento: user.data_nascimento || "",
          tipo_usuario: user.tipo_usuario,
          nusp: user.nusp || "",
          formacao: user.formacao || "",
          numero_conselho: user.numero_conselho || "",
          is_admin: user.is_admin || false,
          is_funcionario: isFuncionario,
          is_educador_fisico: user.is_educador_fisico || false,
          atribuicao: atribuicaoPrincipal,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      alertDialog.showAlert("Erro ao carregar usuário", "Erro");
    }
  };

  const handleDelete = async (cpf: string) => {
    alertDialog.showConfirm(
      "Deseja realmente deletar este usuário? Esta ação não pode ser desfeita.",
      "Confirmar Exclusão",
      async () => {
        try {
          const data = await apiDelete<{
            success: boolean;
            message?: string;
          }>(`/admin/users/${cpf}`);

          if (data.success) {
            alertDialog.showAlert(
              data.message || "Usuário deletado com sucesso!",
              "Sucesso"
            );
            loadUsers();
          } else {
            alertDialog.showAlert(
              data.message || "Erro ao deletar usuário",
              "Erro"
            );
          }
        } catch (err: any) {
          console.error("Erro ao deletar usuário:", err);
          alertDialog.showAlert(
            err.message || "Erro ao deletar usuário",
            "Erro"
          );
        }
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingUser) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/users/${editingUser.cpf}`, {
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          tipo_usuario: formData.tipo_usuario,
          nusp: formData.tipo_usuario === "interno" ? formData.nusp : null,
          formacao: formData.is_funcionario ? formData.formacao || null : null,
          numero_conselho: formData.is_educador_fisico
            ? formData.numero_conselho || null
            : null,
          is_admin: formData.is_admin,
          is_funcionario: formData.is_funcionario,
          is_educador_fisico: formData.is_educador_fisico,
          atribuicao:
            formData.is_funcionario && formData.atribuicao
              ? formData.atribuicao
              : null,
        });

        if (data.success) {
          alertDialog.showAlert(
            data.message || "Usuário atualizado com sucesso!",
            "Sucesso"
          );
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || "Erro ao atualizar usuário");
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>("/admin/users", {
          cpf: formData.cpf,
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          data_nascimento: formData.data_nascimento || null,
          tipo_usuario: formData.tipo_usuario,
          nusp: formData.tipo_usuario === "interno" ? formData.nusp : null,
          formacao: formData.is_funcionario ? formData.formacao : null,
          numero_conselho: formData.numero_conselho || null,
        });

        if (data.success) {
          alertDialog.showAlert(
            data.message || "Usuário criado com sucesso!",
            "Sucesso"
          );
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || "Erro ao criar usuário");
        }
      }
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.message || "Erro ao salvar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "cpf",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              CPF
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("cpf")}</div>
        ),
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "tipo_usuario",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Tipo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("tipo_usuario")}</div>,
      },
      {
        accessorKey: "nusp",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              NUSP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nusp") || "—"}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(user.cpf)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(user.cpf)}
                  className="text-destructive"
                >
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getRowId: (row) => row.cpf.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Gerenciar Usuários
        </h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Usuário
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingUser && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">CPF</span>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
                    maxLength={11}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  />
                </label>
              )}
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Nome</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Celular</span>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      celular: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              {!editingUser && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">
                      Data de Nascimento
                    </span>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_nascimento: e.target.value,
                        })
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">
                      Tipo de Usuário
                    </span>
                    <select
                      value={formData.tipo_usuario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_usuario: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    >
                      <option value="interno">Interno USP</option>
                      <option value="externo">Externo USP</option>
                    </select>
                  </label>
                  {formData.tipo_usuario === "interno" && (
                    <>
                      <label className="text-sm text-gray-600">
                        <span className="mb-1 block font-medium">NUSP</span>
                        <input
                          type="text"
                          value={formData.nusp}
                          onChange={(e) =>
                            setFormData({ ...formData, nusp: e.target.value })
                          }
                          required
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                        />
                      </label>
                      {formData.is_funcionario && (
                        <>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">
                              Formação
                            </span>
                            <input
                              type="text"
                              value={formData.formacao}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  formacao: e.target.value,
                                })
                              }
                              required
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">
                              Número do Conselho (Educador Físico)
                            </span>
                            <input
                              type="text"
                              value={formData.numero_conselho}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  numero_conselho: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Seção de Permissões - Apenas quando editando */}
            {editingUser && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Permissões e Atribuições
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">
                      Tipo de Usuário
                    </span>
                    <select
                      value={formData.tipo_usuario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_usuario: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    >
                      <option value="interno">Interno USP</option>
                      <option value="externo">Externo USP</option>
                    </select>
                  </label>

                  {formData.tipo_usuario === "interno" && (
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">NUSP</span>
                      <input
                        type="text"
                        value={formData.nusp}
                        onChange={(e) =>
                          setFormData({ ...formData, nusp: e.target.value })
                        }
                        required
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_funcionario"
                      checked={formData.is_funcionario}
                      onCheckedChange={(checked) => {
                        const isFuncionario = checked === true;
                        setFormData({
                          ...formData,
                          is_funcionario: isFuncionario,
                          // Se desmarcar funcionário, também desmarcar educador e admin
                          is_educador_fisico: isFuncionario
                            ? formData.is_educador_fisico
                            : false,
                          is_admin: isFuncionario ? formData.is_admin : false,
                        });
                      }}
                      disabled={formData.tipo_usuario !== "interno"}
                    />
                    <label
                      htmlFor="is_funcionario"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      É Funcionário (Staff)
                    </label>
                  </div>

                  {formData.is_funcionario && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_admin"
                          checked={formData.is_admin}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              is_admin: checked === true,
                            })
                          }
                        />
                        <label
                          htmlFor="is_admin"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          É Administrador
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_educador_fisico"
                          checked={formData.is_educador_fisico}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              is_educador_fisico: checked === true,
                            })
                          }
                        />
                        <label
                          htmlFor="is_educador_fisico"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          É Educador Físico
                        </label>
                      </div>

                      {formData.is_funcionario && (
                        <>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">
                              Formação
                            </span>
                            <input
                              type="text"
                              value={formData.formacao}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  formacao: e.target.value,
                                })
                              }
                              required={formData.is_funcionario}
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>

                          {formData.is_educador_fisico && (
                            <label className="text-sm text-gray-600">
                              <span className="mb-1 block font-medium">
                                Número do Conselho (Educador Físico)
                              </span>
                              <input
                                type="text"
                                value={formData.numero_conselho}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    numero_conselho: e.target.value,
                                  })
                                }
                                required={formData.is_educador_fisico}
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                              />
                            </label>
                          )}

                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">
                              Atribuição Principal
                            </span>
                            <select
                              value={formData.atribuicao}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  atribuicao: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            >
                              <option value="">Selecione uma atribuição</option>
                              {ATRIBUICOES_POSSIVEIS.filter(
                                (a) => a !== "Administrador"
                              ).map((atrib) => (
                                <option key={atrib} value={atrib}>
                                  {atrib}
                                </option>
                              ))}
                            </select>
                          </label>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
              >
                {submitting
                  ? "Salvando..."
                  : editingUser
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Carregando usuários...
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por nome..."
              value={
                (table.getColumn("nome")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("nome")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Input
              placeholder="Filtrar por email..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colunas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === "tipo_usuario"
                          ? "Tipo"
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={alertDialog.handleClose}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertDialog.type === "confirm" ? (
              <>
                <AlertDialogCancel onClick={alertDialog.handleCancel}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={alertDialog.handleConfirm}>
                  Confirmar
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={alertDialog.handleClose}>
                OK
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
