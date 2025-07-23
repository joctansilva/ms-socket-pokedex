import Home from '@/presentation/pages/Home/home';
import React from 'react';

const MakeHome = () => {
  return <Home />;
};

export default MakeHome;


import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MakeHome from '../factories/pages/makeHome';
import Layout from '@/presentation/components/Layout';
import PublicRoute from '../proxies/publicRoute';
import MakeRegisterBusinessUnit from '../factories/pages/makeRegisterBusinessUnit';
import MakeBank from '../factories/pages/makeBank';
import MakeSystem from '../factories/pages/makeSystem';
import MakeBankDetails from '../factories/pages/makeBankDetails';
import MakeBankParameter from '../factories/pages/makeBankParameter';
import MakeSearchSlipGenerated from '../factories/pages/makeSearchSlipGenerated';
import MakeSearchSlipExternalCanceled from '../factories/pages/makeSearchSlipExternalCanceled';

const router = createBrowserRouter([
  {
    id: 'home',
    element: <Layout />,
    loader: () => {
      return {
        name: 'home',
      };
    },
    children: [
      {
        path: '/',
        element: <Navigate to="/home" replace />,
      },
      {
        path: '/home',
        element: <PublicRoute Component={<MakeHome />} />,
      },
    ],
    errorElement: <Navigate to="/" />,
  },
  {
    id: 'main',
    element: <Layout />,
    loader: () => {
      return {
        name: 'main',
        hasNavBarItems: true,
      };
    },
    children: [
      {
        path: '/cadastro-unidade-de-negocios',
        element: <PublicRoute Component={<MakeRegisterBusinessUnit />} />,
      },
      {
        path: '/configuracoes-bancarias',
        element: <Navigate to="/configuracoes-bancarias/bancos" replace />,
      },
      {
        path: '/configuracoes-bancarias/bancos',
        element: <PublicRoute Component={<MakeBank />} />,
      },
      {
        path: '/configuracoes-bancarias/bancos/parametros',
        element: <PublicRoute Component={<MakeBankParameter />} />,
      },
      {
        path: '/cadastro-sistemas',
        element: <PublicRoute Component={<MakeSystem />} />,
      },
      {
        path: '/configuracoes-bancarias/bancos/detalhes',
        element: <PublicRoute Component={<MakeBankDetails />} />,
      },
      {
        path: '/consulta-boletos',
        element: <Navigate to="/consulta-boletos/gerados" replace />,
      },
      {
        path: '/consulta-boletos/gerados',
        element: <PublicRoute Component={<MakeSearchSlipGenerated />} />,
      },
      {
        path: '/consulta-boletos/externos-cancelados',
        element: <PublicRoute Component={<MakeSearchSlipExternalCanceled />} />,
      },
    ],
  },
]);

export default router;


import React from 'react';
import * as S from './styles';
import { Typography } from '@cvccorp-components/chui-react-components';
import { TNavBarItems } from '@/presentation/components/Navbar';
import {
  CreditCard,
  FileText,
  Landmark,
  MonitorDot,
  SearchIcon,
  Store,
} from 'lucide-react';
import QuickAccess from '@/presentation/components/QuickAccess';

const Home = () => {
  let quickAcessItems: Omit<TNavBarItems, 'alternativeIcon'>[] = [
    {
      label: 'Gestor de Cobranças',
      path: '/gestor-cobrancas',
      icon: <FileText size={40} color="#fff" />,
    },
    {
      label: 'Repasse Aluguel Maquininhas',
      path: '/aluguel-maquininhas',
      icon: <CreditCard size={40} color="#fff" />,
    },
  ];

  let quickAcessSlipItems: Omit<TNavBarItems, 'alternativeIcon'>[] = [
    {
      label: 'Unidade de Negócios',
      path: '/cadastro-unidade-de-negocios',
      icon: <Store size={40} color="#fff" />,
    },
    {
      label: 'Configurações Bancárias',
      path: '/configuracoes-bancarias/bancos',
      icon: <Landmark size={40} color="#fff" />,
    },
    {
      label: 'Cadastro de Sistemas',
      path: '/cadastro-sistemas',
      icon: <MonitorDot size={40} color="#fff" />,
    },
    {
      label: 'Consulta de Boletos',
      path: '/consulta-boletos',
      icon: <SearchIcon size={40} color="#fff" />,
    },
  ];

  let quickAcessCardMachineItems: Omit<TNavBarItems, 'alternativeIcon'>[] = [
    {
      label: 'Cadastro de Maquininhas',
      path: '/cadastro-maquininhas',
      icon: <Store size={40} color="#fff" />,
    },
    {
      label: 'Consulta de Cobranças Franquias',
      path: '/consulta-cobrancas-franquias',
      icon: <Landmark size={40} color="#fff" />,
    },
  ];

  return (
    <S.Wrapper>
      <S.TitleContainer>
        <Typography
          variant="headline"
          scale={6}
          weight="bold"
          color="brand.secondary.700"
        >
          Acesso Rápido
        </Typography>
      </S.TitleContainer>
      <S.CardContainer>
        {quickAcessItems.map(item => {
          return (
            <QuickAccess
              key={item.label}
              label={item.label}
              path={item.path}
              icon={item.icon}
            />
          );
        })}
      </S.CardContainer>
    </S.Wrapper>
  );
};

export default Home;

