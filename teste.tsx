import { Input, InputProps } from '@cvccorp-components/chui-react-components'; import { Control, Controller } from '@cvccorp-components/chui-react-form'; import React, { ReactNode } from 'react';

export interface IControlledInput extends Omit<InputProps, 'defaultValue'> { name: string; control?: Control<any>; label: string; supportText?: ReactNode; }

const ControlledInput = ({ name, control, label, supportText, ...props }: IControlledInput) => { return ( <Controller name={name} control={control} render={({ field: { onChange, onBlur, value } }) => { return ( <Input {...props} label={label} onChange={onChange} onBlur={onBlur} value={value || ''} status={supportText ? 'danger' : undefined} supportText={ <> {supportText} <span /> </> } /> ); }} /> ); };

export default ControlledInput;

import { Input, InputProps } from '@cvccorp-components/chui-react-components';
import { Control, Controller } from '@cvccorp-components/chui-react-form';
import React, { ReactNode } from 'react';
import currency from 'currency.js';

export interface IControlledInput extends Omit<InputProps, 'defaultValue'> {
  name: string;
  control?: Control<any>;
  label: string;
  supportText?: ReactNode;
  isCurrency?: boolean; // New prop for currency formatting
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
          const inputValue = e.target.value;
          if (isCurrency) {
            const rawValue = currency(inputValue.replace(/[^\d,-]/g, ''), {
              decimal: ',',
              separator: '.',
              symbol: '',
              fromCents: true,
            }).value;
            onChange(rawValue);
          } else {
            onChange(inputValue);
          }
        };

        const displayValue = isCurrency
          ? currency(value, {
              symbol: 'R$ ',
              decimal: ',',
              fromCents: true,
            }).format()
          : value;

        return (
          <Input
            {...props}
            label={label}
            onChange={handleChange}
            onBlur={onBlur}
            value={displayValue || ''}
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

          <ControlledInput
            control={control}
            name="vl_rental_fee"
            label="Valor Aluguel Mensal"
            disabled={false}
            supportText={errors.vl_rental_fee && errors.vl_rental_fee.message}
            isCurrency
          />
