import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminDashboard.css";

const roleList = [
  { id: 1, label: "Admin" },
  { id: 2, label: "Parent" },
  { id: 3, label: "Nurse" },
  { id: 4, label: "Student" },
];

const AdminDashboard = () => {
  // State cho import account
  const [importResult, setImportResult] = useState(null);
  const [loadingImport, setLoadingImport] = useState(false);

  // State cho dashboard
  const [stats, setStats] = useState({
    totalAccounts: 0,
    accountsByRole: {},
    totalMedications: 0,
    lowStockMedications: 0,
    totalVaccinationRecords: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Hàm import account
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoadingImport(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/v1/accounts/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportResult(data);
    } catch (err) {
      setImportResult({ error: "Import failed!" });
    } finally {
      setLoadingImport(false);
    }
  };

  // Hàm fetch thống kê dashboard
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // 1. Tổng số tài khoản
        const resAccounts = await fetch("/api/v1/accounts?page=0&size=1");
        const dataAccounts = await resAccounts.json();
        const totalAccounts = dataAccounts?.totalElements || 0;

        // 2. Số tài khoản theo từng role
        const accountsByRole = {};
        for (const role of roleList) {
          const resRole = await fetch(`/api/v1/accounts/search-sort-by-role?roleId=${role.id}&page=0&size=1`);
          const dataRole = await resRole.json();
          accountsByRole[role.label] = dataRole?.totalElements || 0;
        }

        // 3. Tổng số thuốc
        const resMeds = await fetch("/api/v1/medications");
        const dataMeds = await resMeds.json();
        const totalMedications = Array.isArray(dataMeds?.data) ? dataMeds.data.length : 0;

        // 4. Số thuốc sắp hết
        const resLowStock = await fetch("/api/v1/medications/low-stock?threshold=10");
        const dataLowStock = await resLowStock.json();
        const lowStockMedications = Array.isArray(dataLowStock?.data) ? dataLowStock.data.length : 0;

        // 5. Tổng số lượt tiêm chủng
        const resVacc = await fetch("/api/v1/vaccination-records");
        const dataVacc = await resVacc.json();
        const totalVaccinationRecords = Array.isArray(dataVacc?.data) ? dataVacc.data.length : 0;

        setStats({
          totalAccounts,
          accountsByRole,
          totalMedications,
          lowStockMedications,
          totalVaccinationRecords,
        });
      } catch (err) {
        setStats({
          totalAccounts: 0,
          accountsByRole: {},
          totalMedications: 0,
          lowStockMedications: 0,
          totalVaccinationRecords: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader />
        <div className="admin-content">
          <h2>Admin Dashboard</h2>
          {/* Thống kê tổng quan */}
          <div className="dashboard-stats">
            {loadingStats ? (
              <div>Đang tải thống kê...</div>
            ) : (
              <>
                <div className="dashboard-stat-card">
                  <div className="stat-title">Tổng số tài khoản</div>
                  <div className="stat-value">{stats.totalAccounts}</div>
                </div>
                {roleList.map((role) => (
                  <div className="dashboard-stat-card" key={role.id}>
                    <div className="stat-title">{role.label}</div>
                    <div className="stat-value">{stats.accountsByRole[role.label]}</div>
                  </div>
                ))}
                <div className="dashboard-stat-card">
                  <div className="stat-title">Tổng số thuốc</div>
                  <div className="stat-value">{stats.totalMedications}</div>
                </div>
                <div className="dashboard-stat-card">
                  <div className="stat-title">Thuốc sắp hết</div>
                  <div className="stat-value" style={{ color: stats.lowStockMedications > 0 ? 'red' : 'inherit' }}>{stats.lowStockMedications}</div>
                </div>
                <div className="dashboard-stat-card">
                  <div className="stat-title">Tổng lượt tiêm chủng</div>
                  <div className="stat-value">{stats.totalVaccinationRecords}</div>
                </div>
              </>
            )}
          </div>
          {/* Import account */}
          <div className="import-section">
            <label htmlFor="import-file" className="import-btn">
              Import Accounts
            </label>
            <input
              id="import-file"
              type="file"
              style={{ display: "none" }}
              onChange={handleImport}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            {loadingImport && <p>Importing...</p>}
            {importResult && (
              <div className="import-result">
                {importResult.error ? (
                  <p style={{ color: "red" }}>{importResult.error}</p>
                ) : (
                  <>
                    <p>
                      Total: {importResult.totalProcessed} | Success: {importResult.successCount} | Failure: {importResult.failureCount}
                    </p>
                    {importResult.results && importResult.results.length > 0 && (
                      <ul>
                        {importResult.results.map((r, idx) => (
                          <li key={idx} style={{ color: r.success ? "green" : "red" }}>
                            {r.email} - {r.success ? "Success" : r.errorMessage}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 