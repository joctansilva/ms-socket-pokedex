import { Input, InputProps } from '@cvccorp-components/chui-react-components';
import { Control, Controller } from '@cvccorp-components/chui-react-form';
import React, { ReactNode, useState, useEffect } from 'react';
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
  const [displayValue, setDisplayValue] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => {
        useEffect(() => {
          if (isCurrency && value !== undefined) {
            const formatted = currency(value, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format();
            setDisplayValue(formatted);
          }
        }, [value, isCurrency]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;
          
          if (isCurrency) {
            // Permite digitação livre
            setDisplayValue(inputValue);
          } else {
            onChange(inputValue);
          }
        };

        const handleBlur = () => {
          if (isCurrency) {
            // Converte para número
            const numericValue = currency(displayValue.replace(/[^\d,]/g, '')
              .divide(100) // Converte centavos para reais
              .value;
            
            onChange(numericValue);
            onBlur();
            
            // Formata para exibição
            const formatted = currency(numericValue, {
              symbol: 'R$ ',
              decimal: ',',
              separator: '.',
              precision: 2
            }).format();
            setDisplayValue(formatted);
          } else {
            onBlur();
          }
        };

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
