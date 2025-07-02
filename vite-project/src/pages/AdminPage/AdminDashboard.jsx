import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader />
        <div className="admin-content">
          <h2>Admin Dashboard</h2>
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
            {loading && <p>Importing...</p>}
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