import { Input, InputProps } from '@cvccorp-components/chui-react-components';
import { Control, Controller } from '@cvccorp-components/chui-react-form';
import React, { ReactNode, useState } from 'react';
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
  const [rawValue, setRawValue] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;
          
          if (isCurrency) {
            // Permite digitação livre enquanto edita
            setRawValue(inputValue);
          } else {
            onChange(inputValue);
          }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          if (isCurrency) {
            // Processa o valor apenas no blur
            const numericValue = currency(rawValue.replace(/[^\d,]/g, '').replace(',', '.'), {
              decimal: ',',
              separator: '.',
              symbol: '',
              fromCents: false
            }).value;
            
            onChange(numericValue);
            onBlur();
            
            // Formata para exibição
            e.target.value = currency(numericValue, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format();
          } else {
            onBlur();
          }
        };

        const displayValue = isCurrency 
          ? rawValue || (value ? currency(value, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format() : '')
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
