import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, message, Skeleton, Select, Empty, Tabs, Avatar, Spin, Tag, List, Modal, Form, InputNumber, DatePicker, Radio, Input } from 'antd';
import { UserOutlined, TeamOutlined, MedicineBoxOutlined, AlertOutlined, BugOutlined, MedicineBoxTwoTone, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { parentApi } from '../../api';
import axios from 'axios';
import './UserProfile.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ChildrenInfo = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [syndromes, setSyndromes] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loadingReference, setLoadingReference] = useState(false);
  
  // State cho form thêm bệnh lý
  const [diseaseModalVisible, setDiseaseModalVisible] = useState(false);
  const [addingDisease, setAddingDisease] = useState(false);
  const [diseaseForm] = Form.useForm();
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);
  
  // State cho form thêm hội chứng
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [addingCondition, setAddingCondition] = useState(false);
  const [conditionForm] = Form.useForm();
  const [selectedConditionId, setSelectedConditionId] = useState(null);
  
  // State cho form thêm dị ứng
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [allergyForm] = Form.useForm();
  const [selectedAllergenId, setSelectedAllergenId] = useState(null);
  
  // State cho form chỉnh sửa dị ứng
  const [editAllergyModalVisible, setEditAllergyModalVisible] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(false);
  const [editAllergyForm] = Form.useForm();
  const [currentAllergyId, setCurrentAllergyId] = useState(null);
  
  // State cho form chỉnh sửa bệnh lý
  const [editDiseaseModalVisible, setEditDiseaseModalVisible] = useState(false);
  const [editingDisease, setEditingDisease] = useState(false);
  const [editDiseaseForm] = Form.useForm();
  const [currentDiseaseId, setCurrentDiseaseId] = useState(null);
  
  // State cho form chỉnh sửa hội chứng
  const [editConditionModalVisible, setEditConditionModalVisible] = useState(false);
  const [editingCondition, setEditingCondition] = useState(false);
  const [editConditionForm] = Form.useForm();
  const [currentConditionId, setCurrentConditionId] = useState(null);

  // Lấy dữ liệu tham chiếu (dị ứng, hội chứng, bệnh)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoadingReference(true);
        
        // Lấy danh sách dị ứng
        const allergensData = await parentApi.getAllergens();
        setAllergens(allergensData);
        console.log('Danh sách dị ứng:', allergensData);
        
        // Lấy danh sách hội chứng
        const syndromesData = await parentApi.getSyndromes();
        setSyndromes(syndromesData);
        console.log('Danh sách hội chứng:', syndromesData);
        
        // Lấy danh sách bệnh
        const diseasesData = await parentApi.getDiseases();
        setDiseases(diseasesData);
        console.log('Danh sách bệnh:', diseasesData);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tham chiếu:', error);
      } finally {
        setLoadingReference(false);
      }
    };
    
    fetchReferenceData();
  }, []);

  // Lấy danh sách con từ API
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        
        // Lấy accountId từ localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          message.error('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }
        
        const parsedUserInfo = JSON.parse(storedUserInfo);
        const userAccountId = parsedUserInfo.accountId;
        
        if (!userAccountId) {
          message.error('Không tìm thấy ID người dùng');
          setLoading(false);
          return;
        }
        
        console.log('Đang lấy danh sách con cho phụ huynh ID:', userAccountId);
        
        // Gọi API để lấy danh sách con
        const childrenData = await parentApi.getParentChildren(userAccountId);
        console.log('Danh sách con từ API:', childrenData);
        
        if (!childrenData || childrenData.length === 0) {
          console.log('Không có dữ liệu con');
          setChildren([]);
          setLoading(false);
          return;
        }
        
        // Định dạng lại dữ liệu con
        const formattedChildren = childrenData.map(child => ({
          id: child.childId || child.accountId || child.id,
          name: child.fullName || child.name,
          age: calculateAge(child.dob),
          grade: child.classId || 'N/A',
          class: child.className || child.classId || 'N/A',
          healthStatus: child.healthStatus || 'Chưa cập nhật',
          avatar: null,
          birthdate: formatDate(child.dob) || 'Chưa cập nhật',
          dob: child.dob || ''
        }));
        
        console.log('Dữ liệu con đã định dạng:', formattedChildren);
        setChildren(formattedChildren);
        
        // Chọn học sinh đầu tiên nếu có
        if (formattedChildren.length > 0) {
          const firstChild = formattedChildren[0];
          setSelectedChild(firstChild);
          
          // Lấy thông tin sức khỏe của học sinh đầu tiên
          fetchMedicalProfile(firstChild.id);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu con:', error);
        message.error('Không thể tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  // Hàm lấy thông tin sức khỏe của học sinh
  const fetchMedicalProfile = async (childId) => {
    if (!childId) {
      console.warn('Không có childId để lấy thông tin sức khỏe');
      return;
    }
    
    try {
      setLoadingMedical(true);
      console.log(`Đang gọi API để lấy thông tin sức khỏe của học sinh ID: ${childId}`);
      
      // Gọi API lấy thông tin sức khỏe
      const medicalData = await parentApi.getMedicalProfile(childId);
      console.log('Thông tin sức khỏe từ API:', medicalData);
      
      if (!medicalData) {
        console.log('Không có dữ liệu sức khỏe');
        setMedicalProfile(null);
        return;
      }
      
      setMedicalProfile(medicalData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sức khỏe:', error);
      message.error('Không thể tải thông tin sức khỏe');
      setMedicalProfile(null);
    } finally {
      setLoadingMedical(false);
    }
  };

  // Hàm mở modal thêm bệnh lý
  const showAddDiseaseModal = () => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }
    
    diseaseForm.resetFields();
    setSelectedDiseaseId(null);
    setDiseaseModalVisible(true);
  };

  // Hàm mở modal thêm hội chứng
  const showAddConditionModal = () => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }
    
    conditionForm.resetFields();
    setSelectedConditionId(null);
    setConditionModalVisible(true);
  };

  // Hàm mở modal thêm dị ứng
  const showAddAllergyModal = () => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }
    
    allergyForm.resetFields();
    setSelectedAllergenId(null);
    setAllergyModalVisible(true);
  };

  // Hàm mở modal chỉnh sửa dị ứng
  const showEditAllergyModal = (allergy) => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }
    
    console.log('Dị ứng cần chỉnh sửa:', allergy);
    console.log('ID dị ứng (studentAllergyId):', allergy.studentAllergyId);
    
    setCurrentAllergyId(allergy.studentAllergyId);
    
    // Thiết lập giá trị ban đầu cho form
    editAllergyForm.setFieldsValue({
      reaction: allergy.reaction || '',
      severity: allergy.severity || 1,
      lifeThreatening: allergy.lifeThreatening === true
    });
    
    setEditAllergyModalVisible(true);
  };

  // Hàm mở modal chỉnh sửa bệnh lý
  const showEditDiseaseModal = (disease) => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }
    
    console.log('Bệnh lý cần chỉnh sửa:', disease);
    
    // Kiểm tra tất cả các trường có thể chứa ID
    const diseaseId = disease.studentDiseaseId || disease.id;
    console.log('ID bệnh lý được tìm thấy:', diseaseId);
    
    // Đảm bảo ID không null
    if (!diseaseId) {
      message.error('Không tìm thấy ID của bệnh lý');
      return;
    }
    
    setCurrentDiseaseId(diseaseId);
    
    // Thiết lập giá trị ban đầu cho form
    editDiseaseForm.setFieldsValue({
      severity: disease.severity || 1
    });
    
    setEditDiseaseModalVisible(true);
  };

  // Hàm mở modal chỉnh sửa hội chứng
  const showEditConditionModal = (condition) => {
    if (!selectedChild) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }

    console.log('Hội chứng cần chỉnh sửa:', condition);
    
    // Kiểm tra tất cả các trường có thể chứa ID
    const conditionId = condition.studentConditionId || condition.id;
    console.log('ID hội chứng được tìm thấy:', conditionId);

    // Đảm bảo ID không null
    if (!conditionId) {
      message.error('Không tìm thấy ID của hội chứng');
      return;
    }

    setCurrentConditionId(conditionId);

    // Thiết lập giá trị ban đầu cho form
    editConditionForm.setFieldsValue({
      note: condition.note || ''
    });

    setEditConditionModalVisible(true);
  };

  // Hàm xử lý khi người dùng chọn bệnh lý
  const handleDiseaseChange = (value) => {
    setSelectedDiseaseId(value);
  };

  // Hàm xử lý khi người dùng chọn hội chứng
  const handleConditionChange = (value) => {
    setSelectedConditionId(value);
  };

  // Hàm xử lý khi người dùng chọn dị ứng
  const handleAllergenChange = (value) => {
    setSelectedAllergenId(value);
  };

  // Hàm xử lý khi người dùng gửi form thêm bệnh lý
  const handleAddDisease = async (values) => {
    if (!selectedChild || !selectedDiseaseId) {
      message.warning('Vui lòng chọn học sinh và bệnh lý');
      return;
    }
    
    try {
      setAddingDisease(true);
      
      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        studentId: selectedChild.id,
        diseaseId: selectedDiseaseId,
        sinceDate: values.sinceDate.format('DD/MM/YYYY'),
        severity: values.severity
      };
      
      console.log('Dữ liệu gửi đi:', requestData);
      
      // Gọi API thêm bệnh lý
      const response = await axios.post(
        'http://localhost:8080/api/medicalProfiles/add-disease-to-profile',
        requestData
      );
      
      console.log('Kết quả thêm bệnh lý:', response.data);
      
      message.success('Thêm bệnh lý thành công');
      setDiseaseModalVisible(false);
      
      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi thêm bệnh lý:', error);
      
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message || 'Không thể thêm bệnh lý'}`);
      } else {
        message.error('Không thể thêm bệnh lý. Vui lòng thử lại sau!');
      }
    } finally {
      setAddingDisease(false);
    }
  };

  // Hàm xử lý khi người dùng gửi form thêm hội chứng
  const handleAddCondition = async (values) => {
    if (!selectedChild || !selectedConditionId) {
      message.warning('Vui lòng chọn học sinh và hội chứng');
      return;
    }
    
    try {
      setAddingCondition(true);
      
      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        studentId: selectedChild.id,
        conditionId: selectedConditionId,
        note: values.note || ''
      };
      
      console.log('Dữ liệu gửi đi:', requestData);
      
      // Gọi API thêm hội chứng
      const response = await axios.post(
        'http://localhost:8080/api/medicalProfiles/add-condition-to-profile',
        requestData
      );
      
      console.log('Kết quả thêm hội chứng:', response.data);
      
      message.success('Thêm hội chứng thành công');
      setConditionModalVisible(false);
      
      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi thêm hội chứng:', error);
      
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message || 'Không thể thêm hội chứng'}`);
      } else {
        message.error('Không thể thêm hội chứng. Vui lòng thử lại sau!');
      }
    } finally {
      setAddingCondition(false);
    }
  };

  // Hàm xử lý khi người dùng gửi form thêm dị ứng
  const handleAddAllergy = async (values) => {
    if (!selectedChild || !selectedAllergenId) {
      message.warning('Vui lòng chọn học sinh và dị ứng');
      return;
    }
    
    try {
      setAddingAllergy(true);
      
      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        studentId: selectedChild.id,
        allergenId: selectedAllergenId,
        reaction: values.reaction || '',
        severity: values.severity || 1,
        lifeThreatening: values.lifeThreatening === true
      };
      
      console.log('Dữ liệu gửi đi:', requestData);
      
      // Gọi API thêm dị ứng
      const response = await axios.post(
        'http://localhost:8080/api/medicalProfiles/add-allergy-to-profile',
        requestData
      );
      
      console.log('Kết quả thêm dị ứng:', response.data);
      
      message.success('Thêm dị ứng thành công');
      setAllergyModalVisible(false);
      
      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi thêm dị ứng:', error);
      
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message || 'Không thể thêm dị ứng'}`);
      } else {
        message.error('Không thể thêm dị ứng. Vui lòng thử lại sau!');
      }
    } finally {
      setAddingAllergy(false);
    }
  };

  // Hàm xử lý khi người dùng gửi form chỉnh sửa dị ứng
  const handleEditAllergy = async (values) => {
    if (!currentAllergyId) {
      message.warning('Không tìm thấy thông tin dị ứng cần chỉnh sửa');
      return;
    }
    
    try {
      setEditingAllergy(true);
      
      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        studentAllergyId: currentAllergyId,
        reaction: values.reaction || '',
        severity: values.severity || 1,
        lifeThreatening: values.lifeThreatening === true
      };
      
      console.log('Dữ liệu chỉnh sửa dị ứng:', requestData);
      console.log('ID dị ứng gửi đi (studentAllergyId):', currentAllergyId);
      
      // Gọi API cập nhật dị ứng
      const response = await axios.put(
        'http://localhost:8080/api/medicalProfiles/allergy/update',
        requestData
      );
      
      console.log('Kết quả cập nhật dị ứng:', response.data);
      
      message.success('Cập nhật dị ứng thành công');
      setEditAllergyModalVisible(false);
      
      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi cập nhật dị ứng:', error);
      
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật dị ứng'}`);
      } else {
        message.error('Không thể cập nhật dị ứng. Vui lòng thử lại sau!');
      }
    } finally {
      setEditingAllergy(false);
    }
  };

  // Hàm xử lý khi người dùng gửi form chỉnh sửa bệnh lý
  const handleEditDisease = async (values) => {
    if (!currentDiseaseId) {
      message.warning('Không tìm thấy thông tin bệnh lý cần chỉnh sửa');
      return;
    }
    
    try {
      setEditingDisease(true);
      
      // Chuẩn bị dữ liệu để gửi đi - sử dụng đúng định dạng mà API yêu cầu
      const requestData = {
        "id": Number(currentDiseaseId),  // Thêm trường id
        "studentDiseaseId": Number(currentDiseaseId),  // Đảm bảo ID là số
        "severity": values.severity || 1
      };
      
      console.log('Dữ liệu chỉnh sửa bệnh lý:', JSON.stringify(requestData));
      
      // Gọi API cập nhật bệnh lý
      const response = await axios({
        method: 'put',
        url: 'http://localhost:8080/api/medicalProfiles/disease/update',
        data: requestData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Kết quả cập nhật bệnh lý:', response.data);
      
      message.success('Cập nhật bệnh lý thành công');
      setEditDiseaseModalVisible(false);
      
      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi cập nhật bệnh lý:', error);
      
      if (error.response && error.response.data) {
        console.error('Chi tiết lỗi:', error.response.data);
        message.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật bệnh lý'}`);
      } else {
        message.error('Không thể cập nhật bệnh lý. Vui lòng thử lại sau!');
      }
    } finally {
      setEditingDisease(false);
    }
  };

  // Hàm xử lý khi người dùng gửi form chỉnh sửa hội chứng
  const handleEditCondition = async (values) => {
    if (!currentConditionId) {
      message.warning('Không tìm thấy thông tin hội chứng cần chỉnh sửa');
      return;
    }

    try {
      setEditingCondition(true);

      // Chuẩn bị dữ liệu để gửi đi - sử dụng đúng định dạng mà API yêu cầu
      const requestData = {
        "id": Number(currentConditionId),  // Đảm bảo ID là số
        "note": values.note || ""
      };

      console.log('Dữ liệu chỉnh sửa hội chứng:', JSON.stringify(requestData));

      // Gọi API cập nhật hội chứng
      const response = await axios({
        method: 'put',
        url: 'http://localhost:8080/api/medicalProfiles/condition/update',
        data: requestData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Kết quả cập nhật hội chứng:', response.data);

      message.success('Cập nhật hội chứng thành công');
      setEditConditionModalVisible(false);

      // Cập nhật lại thông tin sức khỏe
      fetchMedicalProfile(selectedChild.id);
    } catch (error) {
      console.error('Lỗi khi cập nhật hội chứng:', error);

      if (error.response && error.response.data) {
        console.error('Chi tiết lỗi:', error.response.data);
        message.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật hội chứng'}`);
      } else {
        message.error('Không thể cập nhật hội chứng. Vui lòng thử lại sau!');
      }
    } finally {
      setEditingCondition(false);
    }
  };

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Lỗi khi tính tuổi:', error);
      return 'N/A';
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày tháng:', error);
      return null;
    }
  };

  const handleChildChange = (childId) => {
    const selected = children.find(child => child.id === childId);
    if (selected) {
      setSelectedChild(selected);
      fetchMedicalProfile(childId);
    }
  };

  // Hàm lấy tên dị ứng từ ID
  const getAllergenName = (allergenId) => {
    const allergen = allergens.find(a => a.allergenId === allergenId);
    return allergen ? allergen.name : 'Không xác định';
  };

  // Hàm lấy tên hội chứng từ ID
  const getConditionName = (conditionId) => {
    const syndrome = syndromes.find(s => s.conditionId === conditionId);
    return syndrome ? syndrome.name : 'Không xác định';
  };

  // Hàm lấy tên bệnh từ ID
  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find(d => d.diseaseId === diseaseId);
    return disease ? disease.name : 'Không xác định';
  };

  // Hàm render danh sách dị ứng
  const renderAllergies = () => {
    if (!medicalProfile || !medicalProfile.allergies || medicalProfile.allergies.length === 0) {
      return <Empty description="Không có dị ứng" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.allergies}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => showEditAllergyModal(item)}
              >
                Chỉnh sửa
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<AlertOutlined style={{ color: '#f5222d', fontSize: '24px' }} />}
              title={item.allergenName || getAllergenName(item.allergenId)}
              description={
                <div>
                  <div>Mức độ: {item.severity === 1 ? 'Nhẹ' : item.severity === 2 ? 'Trung bình' : 'Nặng'}</div>
                  {item.reaction && <div>Phản ứng: {item.reaction}</div>}
                  {item.lifeThreatening && <Tag color="red">Nguy hiểm đến tính mạng</Tag>}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render danh sách hội chứng
  const renderConditions = () => {
    if (!medicalProfile || !medicalProfile.conditions || medicalProfile.conditions.length === 0) {
      return <Empty description="Không có hội chứng" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.conditions}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => showEditConditionModal(item)}
              >
                Chỉnh sửa
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<BugOutlined style={{ color: '#722ed1', fontSize: '24px' }} />}
              title={item.conditionName || getConditionName(item.conditionId)}
              description={item.note && <div>Ghi chú: {item.note}</div>}
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render danh sách bệnh
  const renderDiseases = () => {
    if (!medicalProfile || !medicalProfile.diseases || medicalProfile.diseases.length === 0) {
      return <Empty description="Không có bệnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.diseases}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => showEditDiseaseModal(item)}
              >
                Chỉnh sửa
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<MedicineBoxTwoTone twoToneColor="#eb2f96" style={{ fontSize: '24px' }} />}
              title={item.diseaseName || getDiseaseName(item.diseaseId)}
              description={
                <div>
                  <div>Từ ngày: {item.sinceDate}</div>
                  <div>Mức độ: {item.severity === 1 ? 'Nhẹ' : item.severity === 2 ? 'Trung bình' : 'Nặng'}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render thông tin sức khỏe cơ bản
  const renderBasicHealthData = () => {
    if (!medicalProfile || !medicalProfile.basicHealthData) {
      return <Empty description="Không có thông tin sức khỏe cơ bản" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    const basicData = medicalProfile.basicHealthData;
    
    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Chiều cao">{basicData.heightCm} cm</Descriptions.Item>
        <Descriptions.Item label="Cân nặng">{basicData.weightKg} kg</Descriptions.Item>
        <Descriptions.Item label="Thị lực (mắt trái)">{basicData.visionLeft}</Descriptions.Item>
        <Descriptions.Item label="Thị lực (mắt phải)">{basicData.visionRight}</Descriptions.Item>
        <Descriptions.Item label="Tình trạng thính giác">
          {basicData.hearingStatus === 'normal' ? 'Bình thường' : 'Suy giảm'}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {basicData.gender === 'male' ? 'Nam' : 'Nữ'}
        </Descriptions.Item>
        <Descriptions.Item label="Nhóm máu">{basicData.bloodType}</Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">{basicData.lastMeasured}</Descriptions.Item>
      </Descriptions>
    );
  };

  if (loading) {
    return (
      <Card className="user-profile-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (children.length === 0) {
    return (
      <Card 
        className="user-profile-card"
        title={
          <div className="user-profile-header">
            <TeamOutlined className="user-profile-icon" />
            <Title level={4} className="user-profile-title">Thông tin học sinh</Title>
          </div>
        }
      >
        <Empty 
          description="Không có thông tin học sinh" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Card>
    );
  }

  return (
    <Card 
      className="user-profile-card"
      title={
        <div className="user-profile-header">
          <TeamOutlined className="user-profile-icon" />
          <Title level={4} className="user-profile-title">Thông tin học sinh</Title>
        </div>
      }
      extra={
        <Select
          style={{ width: 200 }}
          placeholder="Chọn học sinh"
          value={selectedChild?.id}
          onChange={handleChildChange}
        >
          {children.map(child => (
            <Option key={child.id} value={child.id}>{child.name}</Option>
          ))}
        </Select>
      }
    >
      {selectedChild && (
        <div className="child-info-container">
          <div className="child-info-header">
            <Avatar 
              size={80} 
              icon={<UserOutlined />} 
              src={selectedChild.avatar} 
              className="child-avatar"
            />
            <div className="child-basic-info">
              <Title level={4}>{selectedChild.name}</Title>
              <Text>Lớp {selectedChild.grade} - {selectedChild.class}</Text>
              <Text type="secondary">{selectedChild.school}</Text>
            </div>
          </div>

          <Tabs defaultActiveKey="1" className="child-info-tabs">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ và tên">{selectedChild.name}</Descriptions.Item>
                <Descriptions.Item label="Tuổi">{selectedChild.age}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{selectedChild.birthdate}</Descriptions.Item>
                <Descriptions.Item label="Lớp">{`${selectedChild.grade} - ${selectedChild.class}`}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Thông tin sức khỏe" key="2">
              {loadingMedical ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải thông tin sức khỏe..." />
                </div>
              ) : medicalProfile ? (
                <Tabs defaultActiveKey="basic" type="card">
                  <TabPane tab="Thông tin cơ bản" key="basic">
                    {renderBasicHealthData()}
                  </TabPane>
                  <TabPane tab="Vấn đề sức khỏe" key="healthIssues">
                    <div className="health-issues-container">
                      <div className="health-issues-section">
                        <div className="health-issues-header">
                          <Title level={5}>Dị ứng</Title>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            size="small"
                            onClick={showAddAllergyModal}
                          >
                            Thêm dị ứng
                          </Button>
                        </div>
                        {renderAllergies()}
                      </div>
                      <div className="health-issues-section">
                        <div className="health-issues-header">
                          <Title level={5}>Hội chứng</Title>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            size="small"
                            onClick={showAddConditionModal}
                          >
                            Thêm hội chứng
                          </Button>
                        </div>
                        {renderConditions()}
                      </div>
                      <div className="health-issues-section">
                        <div className="health-issues-header">
                          <Title level={5}>Bệnh</Title>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            size="small"
                            onClick={showAddDiseaseModal}
                          >
                            Thêm bệnh
                          </Button>
                        </div>
                        {renderDiseases()}
                      </div>
                    </div>
                  </TabPane>
                </Tabs>
              ) : (
                <Empty description="Không có thông tin sức khỏe" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </TabPane>
            
            <TabPane tab="Tiêm chủng" key="3">
              {loadingMedical ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải thông tin tiêm chủng..." />
                </div>
              ) : medicalProfile && medicalProfile.active ? (
                <div className="vaccination-info">
                  <div className="vaccination-status-complete">
                    <MedicineBoxOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <Text strong style={{ marginLeft: '10px', fontSize: '16px' }}>Đã hoàn thành tất cả các mũi tiêm chủng cần thiết</Text>
                  </div>
                </div>
              ) : (
                <Empty description="Không có thông tin tiêm chủng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </TabPane>
          </Tabs>

          {/* Modal thêm bệnh lý */}
          <Modal
            title="Thêm bệnh lý"
            open={diseaseModalVisible}
            onCancel={() => setDiseaseModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={diseaseForm}
              layout="vertical"
              onFinish={handleAddDisease}
            >
              <Form.Item
                name="diseaseId"
                label="Chọn bệnh lý"
                rules={[{ required: true, message: 'Vui lòng chọn bệnh lý!' }]}
              >
                <Select
                  placeholder="Chọn bệnh lý"
                  onChange={handleDiseaseChange}
                  loading={loadingReference}
                >
                  {diseases.map(disease => (
                    <Option key={disease.diseaseId} value={disease.diseaseId}>
                      {disease.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="sinceDate"
                label="Từ ngày"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
              >
                <DatePicker 
                  format="DD/MM/YYYY" 
                  placeholder="Chọn ngày"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item
                name="severity"
                label="Mức độ"
                initialValue={1}
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Nhẹ</Radio>
                  <Radio value={2}>Trung bình</Radio>
                  <Radio value={3}>Nặng</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setDiseaseModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={addingDisease}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal thêm hội chứng */}
          <Modal
            title="Thêm hội chứng"
            open={conditionModalVisible}
            onCancel={() => setConditionModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={conditionForm}
              layout="vertical"
              onFinish={handleAddCondition}
            >
              <Form.Item
                name="conditionId"
                label="Chọn hội chứng"
                rules={[{ required: true, message: 'Vui lòng chọn hội chứng!' }]}
              >
                <Select
                  placeholder="Chọn hội chứng"
                  onChange={handleConditionChange}
                  loading={loadingReference}
                >
                  {syndromes.map(syndrome => (
                    <Option key={syndrome.conditionId} value={syndrome.conditionId}>
                      {syndrome.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="note"
                label="Ghi chú (nếu có)"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setConditionModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={addingCondition}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal thêm dị ứng */}
          <Modal
            title="Thêm dị ứng"
            open={allergyModalVisible}
            onCancel={() => setAllergyModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={allergyForm}
              layout="vertical"
              onFinish={handleAddAllergy}
            >
              <Form.Item
                name="allergenId"
                label="Chọn dị ứng"
                rules={[{ required: true, message: 'Vui lòng chọn dị ứng!' }]}
              >
                <Select
                  placeholder="Chọn dị ứng"
                  onChange={handleAllergenChange}
                  loading={loadingReference}
                >
                  {allergens.map(allergen => (
                    <Option key={allergen.allergenId} value={allergen.allergenId}>
                      {allergen.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="reaction"
                label="Phản ứng (nếu có)"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              
              <Form.Item
                name="severity"
                label="Mức độ"
                initialValue={1}
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Nhẹ</Radio>
                  <Radio value={2}>Trung bình</Radio>
                  <Radio value={3}>Nặng</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="lifeThreatening"
                label="Nguy hiểm đến tính mạng"
                initialValue={false}
              >
                <Radio.Group>
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setAllergyModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={addingAllergy}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal chỉnh sửa dị ứng */}
          <Modal
            title="Chỉnh sửa dị ứng"
            open={editAllergyModalVisible}
            onCancel={() => setEditAllergyModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={editAllergyForm}
              layout="vertical"
              onFinish={handleEditAllergy}
            >
              <Form.Item
                name="reaction"
                label="Phản ứng (nếu có)"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              
              <Form.Item
                name="severity"
                label="Mức độ"
                initialValue={1}
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Nhẹ</Radio>
                  <Radio value={2}>Trung bình</Radio>
                  <Radio value={3}>Nặng</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="lifeThreatening"
                label="Nguy hiểm đến tính mạng"
                initialValue={false}
              >
                <Radio.Group>
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setEditAllergyModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={editingAllergy}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal chỉnh sửa bệnh lý */}
          <Modal
            title="Chỉnh sửa bệnh lý"
            open={editDiseaseModalVisible}
            onCancel={() => setEditDiseaseModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={editDiseaseForm}
              layout="vertical"
              onFinish={handleEditDisease}
            >
              <Form.Item
                name="severity"
                label="Mức độ"
                initialValue={1}
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Nhẹ</Radio>
                  <Radio value={2}>Trung bình</Radio>
                  <Radio value={3}>Nặng</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setEditDiseaseModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={editingDisease}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal chỉnh sửa hội chứng */}
          <Modal
            title="Chỉnh sửa hội chứng"
            open={editConditionModalVisible}
            onCancel={() => setEditConditionModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={editConditionForm}
              layout="vertical"
              onFinish={handleEditCondition}
            >
              <Form.Item
                name="note"
                label="Ghi chú (nếu có)"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              
              <Form.Item className="form-buttons">
                <Button 
                  type="default" 
                  onClick={() => setEditConditionModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={editingCondition}
                >
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </Card>
  );
};

export default ChildrenInfo; 