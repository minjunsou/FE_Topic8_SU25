import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderBefore from '../component/roots/HeaderBefore';
import AppFooter from '../component/roots/Footer';
import PageTransition from '../component/common/PageTransition';
import './Layout.css';

const { Content } = Layout;

const GuestLayout = () => {
  return (
    <Layout className="layout">
      <HeaderBefore />
      <Content className="site-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default GuestLayout; 