# PageTransition Component

## Mục đích
Component này quản lý hiệu ứng chuyển trang mượt mà với màn hình loading và thanh tiến trình, tạo trải nghiệm người dùng tốt hơn khi điều hướng giữa các trang.

## Cách sử dụng
Bọc component này xung quanh `<Outlet />` trong các layout để áp dụng hiệu ứng chuyển trang.

```jsx
import PageTransition from '../path/to/PageTransition';

// Trong layout component
<Layout>
  <Header />
  <Content>
    <PageTransition>
      <Outlet />
    </PageTransition>
  </Content>
  <Footer />
</Layout>
```

## Tùy chọn
Component này không có tùy chọn cấu hình trực tiếp, nhưng bạn có thể điều chỉnh thời gian loading trong mã nguồn.

## Phụ thuộc
- framer-motion: Để tạo hiệu ứng animation mượt mà
- nprogress: Để hiển thị thanh tiến trình ở đầu trang
- LoadingScreen: Component con hiển thị màn hình loading

## Cách hoạt động
1. Khi người dùng điều hướng đến một trang mới, PageTransition sẽ:
   - Hiển thị màn hình loading
   - Hiển thị thanh tiến trình ở đầu trang
   - Sau khi tải xong, ẩn màn hình loading và hiển thị nội dung mới với hiệu ứng fade-in

## Ví dụ cơ bản
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageTransition from '../path/to/PageTransition';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <HomePage />
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition>
            <AboutPage />
          </PageTransition>
        } />
      </Routes>
    </BrowserRouter>
  );
}; 