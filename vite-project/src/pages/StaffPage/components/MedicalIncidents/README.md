# Health Event Management System

## Tổng quan

Hệ thống quản lý sự cố y tế đã được cải thiện với UI/UX hiện đại, responsive design và logic tối ưu. Hệ thống bao gồm các component chính sau:

## Components

### 1. HealthEventManager.jsx
Component chính để quản lý sự cố y tế với các tính năng:
- **Dashboard tổng quan** với thống kê real-time
- **Bộ lọc thông minh** theo nhiều tiêu chí
- **Table responsive** với pagination và sorting
- **Modal form** với validation đầy đủ
- **Detail drawer** hiển thị chi tiết sự cố
- **Tabs navigation** cho các chức năng khác nhau

### 2. HealthEventForm.jsx
Form component với validation nâng cao:
- **Validation rules** chi tiết cho từng field
- **Auto-suggestions** cho loại sự cố
- **Priority descriptions** với icons
- **Real-time validation** và error handling
- **Responsive layout** cho mobile

### 3. HealthEventDetail.jsx
Component hiển thị chi tiết sự cố:
- **Timeline view** cho lịch sử sự cố
- **Medication list** với thông tin chi tiết
- **Approval information** cho phụ huynh
- **Status indicators** với màu sắc phân biệt
- **Responsive design** cho mọi thiết bị

### 4. HealthEventApproval.jsx
Component phê duyệt sự cố cho phụ huynh:
- **Statistics dashboard** cho phê duyệt
- **Approval workflow** với form validation
- **Detail modal** với thông tin đầy đủ
- **Status tracking** real-time
- **Mobile-friendly** interface

### 5. HealthEventStatistics.jsx
Component thống kê nâng cao:
- **Interactive charts** với Progress components
- **Timeline view** cho sự cố gần đây
- **Quick actions** cho thao tác nhanh
- **Filter options** theo thời gian
- **Real-time updates**

## Tính năng chính

### 🎨 UI/UX Improvements
- **Modern design** với gradient backgrounds
- **Consistent styling** across all components
- **Responsive layout** cho mobile và tablet
- **Smooth animations** và transitions
- **Accessibility features** với ARIA labels

### 🔧 Technical Improvements
- **Performance optimization** với React hooks
- **Error handling** comprehensive
- **Loading states** với skeleton screens
- **Form validation** robust
- **API integration** seamless

### 📱 Mobile Responsive
- **Touch-friendly** buttons và controls
- **Optimized layout** cho small screens
- **Gesture support** cho mobile interactions
- **Progressive enhancement** approach

### 🚀 Performance Features
- **Lazy loading** cho large datasets
- **Caching strategies** cho API calls
- **Optimized re-renders** với React.memo
- **Debounced search** functionality

## API Integration

### Backend Endpoints
```javascript
// Health Event APIs
GET    /api/v1/healthEvents/get-all
POST   /api/v1/healthEvents/create/{studentId}/{nurseId}
PUT    /api/v1/healthEvents/update/{eventId}
DELETE /api/v1/healthEvents/delete/{eventId}
GET    /api/v1/healthEvents/search
GET    /api/v1/healthEvents/statistics

// Approval APIs
GET    /api/v1/healthEvents/parent/{parentId}/pending-approval
PUT    /api/v1/healthEvents/approve

// Follow-up APIs
GET    /api/v1/health-event-followups/event/{eventId}
POST   /api/v1/health-event-followups
```

### Data Models
```javascript
// HealthEvent Response
{
  eventId: Long,
  eventDate: String,
  eventType: String,
  description: String,
  solution: String,
  note: String,
  status: String,
  priority: HealthEventPriority,
  parentApprovalStatus: HealthEventApprovalStatus,
  requiresHomeCare: Boolean,
  studentID: UUID,
  studentName: String,
  nurseID: UUID,
  nurseName: String,
  medications: HealthEventMedicationResponse[],
  followUps: HealthEventFollowUpResponse[]
}
```

## Usage Examples

### Basic Implementation
```jsx
import HealthEventManager from './HealthEventManager';

const MedicalIncidents = () => {
  return <HealthEventManager />;
};
```

### Custom Form Usage
```jsx
import HealthEventForm from './HealthEventForm';

const [form] = Form.useForm();

<HealthEventForm
  visible={formVisible}
  onCancel={() => setFormVisible(false)}
  onSubmit={handleSubmit}
  selectedEvent={selectedEvent}
  students={students}
  studentsLoading={studentsLoading}
  form={form}
/>
```

### Detail View Usage
```jsx
import HealthEventDetail from './HealthEventDetail';

<HealthEventDetail
  visible={detailVisible}
  event={selectedEvent}
  onClose={() => setDetailVisible(false)}
/>
```

## Styling

### CSS Classes
```css
/* Main container */
.health-event-manager

/* Statistics cards */
.stat-card.total
.stat-card.pending
.stat-card.completed
.stat-card.critical

/* Priority tags */
.priority-tag.critical
.priority-tag.high
.priority-tag.medium
.priority-tag.low

/* Form sections */
.form-section
.detail-section

/* Responsive breakpoints */
@media (max-width: 768px)
@media (max-width: 576px)
```

## Configuration

### Environment Variables
```javascript
// API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=10000

// Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_ANALYTICS=false
```

### Theme Customization
```javascript
// Ant Design Theme
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    Button: {
      borderRadius: 6,
    },
  },
};
```

## Best Practices

### Code Organization
- **Component separation** theo chức năng
- **Custom hooks** cho logic tái sử dụng
- **Constants file** cho configuration
- **Type definitions** cho TypeScript support

### Performance Optimization
- **React.memo** cho components không thay đổi
- **useCallback** cho event handlers
- **useMemo** cho expensive calculations
- **Lazy loading** cho routes

### Error Handling
- **Try-catch blocks** cho async operations
- **User-friendly error messages**
- **Fallback UI** cho error states
- **Error boundaries** cho React components

### Testing Strategy
- **Unit tests** cho utility functions
- **Integration tests** cho API calls
- **Component tests** với React Testing Library
- **E2E tests** cho user workflows

## Troubleshooting

### Common Issues
1. **API Connection Errors**
   - Kiểm tra network connectivity
   - Verify API endpoint configuration
   - Check CORS settings

2. **Form Validation Issues**
   - Ensure all required fields are filled
   - Check validation rules configuration
   - Verify data types match expected format

3. **Performance Issues**
   - Implement pagination for large datasets
   - Use debouncing for search inputs
   - Optimize re-renders with React.memo

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'health-events:*');

// View component state
console.log('HealthEventManager State:', state);
```

## Future Enhancements

### Planned Features
- **Real-time notifications** với WebSocket
- **Advanced filtering** với multiple criteria
- **Export functionality** cho reports
- **Bulk operations** cho multiple events
- **Calendar view** cho event scheduling

### Technical Improvements
- **TypeScript migration** cho type safety
- **GraphQL integration** cho flexible queries
- **PWA support** cho offline functionality
- **Micro-frontend architecture** cho scalability

## Support

### Documentation
- **API Documentation**: `/api/docs`
- **Component Library**: Storybook integration
- **User Guide**: Interactive tutorials

### Contact
- **Technical Issues**: tech-support@example.com
- **Feature Requests**: product@example.com
- **Bug Reports**: bugs@example.com

---

**Version**: 2.0.0  
**Last Updated**: 2024-01-15  
**Maintainer**: Development Team 