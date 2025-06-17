import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderAfter from '../component/roots/HeaderAfter';
import AppFooter from '../component/roots/Footer';
import PageTransition from '../component/common/PageTransition';
import './Layout.css';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="layout">
      <HeaderAfter userName="John Doe" />
      <Content className="site-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default AuthLayout; 