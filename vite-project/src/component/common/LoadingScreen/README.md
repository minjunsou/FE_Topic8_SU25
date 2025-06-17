# LoadingScreen Component

## Mục đích
Component này hiển thị một màn hình loading đẹp mắt khi người dùng chuyển trang hoặc đợi dữ liệu được tải.

## Cách sử dụng
Component này được sử dụng bên trong `PageTransition` và không cần sử dụng trực tiếp trong hầu hết các trường hợp.

```jsx
import LoadingScreen from '../path/to/LoadingScreen';

// Sử dụng trực tiếp (nếu cần)
<LoadingScreen />
```

## Tùy chọn
Component này không có tùy chọn cấu hình.

## Phụ thuộc
- react-spinners: Để hiển thị hiệu ứng loading dạng pulse
- framer-motion: Để tạo hiệu ứng animation mượt mà

## Ví dụ cơ bản
```jsx
import React, { useState } from 'react';
import LoadingScreen from '../path/to/LoadingScreen';

const ExampleComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Giả lập kết thúc loading sau 2 giây
  setTimeout(() => {
    setIsLoading(false);
  }, 2000);
  
  return (
    <>
      {isLoading && <LoadingScreen />}
      {!isLoading && <div>Nội dung trang</div>}
    </>
  );
}; 