# 💬 Servidor de Chat em Tempo Real com Socket.IO para teste IA Gente Pokedex

Projeto é um servidor para troca de mensagens em tempo real, foi desenvolvido desenvolvido com **Node.js** e **Socket.IO** seu deploy foi realizado no Render [URL Do Deploy](https://ms-socket-pokedex.onrender.com).

Permite a conexao de multiplos usuários, e permite que eles enviem mensagens e recebam notificações de entrada e saída no chat.

## 🚀 Stacks usadas

- [Node.js](https://nodejs.org/)
- [Socket.IO](https://socket.io/)
- [HTTP (nativo do Node.js)](https://nodejs.org/api/http.html)

---

## 📦 Requisitos para rodar o projeto

- Node
- npm ou yarn

---

## ▶️ Rodando localmente

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   cd nome-do-repositorio
   ```
2. **Instale as dependências:**

   ```bash
   npm install
   ```
3. **Rode o projeto:**

   ```bash
   npm start
   ```  

4. **Acesse o servidor em:** [http://localhost:3001](http://localhost:3001)

4. **Funcionalidades**

- ✅ Conexao de usuários com identificaçao pelo nome
- ✅ Lista de usuarios conectados
- ✅ Mensagens de texto transmitida para todos os usuários conectados
- ✅ Notificaçao de login e logout de usuário do chat



import { Toast } from '@cvccorp-components/chui-react-components';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface IUseExportReport {
  downloadService: any;
  filenamePrefix: string;
  defaultDate?: string;
}

export const useExportReport = ({
  downloadService,
  filenamePrefix,
  defaultDate = '',
}: IUseExportReport) => {
  const [searchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (currentDate: string) => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();

      // Mapeamento dos parametros
      const paramMappings = [
        { from: 'sq_unit', to: 'sqUnit' },
        { from: 'sq_system', to: 'sqSystem' },
        { from: 'sq_bank', to: 'sqBank' },
        { from: 'st_billet', to: 'stBillet' },
        { from: 'nr_external_reference', to: 'nrExternalReference' },
        { from: 'nr_our_number', to: 'nrOurNumber' },
        {
          from: 'initial_dt_cancellation',
          to: 'initialDtCancellation',
          fallback: defaultDate,
        },
        {
          from: 'final_dt_cancellation',
          to: 'finalDtCancellation',
          fallback: defaultDate,
        },
        {
          from: 'initial_dt_installment_issue',
          to: 'initialDtInstallmentIssue',
          fallback: defaultDate,
        },
        {
          from: 'final_dt_installment_issue',
          to: 'finalDtInstallmentIssue',
          fallback: defaultDate,
        },
        {
          from: 'dt_installment_due',
          to: 'dtInstallmentDue',
          fallback: defaultDate,
        },
        {
          from: 'nr_client_document',
          to: 'nrClientDocument',
          fallback: defaultDate,
        },
        { from: 'document_type', to: 'documentType', fallback: defaultDate },
      ];

      // Adicionando parametros ao URLSearchParams
      paramMappings.forEach(({ from, to, fallback }) => {
        const value = searchParams.get(from);
        if (value) {
          params.append(to, value);
        } else if (fallback) {
          params.append(to, fallback);
        }
      });

      // Cria o blob com o tipo correto e faz o download
      const response = await downloadService.get(params.toString());
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const now = new Date();
      const filename = `${filenamePrefix}_${now.toLocaleDateString('pt-BR').replace(/\//g, '_')}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}.xlsx`;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      Toast.success({
        title: 'Relatório exportado com sucesso.',
        description: 'Verifique o arquivo baixado no seu computador.',
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      Toast.danger({
        title: 'Erro ao exportar relatório.',
        description: `${error}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
};


import React from 'react';
import * as S from '../styles';
import { useForm } from '@cvccorp-components/chui-react-form';
import ControlledInput from '@/presentation/components/ControlledInput';
import { Button, Toast } from '@cvccorp-components/chui-react-components';
import { Download, Search, Trash } from 'lucide-react';
import { IBank, IBusinessUnit, ISystem } from '@/domain/models';
import ControlledSelect from '@/presentation/components/ControlledSelect';
import { useSearchParams } from 'react-router-dom';
import {
  searchSlipFilterSchema,
  TSearchSlipFilterSchema,
} from '@/validation/searchSlipSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledInputDatePicker from '@/presentation/components/ControlledInputDatePicker/ControlledInputDatePicker';
import { makeRemoteDownloadGenerateByManager } from '@/main/factories/usecases/searchSlips';
import getFormattedCurrentDate from '@/utils/functions/getFormateCurrentDate';
import { useFilterDropdownData } from '@/presentation/hooks/useFilterDropdownData';
import { useExportReport } from '@/presentation/hooks/useExportReport';

interface IFilterSearchSlipGenerated {
  loading: boolean;
}

const FilterSearchSlipGenerated = ({
  loading: propLoading,
}: IFilterSearchSlipGenerated) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    businessUnits,
    banks,
    systems,
    loading: dropdownLoading,
    error,
  } = useFilterDropdownData();

  if (error) {
    Toast.danger({
      title: 'Erro ao carregar dados',
      description: `${error}`,
    });
  }

  const currentDate = getFormattedCurrentDate();

  const { handleExport, isExporting } = useExportReport({
    downloadService: makeRemoteDownloadGenerateByManager(),
    filenamePrefix: 'boletos_gerados',
    defaultDate: currentDate,
  });

  const handleExportClick = () => {
    handleExport(currentDate);
  };

  const isLoading = propLoading || dropdownLoading || isExporting;

  const sqUnit = searchParams.get('sq_unit');
  const sqSystem = searchParams.get('sq_system');
  const sqBank = searchParams.get('sq_bank');
  const stBillet = searchParams.get('st_billet');
  const nrExternalReference = searchParams.get('nr_external_reference');
  const nrOurNumber = searchParams.get('nr_our_number');
  const initialDtInstallmentIssue = searchParams.get(
    'initial_dt_installment_issue',
  );
  const finalDtInstallmentIssue = searchParams.get(
    'final_dt_installment_issue',
  );
  const dtInstallmentDue = searchParams.get('dt_installment_due');
  const nrClientDocument = searchParams.get('nr_client_document');
  const documentType = searchParams.get('document_type');

  const filtersParams =
    sqUnit ||
    sqSystem ||
    sqBank ||
    stBillet ||
    nrExternalReference ||
    nrOurNumber ||
    initialDtInstallmentIssue ||
    finalDtInstallmentIssue ||
    dtInstallmentDue ||
    nrClientDocument ||
    documentType;

  const { handleSubmit, control, formState } = useForm<TSearchSlipFilterSchema>(
    {
      resolver: zodResolver(searchSlipFilterSchema),
      values: {
        sq_unit: Number(sqUnit) ?? 0,
        sq_system: Number(sqSystem) ?? 0,
        sq_bank: Number(sqBank) ?? 0,
        st_billet: stBillet ? stBillet : '',
        nr_external_reference: nrExternalReference ?? '',
        nr_our_number: nrOurNumber ?? '',
        initial_dt_installment_issue: initialDtInstallmentIssue ?? currentDate,
        final_dt_installment_issue: finalDtInstallmentIssue ?? currentDate,
        dt_installment_due: dtInstallmentDue ?? '',
        nr_client_document: nrClientDocument ?? '',
        document_type: documentType ?? '',
      },
    },
  );

  const shouldEnableClearButton = formState.isDirty || filtersParams;

  const onSubmit = ({
    sq_unit,
    sq_system,
    sq_bank,
    st_billet,
    nr_external_reference,
    nr_our_number,
    initial_dt_installment_issue,
    final_dt_installment_issue,
    dt_installment_due,
    nr_client_document,
    document_type,
  }: TSearchSlipFilterSchema) => {
    if (initial_dt_installment_issue && final_dt_installment_issue) {
      const parseDateString = (dateString: string): Date => {
        const parts: string[] = dateString.split('/');
        const day: number = parseInt(parts[0], 10);
        const month: number = parseInt(parts[1], 10) - 1;
        const year: number = parseInt(parts[2], 10);

        return new Date(year, month, day);
      };

      const initialDate = parseDateString(initial_dt_installment_issue);
      const finalDate = parseDateString(final_dt_installment_issue);

      console.log('Parsed initialDate (corrected):', initialDate);
      console.log('Parsed finalDate (corrected):', finalDate);

      const diffTime = Math.abs(finalDate.getTime() - initialDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log('diffTime (ms):', diffTime);
      console.log('diffDays (corrected):', diffDays);

      if (diffDays > 90) {
        Toast.warning({
          title: 'Intervalo de datas inválido.',
          description:
            'A diferença entre datas não pode ser maior que 90 dias.',
        });
        return;
      }
    }
    setSearchParams(state => {
      state.delete('page_number');
      state.delete('searchPage');
      state.delete('currentPage');
      if (sq_unit) {
        state.set('sq_unit', String(sq_unit));
      } else {
        state.delete('sq_unit');
      }
      if (sq_system) {
        state.set('sq_system', String(sq_system));
      } else {
        state.delete('sq_system');
      }
      if (sq_bank) {
        state.set('sq_bank', String(sq_bank));
      } else {
        state.delete('sq_bank');
      }
      if (st_billet) {
        state.set('st_billet', st_billet);
      } else {
        state.delete('st_billet');
      }
      if (nr_external_reference) {
        state.set('nr_external_reference', nr_external_reference);
      }
      if (nr_our_number) {
        state.set('nr_our_number', nr_our_number);
      }
      if (initial_dt_installment_issue) {
        state.set('initial_dt_installment_issue', initial_dt_installment_issue);
      } else {
        state.set('initial_dt_installment_issue', currentDate);
      }
      if (nr_external_reference) {
        state.set('nr_external_reference', nr_external_reference);
      }
      if (final_dt_installment_issue) {
        state.set('final_dt_installment_issue', final_dt_installment_issue);
      } else {
        state.set('final_dt_installment_issue', currentDate);
      }
      if (dt_installment_due) {
        state.set('dt_installment_due', dt_installment_due);
      }
      if (nr_client_document) {
        state.set('nr_client_document', nr_client_document);
      }
      if (document_type) {
        state.set('document_type', document_type);
      }
      state.set('page_number', '0');
      state.set('currentPage', '0');
      return state;
    });
  };

  const onClear = () => {
    const dateKeys = [
      'initial_dt_installment_issue',
      'final_dt_installment_issue',
      'dt_installment_due',
    ];

    const allKeys = [
      'page_number',
      'sq_unit',
      'sq_system',
      'sq_bank',
      'st_billet',
      'nr_external_reference',
      'nr_our_number',
      'initial_dt_installment_issue',
      'final_dt_installment_issue',
      'dt_installment_due',
      'nr_client_document',
      'document_type',
    ];

    const hasDatePickerValue = dateKeys.some(param => searchParams.get(param));

    const newParams = new URLSearchParams(searchParams.toString());
    allKeys.forEach(key => newParams.delete(key));

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${newParams.toString()}`,
    );

    setSearchParams(newParams);

    if (hasDatePickerValue || formState) {
      window.location.reload();
    }
  };

  const businessUnitOptions = [
    { label: 'Selecione uma unidade de negócio', value: 0 },
    ...businessUnits.map((unit: IBusinessUnit) => ({
      label: unit.ds_name,
      value: unit.id,
    })),
  ];

  const bankOptions = [
    { label: 'Selecione um banco', value: 0 },
    ...banks.map((bank: IBank) => ({
      label: bank.ds_name,
      value: bank.id,
    })),
  ];

  const systemOptions = [
    { label: 'Selecione um sistema', value: 0 },
    ...systems.map((system: ISystem) => ({
      label: system.ds_system,
      value: system.id,
    })),
  ];

  return (
    <div>
      <div style={{ marginTop: '1rem' }}>Filtros</div>
      <S.FilterForm onSubmit={handleSubmit(onSubmit)}>
        <ControlledSelect
          control={control}
          name="sq_unit"
          label="Unidade de Negócios"
          options={businessUnitOptions}
          placeholder="Selecione uma unidade de negócio"
          disabled={isLoading}
        />
        <ControlledSelect
          control={control}
          name="sq_system"
          label="Sistema"
          options={systemOptions}
          placeholder="Selecione um sistema"
          disabled={isLoading}
        />
        <ControlledSelect
          control={control}
          name="sq_bank"
          label="Banco"
          options={bankOptions}
          placeholder="Selecione um banco"
          disabled={isLoading}
        />
        <ControlledSelect
          control={control}
          name="st_billet"
          label="Status Boleto"
          options={[
            { label: 'Selecione um status', value: '' },
            {
              label: 'Em Aberto',
              value: 'A',
            },
            {
              label: 'Cancelado',
              value: 'C',
            },
            {
              label: 'Liquidado',
              value: 'P',
            },
            {
              label: 'Não Registrado',
              value: 'S',
            },
            {
              label: 'Em Cancelamento',
              value: 'X',
            },
          ]}
          placeholder="Selecione uma unidade de negócio"
          disabled={isLoading}
        />
        <ControlledInput
          control={control}
          name="nr_external_reference"
          label="Cód. Ref. Externa"
          disabled={isLoading}
        />
        <ControlledInput
          control={control}
          name="nr_our_number"
          label="Nosso número"
          disabled={isLoading}
        />
        <ControlledInputDatePicker
          control={control}
          datePickerProps={{
            size: 'sm',
            twoMonths: false,
          }}
          name="initial_dt_installment_issue"
          label="Dt. de Emissão Inicial"
          disabled={isLoading}
        />
        <ControlledInputDatePicker
          control={control}
          datePickerProps={{
            size: 'sm',
            twoMonths: false,
          }}
          name="final_dt_installment_issue"
          label="Dt. de Emissão Final"
          disabled={isLoading}
        />
        <ControlledInputDatePicker
          control={control}
          datePickerProps={{
            size: 'sm',
            twoMonths: false,
          }}
          name="dt_installment_due"
          label="Dt. de Vencimento"
          disabled={isLoading}
        />
        <ControlledInput
          control={control}
          name="nr_client_document"
          label="Doc. do cliente"
          disabled={isLoading}
        />
        <ControlledSelect
          control={control}
          name="document_type"
          label="Tipo de documento"
          options={[
            {
              label: 'PF',
              value: 'F',
            },
            {
              label: 'PJ',
              value: 'J',
            },
          ]}
          placeholder="Selecione uma unidade de negócio"
          disabled={isLoading}
        />

        <S.ButtonContainer>
          <div>
            <Button
              type="submit"
              variant="filled"
              color="secondary"
              icon={<Search color="#fff" />}
              loading={isLoading}
            >
              Filtrar
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              color="secondary"
              icon={
                <Trash
                  color={!shouldEnableClearButton ? '#bdbdd0' : '#0a00b4'}
                />
              }
              onClick={onClear}
              loading={isLoading}
              disabled={!shouldEnableClearButton}
            >
              Limpar
            </Button>
          </div>
          <div>
            <Button
              variant="text"
              color="secondary"
              icon={<Download color="#0a00b4" />}
              loading={isLoading}
              onClick={handleExportClick}
            >
              Exportar
            </Button>
          </div>
        </S.ButtonContainer>
      </S.FilterForm>
    </div>
  );
};

export default FilterSearchSlipGenerated;
