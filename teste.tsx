import { Input, InputProps } from '@cvccorp-components/chui-react-components';
import { Control, Controller } from '@cvccorp-components/chui-react-form';
import React, { ReactNode } from 'react';
import currency from 'currency.js';

export interface IControlledInput extends Omit<InputProps, 'defaultValue'> {
  name: string;
  control?: Control<any>;
  label: string;
  supportText?: ReactNode;
  isCurrency?: boolean;
}

const ControlledInput = ({
  name,
  control,
  label,
  supportText,
  isCurrency,
  ...props
}: IControlledInput) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let inputValue = e.target.value;
          
          if (isCurrency) {
            // Remove tudo exceto números e vírgula
            inputValue = inputValue.replace(/[^\d,]/g, '');
            // Substitui vírgula por ponto para o currency.js
            const numericValue = parseFloat(inputValue.replace(',', '.')) || 0;
            onChange(numericValue);
          } else {
            onChange(inputValue);
          }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          if (isCurrency && value) {
            // Formata o valor ao sair do campo
            const formattedValue = currency(value, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format();
            // Atualiza o valor formatado no campo (apenas visual)
            e.target.value = formattedValue;
          }
          onBlur();
        };

        const displayValue = isCurrency && value !== undefined && value !== ''
          ? currency(value, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format()
          : value || '';

        return (
          <Input
            {...props}
            label={label}
            onChange={handleChange}
            onBlur={handleBlur}
            value={displayValue}
            status={supportText ? 'danger' : undefined}
            supportText={
              <>
                {supportText}
                <span />
              </>
            }
          />
        );
      }}
    />
  );
};

export default ControlledInput;
