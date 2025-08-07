import React from 'react';
import * as S from './styles';
import { Landmark, MonitorDot, SearchIcon, Store } from 'lucide-react';
import { Button, Typography } from '@cvccorp-components/chui-react-components';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';

export type TNavBarItems = {
  label: string;
  path: string;
  pageGroup?: string;
  icon: JSX.Element;
  alternativeIcon: JSX.Element;
};

export interface IHomeLoaderData {
  name: string;
}

export interface IMainLoaderData extends IHomeLoaderData {
  hasNavBarItems: boolean;
  moduleType?: 'billet' | 'machine';
}

interface Props {
  navbarTitle: string;
}

const Navbar = ({ navbarTitle }: Props) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getLoaderData = () => {
    if (pathname.startsWith('/repasse-aluguel-maquininhas')) {
      return useRouteLoaderData('machines-module') as
        | IMainLoaderData
        | undefined;
    }
    if (
      pathname.startsWith('/cadastro-unidade-de-negocios') ||
      pathname.startsWith('/configuracoes-bancarias') ||
      pathname.startsWith('/cadastro-sistemas') ||
      pathname.startsWith('/consulta-boletos')
    )
      return undefined;
  };

  const loaderData = getLoaderData();

  const navBarItemsBillet: TNavBarItems[] = [
    {
      label: 'Unidade de Negócios',
      path: '/cadastro-unidade-de-negocios',
      pageGroup: 'cadastro-unidade-de-negocios',
      icon: <Store color="white" />,
      alternativeIcon: <Store color="#4d4d5e" />,
    },
    {
      label: 'Configurações Bancárias',
      path: '/configuracoes-bancarias/bancos',
      pageGroup: 'configuracoes-bancarias',
      icon: <Landmark color="white" />,
      alternativeIcon: <Landmark color="#4d4d5e" />,
    },
    {
      label: 'Cadastro de Sistemas',
      path: '/cadastro-sistemas',
      pageGroup: 'cadastro-sistemas',
      icon: <MonitorDot color="white" />,
      alternativeIcon: <MonitorDot color="#4d4d5e" />,
    },
    {
      label: 'Consulta de Boletos',
      path: '/consulta-boletos',
      pageGroup: 'consulta-boletos',
      icon: <SearchIcon color="white" />,
      alternativeIcon: <SearchIcon color="#4d4d5e" />,
    },
  ];
  const navBarItemsMachines: TNavBarItems[] = [
    {
      label: 'Maquininhas',
      path: '/cadastro-unidade-de-negocios',
      pageGroup: 'maquininhas',
      icon: <Store color="white" />,
      alternativeIcon: <Store color="#4d4d5e" />,
    },
    {
      label: 'Cobrança por Franquia',
      path: '/configuracoes-bancarias/bancos',
      pageGroup: 'cobranca-por-franquia',
      icon: <Landmark color="white" />,
      alternativeIcon: <Landmark color="#4d4d5e" />,
    },
  ];

  const getNavBarItems = () => {
    if (!loaderData) return [];
    switch (loaderData.moduleType) {
      case 'billet':
        return navBarItemsBillet;
      case 'machine':
        return navBarItemsMachines;
      default:
        return [];
    }
  };

  const navBarItems = getNavBarItems();

  return (
    <S.NavBarWrapper>
      <S.NavBarContainer>
        <>
          <S.TitleContainer>
            <Typography
              variant="headline"
              weight="bold"
              style={{
                fontSize: '32px',
              }}
            >
              {navbarTitle}
            </Typography>
          </S.TitleContainer>
          {loaderData?.hasNavBarItems && (
            <S.NavBarItemsContainer>
              {navBarItems.map(item => {
                const splittedPathName = pathname.split('/');
                const validation = item.pageGroup === splittedPathName[1];
                return (
                  <Button
                    key={item.label}
                    variant={validation ? 'filled' : 'text'}
                    color={validation ? 'secondary' : 'neutral'}
                    icon={validation ? item.icon : item.alternativeIcon}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </S.NavBarItemsContainer>
          )}
        </>
      </S.NavBarContainer>
    </S.NavBarWrapper>
  );
};

export default Navbar;

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
import MakeHomeSlips from '../factories/pages/makeHomeSlips';
import MakeHomeCardMachines from '../factories/pages/makeHomeCardMachines';
import MakeMachines from '../factories/pages/cardMachineFees/makeCardMachine';

const router = createBrowserRouter([
  {
    id: 'home',
    element: <Layout navbarTitle="Cockpit de Parametrização" />,
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
    id: 'billet-module',
    element: <Layout navbarTitle="Gestor de Boletos" />,
    loader: () => {
      return {
        name: 'billet-module',
        hasNavBarItems: true,
      };
    },
    children: [
      {
        path: '/gestor-boletos',
        element: <PublicRoute Component={<MakeHomeSlips />} />,
      },
      {
        path: '/cadastro-unidade-de-negocios',
        element: <PublicRoute Component={<MakeRegisterBusinessUnit />} />,
      },
      {
        path: '/configuracoes-bancarias',
        children: [
          {
            index: true,
            element: <Navigate to="/configuracoes-bancarias/bancos" replace />,
          },
          { path: 'bancos', element: <PublicRoute Component={<MakeBank />} /> },
          {
            path: 'bancos/parametros',
            element: <PublicRoute Component={<MakeBankParameter />} />,
          },
          {
            path: 'bancos/detalhes',
            element: <PublicRoute Component={<MakeBankDetails />} />,
          },
        ],
      },
      {
        path: '/cadastro-sistemas',
        element: <PublicRoute Component={<MakeSystem />} />,
      },
      {
        path: '/consulta-boletos',
        children: [
          {
            index: true,
            element: <Navigate to="/consulta-boletos/gerados" replace />,
          },
          {
            path: 'gerados',
            element: <PublicRoute Component={<MakeSearchSlipGenerated />} />,
          },
          {
            path: 'externos-cancelados',
            element: (
              <PublicRoute Component={<MakeSearchSlipExternalCanceled />} />
            ),
          },
        ],
      },
    ],
    errorElement: <Navigate to="/" />,
  },
  {
    id: 'machine-module',
    element: <Layout navbarTitle="Repasse Aluguel de Maquininhas" />,
    loader: () => ({ name: 'machine-module', hasNavBarItems: true }),
    children: [
      {
        path: '/repasse-aluguel-maquininhas',
        element: <PublicRoute Component={<MakeHomeCardMachines />} />,
      },
      {
        path: '/repasse-aluguel-maquininhas/maquininhas',
        element: <PublicRoute Component={<MakeMachines />} />,
      },
    ],
    errorElement: <Navigate to="/" />,
  },
]);

export default router;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import * as S from './styles';
import Header from '../Header';
import Navbar from '../Navbar';

interface Props {
  navbarTitle: string;
}

const Layout = ({ navbarTitle }: Props) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh' }}
    >
      <Header />
      <Navbar navbarTitle={navbarTitle} />
      <S.Container>
        <Outlet />
      </S.Container>
      <Footer />
    </div>
  );
};

export default Layout;

