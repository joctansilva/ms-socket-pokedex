Estou com um problema aqui

import React, { useEffect, useState } from 'react';
import * as S from '../styles';
import { Toast, Typography } from '@cvccorp-components/chui-react-components';
import ControlledSelect from '@/presentation/components/ControlledSelect';
import ControlledInput from '@/presentation/components/ControlledInput';
import { useForm } from '@cvccorp-components/chui-react-form';
import { cardMachineSchema, TCardMachineSchema } from '@/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ICreateCardMachine,
  IGetUniqueCardMachine,
  IUpdateCardMachine,
} from '@/domain/usecases/cardMachineFees/cardMachine';
import { ICardMachine, ICardMachineAcquirer } from '@/domain/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeRemoteGetAllCardMachineAcquirer } from '@/main/factories/usecases/cardMachineFees/cardMachineAcquirer';
import ControlledInputDate from '@/presentation/components/ControlledInputDate';
import { useCookie } from '@/presentation/hooks';

interface IFormCardMachine {
  getUnique: IGetUniqueCardMachine;
  create: ICreateCardMachine;
  update: IUpdateCardMachine;
  editId?: number;
  handleCloseModal: () => void;
  tableData?: ICardMachine[];
}

const FormMachines = ({
  getUnique,
  create,
  update,
  editId,
  handleCloseModal,
  tableData,
}: IFormCardMachine) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TCardMachineSchema>({
    resolver: zodResolver(cardMachineSchema),
  });

  const cookie = useCookie();
  const queryClient = useQueryClient();

  const { data: formData, isFetching: formLoading } = useQuery({
    queryKey: [`formMachine-${editId}`, tableData],
    queryFn: () => getUnique.get(Number(editId)),
    enabled: editId !== undefined,
  });

  const { mutate: handleCreate, isPending: createLoading } = useMutation({
    mutationFn: (data: ICardMachine) => create.create(data),
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({
        queryKey: ['tableBankParameter'],
      });
      Toast.success({
        title: 'Modelo de maquininha cadastrado com sucesso.',
      });
    },
    onError: err => {
      Toast.danger({
        title: 'Erro ao cadastrar o modelo de maquininha.',
        description: `${err}`,
      });
    },
  });

  const { mutate: handleUpdate, isPending: updateLoading } = useMutation({
    mutationFn: (data: ICardMachine) => update.update(data),
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({
        queryKey: ['tableBankParameter'],
      });
      Toast.success({
        title: 'Modelo de maquininha atualizado com sucesso.',
      });
    },
    onError: err => {
      Toast.danger({
        title: 'Erro ao atualizar o modelo de maquininha.',
        description: `${err}`,
      });
    },
  });

  const onSubmit = (data: TCardMachineSchema) => {
    const mutateData = {
      ...data,
      id: editId,
      nm_user: cookie?.sub ?? 'CVC Brasil',
      st_active: data.st_active as 'A' | 'I' | 'R',
    };
    if (editId) {
      handleUpdate(mutateData);
    } else {
      handleCreate(mutateData);
    }
  };

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([name, value]: any) =>
        setValue(name, value),
      );
    }
  }, [formData]);

  const [cardMachineAcquirer, setCardMachineAcquirer] = useState<
    ICardMachineAcquirer[]
  >([]);

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
    <>
      <Typography style={{ marginBottom: '24px' }} variant="subtitle">
        Dados da maquininha
      </Typography>{' '}
      <div />
      <form id="form-machine" onSubmit={handleSubmit(onSubmit)}>
        <S.FormQuad>
          <ControlledSelect
            control={control}
            name="sq_card_machine_brand"
            label="Adquirente"
            disabled={false}
            options={options}
            placeholder="Selecione um adquirente"
            value={undefined}
            supportText={
              errors.sq_card_machine_brand &&
              errors.sq_card_machine_brand.message
            }
          />
          <ControlledInput
            control={control}
            name="ds_model"
            label="Modelo"
            disabled={false}
            supportText={errors.ds_model && errors.ds_model.message}
          />
          <ControlledInput
            control={control}
            name="vl_rental_fee"
            label="Valor Aluguel Mensal"
            disabled={false}
            supportText={errors.vl_rental_fee && errors.vl_rental_fee.message}
          />
          <ControlledInput
            control={control}
            name="ds_serial_number"
            label="Número de Série"
            disabled={false}
            supportText={
              errors.ds_serial_number && errors.ds_serial_number.message
            }
          />
        </S.FormQuad>
        <S.FormTriple>
          <ControlledInputDate
            control={control}
            name="dt_billing_start"
            label="Inicio do Contrato"
            supportText={
              errors.dt_billing_start && errors.dt_billing_start.message
            }
          />
          <ControlledInputDate
            control={control}
            name="dt_billing_end"
            label="Fim do Contrato"
            supportText={errors.dt_billing_end && errors.dt_billing_end.message}
          />
          <ControlledSelect
            control={control}
            name="st_active"
            label="Status"
            disabled={false}
            options={[
              { label: 'Ativo', value: 'A' },
              { label: 'Inativo', value: 'I' },
              { label: 'Devolvido', value: 'R' },
            ]}
            supportText={errors.st_active && errors.st_active.message}
          />
        </S.FormTriple>
      </form>
    </>
  );
};

export default FormMachines;

Quando eu crio um novo registro, eu pego meu campo de date, e converto ele para esse formato

  dt_billing_start: z.union([
    z.string({ required_error: 'Esse campo não pode ficar vazio' }),
    z.date().transform(date => format(date, 'dd/MM/yyyy')),
  ]),
  dt_billing_end: z.union([
    z.string({ required_error: 'Esse campo não pode ficar vazio' }),
    z.date().transform(date => format(date, 'dd/MM/yyyy')),
  ]),

até ai tudo certo e funcionando, eu consigo fazer meu POST, tranquilamente

Quando eu vou editar, e salvo a ediçao, se eu nao mecho no campo de data edito somente outro valor

meu output na chamada pUT vai dessaa forma 

dt_billing_end : "2024-05-01"
dt_billing_start : "2024-05-01"

totalmente diferente do formato aceito no backend, mas se eu edito o campo data, ela volta ao normal 01/05/2024
