import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as S from '../styles';
import ControlledInput from '@/presentation/components/ControlledInput';
import { Button } from '@cvccorp-components/chui-react-components';
import { Search, Trash } from 'lucide-react';
import { useForm } from '@cvccorp-components/chui-react-form';
import ControlledSelect from '@/presentation/components/ControlledSelect';
import { ICardMachineAcquirer } from '@/domain/models';
import { makeRemoteGetAllCardMachineAcquirer } from '@/main/factories/usecases/cardMachineFees/cardMachineAcquirer';
import { TCardMachineFilterSchema } from '@/validation';

interface IFilterBusinessUnit {
  loading: boolean;
}

const FilterMachines = ({ loading }: IFilterBusinessUnit) => {
  const [cardMachineAcquirer, setCardMachineAcquirer] = useState<
    ICardMachineAcquirer[]
  >([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const sqCardMachineBrand = searchParams.get('sq_card_machine_brand');
  const dsModel = searchParams.get('ds_model');
  const filtersParams = sqCardMachineBrand || dsModel;

  const { handleSubmit, control } = useForm<TCardMachineFilterSchema>({
    values: {
      ds_model: dsModel ?? '',
      sq_card_machine_brand: sqCardMachineBrand ?? '',
    },
  });

  const onSubmit = ({
    sq_card_machine_brand,
    ds_model,
  }: TCardMachineFilterSchema) => {
    setSearchParams(state => {
      if (sq_card_machine_brand) {
        state.set('sq_card_machine_brand', sq_card_machine_brand);
      } else {
        state.delete('sq_card_machine_brand');
      }
      return state;
    });
    setSearchParams(state => {
      if (ds_model) {
        state.set('ds_model', ds_model);
      } else {
        state.delete('ds_model');
      }
      return state;
    });
  };

  const onClear = () => {
    setSearchParams(state => {
      state.delete('sq_card_machine_brand');
      state.delete('ds_model');
      return state;
    });
  };

  useEffect(() => {
    makeRemoteGetAllCardMachineAcquirer()
      .get('')
      .then((data: ICardMachineAcquirer[]) => {
        setCardMachineAcquirer(data);
      });
  }, []);

  const options = cardMachineAcquirer.map((acq: ICardMachineAcquirer) => ({
    label: acq.ds_brand,
    value: acq.id,
  }));

  return (
    <S.FilterForm onSubmit={handleSubmit(onSubmit)}>
      <ControlledSelect
        control={control}
        name="sq_card_machine_brand"
        label="Adquirente"
        disabled={loading}
        options={options}
        placeholder="Selecione um adquirente"
        value={undefined}
      />
      <ControlledInput
        control={control}
        disabled={loading}
        name="ds_model"
        label="Modelo"
      />
      <S.ButtonContainer>
        <div>
          <Button
            type="submit"
            variant="filled"
            loading={loading}
            color="secondary"
            icon={<Search color="#fff" />}
          >
            Filtrar
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            color="secondary"
            loading={loading}
            icon={<Trash color={!filtersParams ? '#bdbdd0' : '#0a00b4'} />}
            onClick={() => onClear()}
            disabled={!filtersParams}
          >
            Limpar
          </Button>
        </div>
      </S.ButtonContainer>
    </S.FilterForm>
  );
};

export default FilterMachines;

import {
  BadgeStatus,
  Button,
  Table,
  TableProps,
  Toast,
  Typography,
} from '@cvccorp-components/chui-react-components';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as S from '../styles';
import FilterMachines from './filterMachines';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { IRegisterMachines } from './registerMachines';
import { ICardMachine } from '@/domain/models';
import TableMenu from '@/presentation/components/TableMenu';
import { formateCurrency } from '@/utils/functions/formateCurrency';
import { useNewModal } from '@/presentation/hooks/useNewModal';
import FormMachines from './formMachines';

interface ITableCardMachines extends IRegisterMachines {}

interface ITableMachinesRows {
  id?: number;
  sq_card_machine_brand: number;
  ds_model: string;
  vl_rental_fee: string;
  st_active: JSX.Element;
  dt_insert?: string;
  action: JSX.Element;
  nm_user: string;
}

const columns: TableProps<ITableMachinesRows>['columns'] = [
  {
    dataIndex: 'sq_card_machine_brand',
    title: 'Marca',
  },
  {
    dataIndex: 'ds_model',
    title: 'Modelo',
  },
  {
    dataIndex: 'vl_rental_fee',
    title: 'Valor Aluguel Mensal',
  },
  {
    dataIndex: 'st_active',
    title: 'Status',
  },
  {
    dataIndex: 'nm_user',
    title: 'Atualizado por',
  },
  {
    dataIndex: 'action',
    title: '',
  },
];

const TableMachines = ({
  getAll,
  getUnique,
  create,
  update,
  remove,
}: ITableCardMachines) => {
  const [editId, setEditId] = useState<number | undefined>(undefined);

  const [searchParams, setSearchParams] = useSearchParams();
  const sqCardMachineBrand = searchParams.get('sq_card_machine_brand');
  const dsModel = searchParams.get('ds_model');
  const sqCardMachineBrandParams = sqCardMachineBrand
    ? `&sq_card_machine_brand=${sqCardMachineBrand}`
    : '';
  const dsModelParams = dsModel ? `&ds_model=${dsModel}` : '';

  const createModal = useNewModal();
  const removeModal = useNewModal();

  const queryClient = useQueryClient();

  const { data: tableData, isFetching: tableLoading } = useQuery({
    queryKey: ['tableMachines', sqCardMachineBrand, dsModel],
    queryFn: () => getAll.get(`${sqCardMachineBrandParams}${dsModelParams}`),
    placeholderData: keepPreviousData,
  });

  const { mutate: handleDelete, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => remove.delete(id),
    onSuccess: () => {
      removeModal.closeModal();
      queryClient.invalidateQueries({ queryKey: ['tableMachines'] });
      Toast.success({
        title: 'Modelo de maquininha removido com sucesso.',
      });
    },
    onError: err => {
      Toast.danger({
        title: 'Erro ao remover o modelo de maquininha.',
        description: `${err}`,
      });
    },
  });

  let rows: ITableMachinesRows[] = [];

  if (Array.isArray(tableData)) {
    rows = tableData.map((data: ICardMachine) => {
      const stActive = (
        <BadgeStatus
          color={
            data.st_active === 'A'
              ? 'success'
              : data.st_active === 'I'
                ? 'danger'
                : 'warning'
          }
        >
          {data.st_active === 'A'
            ? 'Ativa'
            : data.st_active === 'I'
              ? 'Inativa'
              : 'Devolvida'}
        </BadgeStatus>
      );

      const handleOpenEditModal = () => {
        setEditId(data.id);
        createModal.openModal();
      };

      const handleOpenRemoveModal = () => {
        setEditId(data.id);
        removeModal.openModal();
      };

      const items = [
        {
          icon: <Pencil />,
          tooltip: 'Editar modelo de maquininha',
          onClick: handleOpenEditModal,
          visible: true,
        },
        {
          icon: <Trash2 color="#ff3746" />,
          tooltip: 'Remover modelo de maquininha',
          onClick: handleOpenRemoveModal,
          visible: true,
        },
      ];
      const action = <TableMenu items={items} />;

      return {
        ...data,
        action: action,
        vl_rental_fee: formateCurrency(data.vl_rental_fee),
        st_active: stActive,
      };
    });
  }

  const handleOpenCreateModal = () => {
    createModal.openModal();
    setEditId(undefined);
  };

  const handleDeleteMachine = () => {
    if (editId) {
      handleDelete(editId);
    }
  };

  return (
    <>
      <S.CreateButtonContainer>
        <Button
          variant="outline"
          color="secondary"
          icon={<PlusCircle color="#0a00b4" />}
          onClick={handleOpenCreateModal}
          loading={tableLoading}
        >
          Cadastrar nova maquininha
        </Button>
      </S.CreateButtonContainer>
      <Typography variant="subtitle" scale={2} weight="regular">
        Filtros
      </Typography>
      <S.FilterContainer>
        <FilterMachines loading={tableLoading} />
      </S.FilterContainer>
      <Table
        rows={tableLoading ? [] : rows}
        loading={tableLoading}
        columns={columns}
        striped
      />

      <createModal.Modal
        modalTitle={editId ? 'Editar maquininha' : 'Cadastrar maquininha'}
        height="450px"
        width="800px"
        footerContent={
          <>
            <Button
              variant="text"
              color="secondary"
              onClick={createModal.closeModal}
            >
              Cancelar
            </Button>
            <Button type="submit" form="form-machine">
              Confirmar
            </Button>
          </>
        }
        content={
          <FormMachines
            getUnique={getUnique}
            create={create}
            update={update}
            editId={editId}
            handleCloseModal={createModal.closeModal}
            tableData={tableData}
          />
        }
      />
      <removeModal.Modal
        id="remove-modal"
        modalTitle="Remover modelo de maquininha"
        width="500px"
        height="244px"
        footerContent={
          <>
            <Button
              onClick={removeModal.closeModal}
              variant="text"
              color="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDeleteMachine()}
              variant="filled"
              color="danger"
            >
              Remover
            </Button>
          </>
        }
        content={
          <>
            <div>
              Deseja realmente remover o modelo de maquininha? Essa ação não
              pode ser desfeita.
            </div>
          </>
        }
      />
    </>
  );
};

export default TableMachines;
